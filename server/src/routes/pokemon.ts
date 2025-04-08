import express from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Récupérer les zones d'exploration
router.get('/areas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, description, min_level as minLevel, max_level as maxLevel
      FROM exploration_areas
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching exploration areas:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Explorer une zone pour trouver un Pokémon sauvage
router.post('/explore/:areaId', authenticateToken, async (req, res) => {
  const { areaId } = req.params;
  const userId = req.user.id;

  try {
    // Vérifier si la zone existe
    const [area] = await pool.query(
      'SELECT * FROM exploration_areas WHERE id = ?',
      [areaId]
    );

    if (!area) {
      return res.status(404).json({ error: 'Area not found' });
    }

    // Sélectionner un Pokémon aléatoire de la zone
    const [pokemon] = await pool.query(`
      SELECT p.id, p.name, p.type, 
             FLOOR(RAND() * (a.max_level - a.min_level + 1) + a.min_level) as level,
             FLOOR(RAND() * 50 + 50) as hp,
             FLOOR(RAND() * 50 + 50) as max_hp,
             FLOOR(RAND() * 100) as catch_rate
      FROM pokemon p
      JOIN area_pokemon ap ON p.id = ap.pokemon_id
      JOIN exploration_areas a ON ap.area_id = a.id
      WHERE a.id = ?
      ORDER BY RAND()
      LIMIT 1
    `, [areaId]);

    if (!pokemon) {
      return res.status(404).json({ error: 'No Pokémon found in this area' });
    }

    res.json(pokemon);
  } catch (error) {
    console.error('Error exploring area:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Tenter d'attraper un Pokémon
router.post('/catch/:pokemonId', authenticateToken, async (req, res) => {
  const { pokemonId } = req.params;
  const userId = req.user.id;

  try {
    // Récupérer les informations du Pokémon
    const [pokemon] = await pool.query(
      'SELECT * FROM pokemon WHERE id = ?',
      [pokemonId]
    );

    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon not found' });
    }

    // Calculer la probabilité de capture
    const catchRate = Math.random() * 100;
    const success = catchRate <= pokemon.catch_rate;

    if (success) {
      // Ajouter le Pokémon à la collection de l'utilisateur
      await pool.query(
        'INSERT INTO user_pokemon (user_id, pokemon_id, level, hp, max_hp) VALUES (?, ?, ?, ?, ?)',
        [userId, pokemonId, pokemon.level, pokemon.hp, pokemon.max_hp]
      );

      res.json({
        success: true,
        message: `You caught ${pokemon.name}!`
      });
    } else {
      res.json({
        success: false,
        message: `${pokemon.name} escaped!`
      });
    }
  } catch (error) {
    console.error('Error catching Pokémon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 