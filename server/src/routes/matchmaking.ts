import express from 'express';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// File d'attente en mémoire
const waitingPlayers: { userId: number, username: string, team: any[] }[] = [];
// Matches en cours (en mémoire pour la logique, BDD pour la persistance)
const activeMatches: { [matchId: number]: { players: number[], choices: { [userId: number]: { moveId: number, pokemonId: number } }, logs: any[], initialActive: { [userId: number]: boolean } } } = {};

// Utilitaires à compléter selon ton projet
async function getUserTeam(userId: number) {
  const [team] = await pool.query(
    'SELECT * FROM user_pokemon WHERE user_id = ?',
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
    activeMatches[matchId] = { players: [p1.userId, p2.userId], choices: {}, logs: [], initialActive: { [p1.userId]: false, [p2.userId]: false } };
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
    isPlayerTurn: true, // à améliorer si tu veux une vraie gestion du tour
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
  if (!activeMatches[matchId]) return res.status(404).json({ error: 'Match not found' });
  activeMatches[matchId].choices[userId] = { moveId, pokemonId };

  const match = activeMatches[matchId];
  if (Object.keys(match.choices).length === 2) {
    const [p1, p2] = match.players;
    const p1Choice = match.choices[p1];
    const p2Choice = match.choices[p2];
    
    // Récupère les Pokémon actifs depuis la BDD
    const [pokemons] = await pool.query(
      `SELECT mp.*, p.name, p.sprite_url, p.speed
       FROM match_pokemon mp
       JOIN pokemon p ON mp.pokemon_id = p.id
       WHERE mp.match_id = ?`,
      [matchId]
    );
    const pokemonsArray = pokemons as any[];
    let poke1 = pokemonsArray.find((p: any) => p.user_id === p1 && p.is_active === 1);
    let poke2 = pokemonsArray.find((p: any) => p.user_id === p2 && p.is_active === 1);
    
    // Récupère la vitesse
    const speed1 = poke1?.speed || 1;
    const speed2 = poke2?.speed || 1;
    
    // Récupère les attaques
    const [move1Arr] = await pool.query('SELECT * FROM moves WHERE id = ?', [p1Choice.moveId]);
    const [move2Arr] = await pool.query('SELECT * FROM moves WHERE id = ?', [p2Choice.moveId]);
    const move1 = (move1Arr as any[])[0];
    const move2 = (move2Arr as any[])[0];
    
    // Détermine l'ordre
    let first, second, firstMove, secondMove, firstUser, secondUser;
    if (speed1 >= speed2) {
      first = poke1; firstMove = move1; firstUser = p1;
      second = poke2; secondMove = move2; secondUser = p2;
    } else {
      first = poke2; firstMove = move2; firstUser = p2;
      second = poke1; secondMove = move1; secondUser = p1;
    }
    
    // Applique la première attaque
    let logs = [];
    let damage1 = firstMove.power || 10;
    second.current_hp = Math.max(0, second.current_hp - damage1);
    logs.push({ text: `${first.name} utilise ${firstMove.name} et inflige ${damage1} dégâts à ${second.name} !`, color: '#66bb6a' });
    if (second.current_hp <= 0) {
      second.is_alive = false;
      logs.push({ text: `${second.name} est KO !`, color: '#e53935' });
    }
    
    // Si le second est encore en vie, il riposte
    if (second.current_hp > 0) {
      let damage2 = secondMove.power || 10;
      first.current_hp = Math.max(0, first.current_hp - damage2);
      logs.push({ text: `${second.name} utilise ${secondMove.name} et inflige ${damage2} dégâts à ${first.name} !`, color: '#66bb6a' });
      if (first.current_hp <= 0) {
        first.is_alive = false;
        logs.push({ text: `${first.name} est KO !`, color: '#e53935' });
      }
    }
    
    // Mets à jour la BDD avec les nouveaux PV et statut
    await pool.query(
      'UPDATE match_pokemon SET current_hp = ?, is_alive = ? WHERE match_id = ? AND user_id = ? AND is_active = 1',
      [first.current_hp, first.is_alive, matchId, firstUser]
    );
    await pool.query(
      'UPDATE match_pokemon SET current_hp = ?, is_alive = ? WHERE match_id = ? AND user_id = ? AND is_active = 1',
      [second.current_hp, second.is_alive, matchId, secondUser]
    );
    
    // Ajoute les logs
    match.logs.push(...logs);
    match.choices = {};
    
    // Récupère l'état complet du match pour la réponse
    const [pokemons2] = await pool.query(
      `SELECT mp.*, p.name, p.sprite_url, p.speed
       FROM match_pokemon mp
       JOIN pokemon p ON mp.pokemon_id = p.id
       WHERE mp.match_id = ?`,
      [matchId]
    );
    const pokemonsArray2 = pokemons2 as any[];
    const playerTeam = pokemonsArray2.filter((p: any) => p.user_id === userId);
    const opponentTeam = pokemonsArray2.filter((p: any) => p.user_id !== userId);
    
    // Vérifie si chaque joueur a encore des Pokémon vivants
    const playerHasAlivePokemon = playerTeam.some((p: any) => p.is_alive);
    const opponentHasAlivePokemon = opponentTeam.some((p: any) => p.is_alive);
    
    // Détermine si le combat est fini
    const isCombatEnded = !playerHasAlivePokemon || !opponentHasAlivePokemon;
    
    // Récupère le Pokémon actif du joueur
    const playerPokemon = playerTeam.find((p: any) => p.is_active === 1);
    const opponentPokemon = opponentTeam.find((p: any) => p.is_active === 1);

    // Vérifie si le joueur a besoin de choisir un nouveau Pokémon
    const needsPokemonSelection = !isCombatEnded && (
      // Si le joueur n'a pas de Pokémon actif
      !playerPokemon ||
      // Ou si son Pokémon actif est KO
      (playerPokemon && playerPokemon.current_hp <= 0)
    );

    // Si le joueur doit choisir un nouveau Pokémon, on met son Pokémon actif à null
    if (needsPokemonSelection) {
      await pool.query(
        'UPDATE match_pokemon SET is_active = 0 WHERE match_id = ? AND user_id = ?',
        [matchId, userId]
      );
    }
    
    // Détermine qui doit jouer ensuite
    // Si un joueur doit choisir un Pokémon, c'est à lui de jouer
    // Sinon, c'est au joueur qui n'a pas encore joué dans ce round
    const nextPlayer = isCombatEnded ? null : (
      needsPokemonSelection ? userId :
      (firstUser === p1 ? p2 : p1)
    );
    
    if (playerPokemon) {
      playerPokemon.moves = await getPokemonMoves(playerPokemon.user_pokemon_id, playerPokemon.level) || [];
    }
    if (opponentPokemon) {
      opponentPokemon.moves = await getPokemonMoves(opponentPokemon.user_pokemon_id, opponentPokemon.level) || [];
    }
    
    return res.json({
      playerPokemon: needsPokemonSelection ? null : playerPokemon,
      opponentPokemon: opponentPokemon || null,
      playerTeam,
      opponentTeam,
      combatLog: match.logs,
      isPlayerTurn: !isCombatEnded && nextPlayer === userId,
      isCombatEnded,
      status: isCombatEnded ? 'ended' : 'ongoing',
      needsPokemonSelection
    });
  }
  
  res.json({ waiting: true });
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
  await pool.query('UPDATE match_pokemon SET is_active = 1 WHERE match_id = ? AND user_id = ? AND user_pokemon_id = ?', [matchId, userId, userPokemonId]);

  // Marque le choix initial comme fait
  if (activeMatches[matchId]) {
    activeMatches[matchId].initialActive[userId] = true;
  }

  res.json({ success: true });
});

async function chooseActivePokemon(userPokemonId: number) {
  // ...
}

export default router;



