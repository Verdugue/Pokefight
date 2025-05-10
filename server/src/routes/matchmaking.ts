import express from 'express';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Map pour stocker les joueurs en attente
const waitingPlayers = new Map<number, WaitingPlayer>();
// Map pour stocker les connexions WebSocket des utilisateurs
const connectedUsers = new Map<number, any>();
const pendingMoves = new Map<number, { [userId: number]: { moveId: number, pokemonId: number } }>();

// Interface pour représenter un joueur en attente
interface WaitingPlayer {
  userId: number;
  username: string;
  team: any[];
  timestamp: number;
}

// Nettoyer les joueurs qui attendent depuis trop longtemps (plus de 5 minutes)
const cleanupWaitingPlayers = () => {
  const now = Date.now();
  for (const [userId, player] of waitingPlayers.entries()) {
    if (now - player.timestamp > 5 * 60 * 1000) {
      waitingPlayers.delete(userId);
    }
  }
};

// Exécuter le nettoyage toutes les minutes
setInterval(cleanupWaitingPlayers, 60 * 1000);

// Initialiser le service WebSocket
export const initializeWebSocket = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    console.log('Nouvelle connexion WebSocket');

    // Authentifier l'utilisateur
    socket.on('authenticate', (token: string) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
        const userId = decoded.id;
        
        // Stocker la connexion de l'utilisateur
        connectedUsers.set(userId, socket);
        
        console.log(`Utilisateur ${userId} connecté via WebSocket`);
      } catch (error) {
        console.error('Erreur d\'authentification WebSocket:', error);
      }
    });

    // Gérer la déconnexion
    socket.on('disconnect', () => {
      for (const [userId, userSocket] of connectedUsers.entries()) {
        if (userSocket === socket) {
          connectedUsers.delete(userId);
          waitingPlayers.delete(userId);
          console.log(`Utilisateur ${userId} déconnecté`);
          break;
        }
      }
    });
  });
};

// Rejoindre la file d'attente
router.post('/queue', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const username = req.user!.username;

  try {
    // Vérifier si le joueur a une équipe
    const [team] = await pool.query(
      'SELECT * FROM team_pokemon WHERE user_id = ?',
      [userId]
    );

    if (!team || (team as any[]).length === 0) {
      return res.status(400).json({ error: 'Vous devez avoir une équipe pour combattre' });
    }

    // Récupérer l'équipe du joueur
    const [playerTeam] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.type,
        up.level,
        up.hp,
        up.max_hp,
        up.is_starter,
        up.is_shiny,
        up.rarity,
        CASE 
          WHEN up.is_shiny THEN p.sprite_shiny_url
          ELSE p.sprite_url
        END as sprite_url
      FROM team_pokemon tp
      JOIN user_pokemon up ON tp.pokemon_id = up.pokemon_id AND tp.user_id = up.user_id
      JOIN pokemon p ON up.pokemon_id = p.id
      WHERE tp.user_id = ?
      ORDER BY tp.slot
    `, [userId]);

    const player: WaitingPlayer = {
      userId,
      username,
      team: playerTeam as any[],
      timestamp: Date.now()
    };

    // Ajouter le joueur à la file d'attente seulement s'il n'y est pas déjà
    if (!waitingPlayers.has(userId)) {
      waitingPlayers.set(userId, player);
    }

    // Chercher un adversaire
    const opponent = findOpponent(player);

    if (opponent) {
      console.log('Création du match entre', player.userId, 'et', opponent.userId);
      // Créer un match
      const matchId = await createMatch(player, opponent);

      // Envoyer la réponse aux deux joueurs
      const matchData = {
        matchFound: true,
        matchId,
        opponent: {
          username: opponent.username,
          team: opponent.team
        }
      };

      // Envoyer la réponse au joueur actuel
      res.json(matchData);

      // Envoyer la notification à l'adversaire via WebSocket
      const opponentSocket = connectedUsers.get(opponent.userId);
      if (opponentSocket) {
        opponentSocket.emit('matchFound', {
          matchId,
          opponent: {
            username: player.username,
            team: player.team
          }
        });
      }
    } else {
      res.json({ matchFound: false });
    }
  } catch (error) {
    console.error('Error joining queue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quitter la file d'attente
router.post('/queue/leave', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  waitingPlayers.delete(userId);
  res.json({ success: true });
});

// Trouver un adversaire
const findOpponent = (player: WaitingPlayer): WaitingPlayer | null => {
  for (const [id, waitingPlayer] of waitingPlayers.entries()) {
    if (id !== player.userId) {
      if (waitingPlayers.has(player.userId) && waitingPlayers.has(id)) {
        waitingPlayers.delete(player.userId);
        waitingPlayers.delete(id);
        return waitingPlayer;
      }
    }
  }
  return null;
};

// Créer un match
async function createMatch(player1: WaitingPlayer, player2: WaitingPlayer): Promise<number> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Créer le match
    const [result] = await connection.query(
      'INSERT INTO matches (player1_id, player2_id, status, current_player_id) VALUES (?, ?, ?, ?)',
      [player1.userId, player2.userId, 'in_progress', player1.userId]
    );

    const matchId = (result as any).insertId;

    // Récupérer les user_pokemon pour l'équipe du joueur
    const [player1Team] = await connection.query(
      'SELECT up.id as user_pokemon_id, up.pokemon_id FROM team_pokemon tp JOIN user_pokemon up ON tp.pokemon_id = up.pokemon_id AND tp.user_id = up.user_id WHERE tp.user_id = ?',
      [player1.userId]
    );

    const [player2Team] = await connection.query(
      'SELECT up.id as user_pokemon_id, up.pokemon_id FROM team_pokemon tp JOIN user_pokemon up ON tp.pokemon_id = up.pokemon_id AND tp.user_id = up.user_id WHERE tp.user_id = ?',
      [player2.userId]
    );

    // Insérer les Pokémon dans le match
    for (const pokemon of player1Team as any[]) {
      await connection.query(
        'INSERT INTO match_pokemon (match_id, user_id, pokemon_id, user_pokemon_id, current_hp) SELECT ?, ?, pokemon_id, id, max_hp FROM user_pokemon WHERE id = ?',
        [matchId, player1.userId, pokemon.user_pokemon_id]
      );
    }

    for (const pokemon of player2Team as any[]) {
      await connection.query(
        'INSERT INTO match_pokemon (match_id, user_id, pokemon_id, user_pokemon_id, current_hp) SELECT ?, ?, pokemon_id, id, max_hp FROM user_pokemon WHERE id = ?',
        [matchId, player2.userId, pokemon.user_pokemon_id]
      );
    }

    await connection.commit();
    return matchId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Obtenir l'état du match
router.get('/match/:matchId', authenticateToken, async (req: AuthRequest, res) => {
  const { matchId } = req.params;
  const userId = req.user!.id;

  try {
    const [match] = await pool.query(`
      SELECT 
        m.*,
        u1.username as player1_username,
        u2.username as player2_username
      FROM matches m
      JOIN users u1 ON m.player1_id = u1.id
      JOIN users u2 ON m.player2_id = u2.id
      WHERE m.id = ? AND (m.player1_id = ? OR m.player2_id = ?)
    `, [matchId, userId, userId]);

    if (!match || (match as RowDataPacket[]).length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const [pokemon] = await pool.query(`
      SELECT 
        mp.*,
        p.name,
        p.type,
        up.id as user_pokemon_id,
        CASE 
          WHEN up.is_shiny THEN p.sprite_shiny_url
          ELSE p.sprite_url
        END as sprite_url
      FROM match_pokemon mp
      JOIN pokemon p ON mp.pokemon_id = p.id
      JOIN user_pokemon up ON mp.user_pokemon_id = up.id
      WHERE mp.match_id = ?
    `, [matchId]);

    res.json({
      match: (match as RowDataPacket[])[0],
      pokemon: (pokemon as any[]).map(p => ({
        ...p,
        type: p.type.split(',').map((t: string) => t.trim())
      })),
      current_user_id: userId
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour vérifier si l'utilisateur a un match en cours
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

// Route pour gérer une attaque dans un combat
router.post('/match/:matchId/move', authenticateToken, async (req: AuthRequest, res) => {
  const { matchId } = req.params;
  const { moveId, pokemonId } = req.body;
  const userId = req.user!.id;

  // Stocker le choix du joueur
  if (!pendingMoves.has(Number(matchId))) {
    pendingMoves.set(Number(matchId), {});
  }
  pendingMoves.get(Number(matchId))![userId] = { moveId, pokemonId };

  // Vérifier si l'autre joueur a aussi choisi
  const moves = pendingMoves.get(Number(matchId));
  const [match] = await pool.query('SELECT * FROM matches WHERE id = ?', [matchId]);
  if (!match || (match as any[]).length === 0) {
    return res.status(404).json({ error: 'Match non trouvé' });
  }
  const currentMatch = (match as any[])[0];
  const player1 = currentMatch.player1_id;
  const player2 = currentMatch.player2_id;

  if (!moves || !moves[player1] || !moves[player2]) {
    // On attend l'autre joueur
    return res.json({ waiting: true, combatLog: [] });
  }

  // 1. Récupérer les infos des deux Pokémon et attaques
  const [pokemons] = await pool.query(
    `SELECT mp.*, p.name, p.type, p.sprite_url, up.id as user_pokemon_id, up.level, up.hp, up.max_hp, up.is_shiny, up.user_id as up_user_id
     FROM match_pokemon mp
     JOIN pokemon p ON mp.pokemon_id = p.id
     JOIN user_pokemon up ON mp.user_pokemon_id = up.id
     WHERE mp.match_id = ?`,
    [matchId]
  );

  const getPokemon = (userId: number, userPokemonId: number) =>
    (pokemons as any[]).find(p => p.user_id === userId && p.user_pokemon_id === userPokemonId);

  const p1Move = moves[player1];
  const p2Move = moves[player2];

  const p1Pokemon = getPokemon(player1, p1Move.pokemonId);
  const p2Pokemon = getPokemon(player2, p2Move.pokemonId);

  // Récupérer les attaques
  const [p1MoveDataArr] = await pool.query('SELECT * FROM moves WHERE id = ?', [p1Move.moveId]);
  const [p2MoveDataArr] = await pool.query('SELECT * FROM moves WHERE id = ?', [p2Move.moveId]);
  const p1MoveData = (p1MoveDataArr as any[])[0];
  const p2MoveData = (p2MoveDataArr as any[])[0];

  // 2. Comparer la vitesse
  let first, second, firstMove, secondMove, firstMoveData, secondMoveData;
  if ((p1Pokemon.speed || 1) > (p2Pokemon.speed || 1)) {
    first = p1Pokemon; firstMove = p1Move; firstMoveData = p1MoveData;
    second = p2Pokemon; secondMove = p2Move; secondMoveData = p2MoveData;
  } else {
    first = p2Pokemon; firstMove = p2Move; firstMoveData = p2MoveData;
    second = p1Pokemon; secondMove = p1Move; secondMoveData = p1MoveData;
  }

  // 3. Appliquer les dégâts dans l'ordre
  const logs = [];
  let firstDamage = Math.floor((firstMoveData.power || 0) * ((first.speed || 1) / (second.speed || 1)));
  let secondDamage = Math.floor((secondMoveData.power || 0) * ((second.speed || 1) / (first.speed || 1)));

  let secondNewHp = Math.max(0, second.current_hp - firstDamage);
  logs.push({
    text: `${first.name} utilise ${firstMoveData.name} et inflige ${firstDamage} dégâts à ${second.name} !`,
    color: "#66bb6a"
  });

  let firstNewHp = first.current_hp;
  let secondIsKO = false;
  if (secondNewHp <= 0) {
    logs.push({ text: `${second.name} est KO !`, color: "#e53935" });
    secondIsKO = true;
  } else {
    // Le second riposte seulement s'il n'est pas KO
    firstNewHp = Math.max(0, first.current_hp - secondDamage);
    logs.push({
      text: `${second.name} utilise ${secondMoveData.name} et inflige ${secondDamage} dégâts à ${first.name} !`,
      color: "#66bb6a"
    });
    if (firstNewHp <= 0) {
      logs.push({ text: `${first.name} est KO !`, color: "#e53935" });
    }
  }

  // 4. Mettre à jour la BDD (PV et KO)
  await pool.query(
    'UPDATE match_pokemon SET current_hp = ?, is_alive = ? WHERE match_id = ? AND user_id = ? AND user_pokemon_id = ?',
    [firstNewHp, firstNewHp > 0, matchId, first.user_id, first.user_pokemon_id]
  );
  await pool.query(
    'UPDATE match_pokemon SET current_hp = ?, is_alive = ? WHERE match_id = ? AND user_id = ? AND user_pokemon_id = ?',
    [secondNewHp, secondNewHp > 0, matchId, second.user_id, second.user_pokemon_id]
  );

  // Vérifier si un joueur a perdu tous ses Pokémon
  const [aliveP1] = await pool.query('SELECT COUNT(*) as alive FROM match_pokemon WHERE match_id = ? AND user_id = ? AND is_alive = true', [matchId, player1]);
  const [aliveP2] = await pool.query('SELECT COUNT(*) as alive FROM match_pokemon WHERE match_id = ? AND user_id = ? AND is_alive = true', [matchId, player2]);
  const p1Alive = (aliveP1 as any[])[0].alive;
  const p2Alive = (aliveP2 as any[])[0].alive;

  let isCombatEnded = false;
  let winnerId = null;
  if (p1Alive === 0 || p2Alive === 0) {
    isCombatEnded = true;
    winnerId = p1Alive > 0 ? player1 : player2;
    await pool.query('UPDATE matches SET status = ?, winner_id = ? WHERE id = ?', ['finished', winnerId, matchId]);
  }

  // 5. Réinitialiser pendingMoves pour ce match
  pendingMoves.delete(Number(matchId));

  // 6. Récupérer l'état à jour pour la réponse
  const [updatedPokemons] = await pool.query(
    `SELECT mp.*, p.name, p.type, up.id as user_pokemon_id, CASE WHEN up.is_shiny THEN p.sprite_shiny_url ELSE p.sprite_url END as sprite_url
     FROM match_pokemon mp
     JOIN pokemon p ON mp.pokemon_id = p.id
     JOIN user_pokemon up ON mp.user_pokemon_id = up.id
     WHERE mp.match_id = ?`,
    [matchId]
  );
  const getUpdatedPokemon = (userId: number, userPokemonId: number) =>
    (updatedPokemons as any[]).find(p => p.user_id === userId && p.user_pokemon_id === userPokemonId);

  res.json({
    playerPokemon: getUpdatedPokemon(userId, moves[userId].pokemonId),
    opponentPokemon: getUpdatedPokemon(userId === player1 ? player2 : player1, moves[userId === player1 ? player2 : player1].pokemonId),
    combatLog: logs,
    isPlayerTurn: !isCombatEnded, // à ajuster selon ta logique
    isCombatEnded,
    winnerId: isCombatEnded ? winnerId : null
  });
});

export default router;
