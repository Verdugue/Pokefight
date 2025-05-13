import express from 'express';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// File d'attente en mémoire
const waitingPlayers: { userId: number, username: string, team: any[] }[] = [];
// Matches en cours (en mémoire pour la logique, BDD pour la persistance)
const activeMatches: { [matchId: number]: { players: number[], choices: { [userId: number]: { moveId: number, pokemonId: number } }, logs: any[], initialActive: { [userId: number]: boolean }, currentPlayer: number | null, order?: number[] } } = {};

// Utilitaires à compléter selon ton projet
async function getUserTeam(userId: number) {
  // On ne prend que les Pokémon de l'équipe (présents dans team_pokemon)
  const [team] = await pool.query(
    `SELECT up.*, tp.slot FROM user_pokemon up
     JOIN team_pokemon tp ON tp.user_id = up.user_id AND tp.pokemon_id = up.pokemon_id
     WHERE tp.user_id = ?
     ORDER BY tp.slot ASC`,
    [userId]
  );
  return team as any[];
}
async function getPokemonMoves(userPokemonId: number, level: number) {
  const [moves] = await pool.query(
    `SELECT m.* FROM moves m
     JOIN pokemon_moves pm ON m.id = pm.move_id
     WHERE pm.pokemon_id = ?`,
    [userPokemonId]
  );
  return moves as any[];
}

// Rejoindre la file d'attente
router.post('/queue', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const username = req.user!.username;
  // Récupérer l'équipe du joueur
  const team = await getUserTeam(userId);
  if (!team || team.length === 0) {
      return res.status(400).json({ error: 'Vous devez avoir une équipe pour combattre' });
    }
  // Ajouter à la file si pas déjà présent
  if (!waitingPlayers.find(p => p.userId === userId)) {
    waitingPlayers.push({ userId, username, team });
  }
    // Chercher un adversaire
  if (waitingPlayers.length >= 2) {
    const [p1, p2] = waitingPlayers.splice(0, 2);
    // Créer un match en BDD (à compléter)
    const [result] = await pool.query('INSERT INTO matches (player1_id, player2_id, status) VALUES (?, ?, ?)', [p1.userId, p2.userId, 'in_progress']);
    const matchId = (result as any).insertId;
    // Stocker en mémoire
    activeMatches[matchId] = { players: [p1.userId, p2.userId], choices: {}, logs: [], initialActive: { [p1.userId]: false, [p2.userId]: false }, currentPlayer: null };
    // Insérer les Pokémon de chaque joueur dans match_pokemon
    for (const poke of p1.team) {
      await pool.query(
        'INSERT INTO match_pokemon (match_id, user_id, pokemon_id, current_hp, is_alive, user_pokemon_id, max_hp, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [matchId, p1.userId, poke.pokemon_id, poke.max_hp, true, poke.id, poke.max_hp, poke.level]
      );
    }
    for (const poke of p2.team) {
      await pool.query(
        'INSERT INTO match_pokemon (match_id, user_id, pokemon_id, current_hp, is_alive, user_pokemon_id, max_hp, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [matchId, p2.userId, poke.pokemon_id, poke.max_hp, true, poke.id, poke.max_hp, poke.level]
      );
    }
    return res.json({ matchFound: true, matchId });
  }
  res.json({ matchFound: false });
});

// Quitter la file d'attente
router.post('/queue/leave', authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const idx = waitingPlayers.findIndex(p => p.userId === userId);
  if (idx !== -1) waitingPlayers.splice(idx, 1);
  res.json({ success: true });
});

// Récupérer l'état du match
router.get('/match/:matchId', authenticateToken, async (req: AuthRequest, res) => {
  const matchId = Number(req.params.matchId);
  const userId = req.user!.id;

  // Exemple : récupération en mémoire (à adapter si tu veux persister en BDD)
  const match = activeMatches[matchId];
  if (!match) {
    // Renvoie un statut spécial au lieu d'une 404
    return res.json({ status: 'ended', isCombatEnded: true });
  }

  const [pokemons] = await pool.query(
    `SELECT mp.*, p.name, p.sprite_url, p.speed
     FROM match_pokemon mp
     JOIN pokemon p ON mp.pokemon_id = p.id
     WHERE mp.match_id = ?`,
    [matchId]
  );
  const pokemonsArray = pokemons as any[];
  // Sépare les équipes par user_id
  const playerTeam = pokemonsArray.filter((p: any) => p.user_id === userId);
  const opponentTeam = pokemonsArray.filter((p: any) => p.user_id !== userId);
  // Prends le Pokémon actif (is_active === 1)
  const playerPokemon = playerTeam.find((p: any) => p.is_active === 1);
  const opponentPokemon = opponentTeam.find((p: any) => p.is_active === 1);

  // Récupère les attaques du Pokémon actif du joueur
  if (playerPokemon) {
    playerPokemon.moves = await getPokemonMoves(playerPokemon.user_pokemon_id, playerPokemon.level) || [];
  }
  // Récupère les attaques du Pokémon actif adverse
  if (opponentPokemon) {
    opponentPokemon.moves = await getPokemonMoves(opponentPokemon.user_pokemon_id, opponentPokemon.level) || [];
  }

  // Les deux joueurs doivent avoir choisi leur Pokémon actif pour commencer le combat
  const bothActiveChosen = match.initialActive &&
    playerTeam.some((p: any) => p.is_active === 1) &&
    opponentTeam.some((p: any) => p.is_active === 1);

  // Nouvelle logique de fin de combat : toute l'équipe KO
  const playerHasAlivePokemon = playerTeam.some((p: any) => p.is_alive);
  const opponentHasAlivePokemon = opponentTeam.some((p: any) => p.is_alive);
  const isCombatEnded = bothActiveChosen && (!playerHasAlivePokemon || !opponentHasAlivePokemon);

  res.json({
    playerPokemon: playerPokemon || null,
    opponentPokemon: opponentPokemon || null,
    playerTeam,
    opponentTeam,
    combatLog: match.logs,
    isPlayerTurn: !isCombatEnded && match.currentPlayer === userId,
    isCombatEnded,
    status: isCombatEnded ? 'ended' : 'ongoing',
    isWaitingForOpponent: !bothActiveChosen
  });
});

// Jouer une attaque
router.post('/match/:matchId/move', authenticateToken, async (req: AuthRequest, res) => {
  const matchId = Number(req.params.matchId);
  const userId = req.user!.id;
  const { moveId, pokemonId } = req.body;

  const match = activeMatches[matchId];
  if (!match) return res.status(404).json({ error: 'Match not found' });

  // Vérifie que c'est bien à ce joueur de jouer
  if (match.currentPlayer !== userId) {
    return res.status(403).json({ error: 'Ce n\'est pas à vous de jouer' });
  }

  // Récupère le Pokémon actif du joueur
  const [pokemons] = await pool.query(
    `SELECT mp.*, p.name, p.sprite_url, p.speed
     FROM match_pokemon mp
     JOIN pokemon p ON mp.pokemon_id = p.id
     WHERE mp.match_id = ? AND mp.user_id = ? AND mp.is_active = 1`,
    [matchId, userId]
  );
  const pokemonsArray = pokemons as any[];
  let poke = pokemonsArray[0];
  
  // Récupère la vitesse
  const speed = poke.speed || 1;
  
  // Récupère les attaques
  const [moveArr] = await pool.query('SELECT * FROM moves WHERE id = ?', [moveId]);
  const move = (moveArr as any[])[0];
  
  // Applique la première attaque
  let logs = [];
  let damage = move.power || 10;
  poke.current_hp = Math.max(0, poke.current_hp - damage);
  logs.push({ text: `${poke.name} utilise ${move.name} et inflige ${damage} dégâts à ${poke.name} !`, color: '#66bb6a' });
  if (poke.current_hp <= 0) {
    poke.is_alive = false;
    logs.push({ text: `${poke.name} est KO !`, color: '#e53935' });
  }
  
  // Mets à jour la BDD avec les nouveaux PV et statut
  await pool.query(
    'UPDATE match_pokemon SET current_hp = ?, is_alive = ? WHERE match_id = ? AND user_id = ? AND is_active = 1',
    [poke.current_hp, poke.is_alive, matchId, userId]
  );
  
  // Passe le tour à l'autre joueur
  const otherPlayer = match.players.find(p => p !== userId) ?? null;
  match.currentPlayer = otherPlayer;
  
  // Mets à jour les logs
  match.logs.push(...logs);
  
  // Renvoie le nouvel état du match
  res.json({
    playerPokemon: poke,
    opponentPokemon: otherPlayer
      ? pokemonsArray.find((p: any) => p.user_id === otherPlayer && p.is_active === 1)
      : null,
    playerTeam: pokemonsArray.filter((p: any) => p.user_id === userId),
    opponentTeam: pokemonsArray.filter((p: any) => p.user_id !== userId),
    combatLog: match.logs,
    isPlayerTurn: match.currentPlayer === userId,
    isCombatEnded: !poke.is_alive,
    status: !poke.is_alive ? 'ended' : 'ongoing'
  });
});

// Vérifie si l'utilisateur a un match en cours
router.get('/active', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const [rows] = await pool.query(
    'SELECT id FROM matches WHERE (player1_id = ? OR player2_id = ?) AND status = "in_progress" ORDER BY id DESC LIMIT 1',
    [userId, userId]
  );
  if ((rows as any[]).length > 0) {
    res.json({ matchId: (rows as any[])[0].id });
  } else {
    res.json({ matchId: null });
  }
});

router.post('/match/:matchId/choose-active', authenticateToken, async (req: AuthRequest, res) => {
  const matchId = Number(req.params.matchId);
  const userId = req.user!.id;
  const { userPokemonId } = req.body;

  // Met tous les Pokémon du joueur à inactif
  await pool.query('UPDATE match_pokemon SET is_active = 0 WHERE match_id = ? AND user_id = ?', [matchId, userId]);
  // Met le Pokémon choisi à actif
  const [rows] = await pool.query(
    'SELECT is_alive FROM match_pokemon WHERE match_id = ? AND user_id = ? AND user_pokemon_id = ?',
    [matchId, userId, userPokemonId]
  );
  const result = rows as { is_alive: number }[];
  if (!result.length || !result[0].is_alive) {
    return res.status(400).json({ error: 'Impossible de choisir un Pokémon KO' });
  }
  await pool.query(
    'UPDATE match_pokemon SET is_active = 1 WHERE match_id = ? AND user_id = ? AND user_pokemon_id = ?',
    [matchId, userId, userPokemonId]
  );

  // Marque le choix initial comme fait
  if (activeMatches[matchId]) {
    activeMatches[matchId].initialActive[userId] = true;

    // Si les deux joueurs ont choisi, on démarre le combat et on choisit qui commence
    if (!activeMatches[matchId].order) {
      activeMatches[matchId].order = [];
    }
    if (!activeMatches[matchId].order.includes(userId)) {
      activeMatches[matchId].order.push(userId);
    }
    const bothChosen = Object.values(activeMatches[matchId].initialActive).every(Boolean);
    if (
      bothChosen &&
      !activeMatches[matchId].currentPlayer &&
      activeMatches[matchId].order &&
      activeMatches[matchId].order.length > 0
    ) {
      activeMatches[matchId].currentPlayer = activeMatches[matchId].order[0];
    }
  }

  res.json({ success: true });
});

async function chooseActivePokemon(userPokemonId: number) {
  // ...
}

export default router;



