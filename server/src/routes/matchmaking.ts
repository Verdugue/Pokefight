import express from 'express';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Interface pour représenter un joueur en attente
interface WaitingPlayer {
  userId: number;
  username: string;
  team: any[];
  timestamp: number;
}

// Map pour stocker les joueurs en attente
const waitingPlayers = new Map<number, WaitingPlayer>();

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

// Rejoindre la file d'attente
router.post('/queue', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const username = req.user!.username;

  try {
    // Vérifier si le joueur a une équipe
    const [team] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.type,
        up.level,
        up.hp,
        up.max_hp as maxHp,
        up.is_starter as isStarter,
        up.is_shiny as isShiny,
        up.rarity,
        tp.slot,
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

    const teamArray = Array(6).fill(null);
    (team as any[]).forEach((p: any) => {
      if (p.slot >= 0 && p.slot < 6) {
        teamArray[p.slot] = {
          ...p,
          type: p.type.split(',').map((t: string) => t.trim())
        };
      }
    });

    // Vérifier si l'équipe est valide (au moins un Pokémon)
    const validTeam = teamArray.filter(p => p !== null);
    if (validTeam.length === 0) {
      return res.status(400).json({ error: 'Vous devez avoir au moins un Pokémon dans votre équipe' });
    }

    // Ajouter le joueur à la file d'attente
    waitingPlayers.set(userId, {
      userId,
      username,
      team: validTeam,
      timestamp: Date.now()
    });

    // Chercher un adversaire
    const opponent = findOpponent(userId);
    if (opponent) {
      // Créer un match
      const matchId = await createMatch(userId, opponent.userId);
      
      // Retirer les deux joueurs de la file d'attente
      waitingPlayers.delete(userId);
      waitingPlayers.delete(opponent.userId);

      return res.json({
        matchFound: true,
        matchId,
        opponent: {
          username: opponent.username,
          team: opponent.team
        }
      });
    }

    res.json({ matchFound: false, message: 'En attente d\'un adversaire...' });
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
function findOpponent(currentUserId: number): WaitingPlayer | null {
  for (const [userId, player] of waitingPlayers.entries()) {
    if (userId !== currentUserId) {
      return player;
    }
  }
  return null;
}

// Créer un match
async function createMatch(player1Id: number, player2Id: number): Promise<number> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Créer le match
    const [result] = await connection.query(
      'INSERT INTO matches (player1_id, player2_id, status) VALUES (?, ?, ?)',
      [player1Id, player2Id, 'in_progress']
    );

    const matchId = (result as any).insertId;

    // Initialiser les PV des Pokémon pour le match
    const [player1Team] = await connection.query(
      'SELECT id, pokemon_id FROM team_pokemon WHERE user_id = ?',
      [player1Id]
    );

    const [player2Team] = await connection.query(
      'SELECT id, pokemon_id FROM team_pokemon WHERE user_id = ?',
      [player2Id]
    );

    // Insérer les Pokémon dans le match
    for (const pokemon of player1Team as any[]) {
      await connection.query(
        'INSERT INTO match_pokemon (match_id, user_id, pokemon_id, current_hp) SELECT ?, ?, pokemon_id, max_hp FROM user_pokemon WHERE id = ?',
        [matchId, player1Id, pokemon.id]
      );
    }

    for (const pokemon of player2Team as any[]) {
      await connection.query(
        'INSERT INTO match_pokemon (match_id, user_id, pokemon_id, current_hp) SELECT ?, ?, pokemon_id, max_hp FROM user_pokemon WHERE id = ?',
        [matchId, player2Id, pokemon.id]
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
        CASE 
          WHEN up.is_shiny THEN p.sprite_shiny_url
          ELSE p.sprite_url
        END as sprite_url
      FROM match_pokemon mp
      JOIN pokemon p ON mp.pokemon_id = p.id
      JOIN user_pokemon up ON mp.pokemon_id = up.pokemon_id AND mp.user_id = up.user_id
      WHERE mp.match_id = ?
    `, [matchId]);

    res.json({
      match: (match as RowDataPacket[])[0],
      pokemon: (pokemon as any[]).map(p => ({
        ...p,
        type: p.type.split(',').map((t: string) => t.trim())
      }))
    });
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
