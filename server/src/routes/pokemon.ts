import express from 'express';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

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
router.post('/explore/:areaId', authenticateToken, async (req: AuthRequest, res) => {
  const { areaId } = req.params;
  const userId = req.user!.id;

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
      SELECT p.id, p.name, p.primary_type, p.secondary_type, 
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
router.post('/catch/:pokemonId', authenticateToken, async (req: AuthRequest, res) => {
  const { pokemonId } = req.params;
  const userId = req.user!.id;

  try {
    // Récupérer les informations du Pokémon
    const [pokemon] = await pool.query(
      'SELECT * FROM pokemon WHERE id = ?',
      [pokemonId]
    );

    const catchRows = pokemon as RowDataPacket[];
    if (!catchRows || catchRows.length === 0) {
      return res.status(404).json({ error: 'Pokémon not found' });
    }
    const poke = catchRows[0];

    // Calculer la probabilité de capture
    const catchRate = Math.random() * 100;
    const success = catchRate <= poke.catch_rate;

    if (success) {
      // Ajouter le Pokémon à la collection de l'utilisateur
      await pool.query(
        'INSERT INTO user_pokemon (user_id, pokemon_id, level, hp, max_hp) VALUES (?, ?, ?, ?, ?)',
        [userId, pokemonId, poke.level, poke.hp, poke.max_hp]
      );

      res.json({
        success: true,
        message: `You caught ${poke.name}!`
      });
    } else {
      res.json({
        success: false,
        message: `${poke.name} escaped!`
      });
    }
  } catch (error) {
    console.error('Error catching Pokémon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vérifier et créer les tables nécessaires si elles n'existent pas
const initializeDatabase = async () => {
  try {
    // Créer la table pokemon si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pokemon (
        id INT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        primary_type VARCHAR(50) NOT NULL,
        secondary_type VARCHAR(50),
        catch_rate INT DEFAULT 50
      )
    `);
    console.log('Table pokemon vérifiée/créée avec succès');

    // Vérifier si les starters existent déjà
    const [existingPokemon] = await pool.query('SELECT COUNT(*) as count FROM pokemon');
    const existingPokemonRows = existingPokemon as RowDataPacket[];
    if (existingPokemonRows[0].count === 0) {
      // Insérer les starters
      await pool.query(`
        INSERT INTO pokemon (id, name, primary_type, secondary_type, catch_rate) VALUES
        (1, 'Bulbizarre', 'Plante, Poison', null, 45),
        (4, 'Salamèche', 'Feu', null, 45),
        (7, 'Carapuce', 'Eau', null, 45)
      `);
      console.log('Starters ajoutés avec succès');
    }

    // Créer la table user_pokemon si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_pokemon (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        pokemon_id INT NOT NULL,
        level INT DEFAULT 1,
        hp INT DEFAULT 50,
        max_hp INT DEFAULT 50,
        is_starter BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
      )
    `);
    console.log('Table user_pokemon vérifiée/créée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
};

// Appeler la fonction au démarrage du serveur
initializeDatabase();

// Sauvegarder le starter choisi
router.post('/starter', authenticateToken, async (req: AuthRequest, res) => {
  const { pokemon_id, isStarter } = req.body;
  const userId = req.user!.id;

  console.log('Requête reçue pour le starter:', req.body);

  // Vérifier que les paramètres requis sont présents
  if (!pokemon_id || isStarter === undefined) {
    console.error('Paramètres manquants:', { pokemon_id, isStarter });
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Vérifier si le Pokémon existe
    const [pokemonRows] = await pool.query(
      'SELECT * FROM pokemon WHERE id = ?',
      [pokemon_id]
    );

    const starterPokemonRows = pokemonRows as RowDataPacket[];
    if (!starterPokemonRows || starterPokemonRows.length === 0) {
      console.error('Pokémon non trouvé:', pokemon_id);
      return res.status(404).json({ error: 'Pokémon not found' });
    }
    const starterPoke = starterPokemonRows[0];

    // Vérifier si l'utilisateur a déjà un starter
    const [existingStarterRows] = await pool.query(
      'SELECT * FROM user_pokemon WHERE user_id = ? AND is_starter = true',
      [userId]
    );
    const starterRows = existingStarterRows as RowDataPacket[];
    if (starterRows && starterRows.length > 0) {
      // Si l'utilisateur a déjà un starter, on renvoie un succès
      return res.json({ 
        success: true, 
        message: 'User already has a starter Pokémon',
        existingStarter: true 
      });
    }

    // Ajouter le Pokémon à l'équipe du joueur
    const [result] = await pool.query(
      `INSERT INTO user_pokemon 
       (user_id, pokemon_id, is_starter, level, hp, max_hp) 
       VALUES (?, ?, true, 5, 50, 50)`,
      [userId, pokemon_id]
    );

    // Ajouter automatiquement le starter dans le slot 0 de l'équipe
    await pool.query(
      'INSERT INTO team_pokemon (user_id, pokemon_id, slot) VALUES (?, ?, 0)',
      [userId, pokemon_id]
    );

    console.log('Starter sauvegardé avec succès:', result);
    res.json({ 
      success: true, 
      message: 'Starter Pokémon added to team',
      pokemon: {
        ...starterPoke,
        level: 5,
        hp: 50,
        max_hp: 50,
        is_starter: true,
        slot: 0
      }
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la sauvegarde du starter:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Récupérer tous les Pokémon possédés par l'utilisateur
router.get('/owned', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  try {
    const [pokemon] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        CONCAT(p.primary_type, IF(p.secondary_type IS NOT NULL, CONCAT(',', p.secondary_type), '')) as type,
        up.level,
        up.hp,
        up.max_hp as maxHp,
        up.is_starter as isStarter,
        up.is_shiny as isShiny,
        up.rarity,
        CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/', 
          CASE WHEN up.is_shiny THEN 'shiny/' ELSE '' END,
          p.id, '.png'
        ) as image
      FROM user_pokemon up
      JOIN pokemon p ON up.pokemon_id = p.id
      WHERE up.user_id = ?
    `, [userId]);

    res.json(pokemon);
  } catch (error) {
    console.error('Error fetching owned Pokemon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mettre à jour l'équipe
router.post('/team/update', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { pokemonId, slot, isShiny } = req.body;

  // Vérifier les paramètres
  if (slot < 0 || slot > 5) {
    return res.status(400).json({ error: 'Invalid slot number' });
  }

  try {
    // Vérifier si le Pokémon appartient à l'utilisateur
    const [ownedPokemon] = await pool.query(
      'SELECT * FROM user_pokemon WHERE user_id = ? AND pokemon_id = ?' + (isShiny !== undefined ? ' AND is_shiny = ?' : ''),
      isShiny !== undefined ? [userId, pokemonId, isShiny] : [userId, pokemonId]
    );

    const ownedPokemonRows = ownedPokemon as RowDataPacket[];
    if (!ownedPokemonRows || ownedPokemonRows.length === 0) {
      return res.status(400).json({ error: 'Pokemon not owned by user' });
    }

    // Vérifier si le Pokémon n'est pas déjà dans l'équipe (même version)
    const [existingTeam] = await pool.query(
      'SELECT tp.*, up.is_shiny FROM team_pokemon tp JOIN user_pokemon up ON tp.pokemon_id = up.pokemon_id AND tp.user_id = up.user_id WHERE tp.user_id = ? AND tp.pokemon_id = ?' + (isShiny !== undefined ? ' AND up.is_shiny = ?' : ''),
      isShiny !== undefined ? [userId, pokemonId, isShiny] : [userId, pokemonId]
    );

    const existingTeamRows = existingTeam as RowDataPacket[];
    if (existingTeamRows && existingTeamRows.length > 0) {
      return res.status(400).json({ error: 'Pokemon already in team' });
    }

    // Supprimer le Pokémon qui était dans ce slot (s'il y en avait un)
    await pool.query(
      'DELETE FROM team_pokemon WHERE user_id = ? AND slot = ?',
      [userId, slot]
    );

    // Ajouter le nouveau Pokémon dans le slot
    await pool.query(
      'INSERT INTO team_pokemon (user_id, pokemon_id, slot) VALUES (?, ?, ?)',
      [userId, pokemonId, slot]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retirer un Pokémon de l'équipe
router.post('/team/remove', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { slot } = req.body;

  // Vérifier les paramètres
  if (slot < 0 || slot > 5) {
    return res.status(400).json({ error: 'Invalid slot number' });
  }

  try {
    // Vérifier si le Pokémon n'est pas un starter
    const [teamPokemon] = await pool.query(`
      SELECT up.is_starter,
             (SELECT COUNT(*) FROM user_pokemon WHERE user_id = ? AND is_starter = false) as non_starter_count
      FROM team_pokemon tp
      JOIN user_pokemon up ON tp.pokemon_id = up.pokemon_id AND tp.user_id = up.user_id
      WHERE tp.user_id = ? AND tp.slot = ?
    `, [userId, userId, slot]);

    const teamPokemonRows2 = teamPokemon as RowDataPacket[];
    if (teamPokemonRows2 && teamPokemonRows2.length > 0 && teamPokemonRows2[0].is_starter && teamPokemonRows2[0].non_starter_count === 0) {
      // On empêche le retrait du starter uniquement si c'est le seul Pokémon
      return res.status(400).json({ error: 'Cannot remove starter Pokemon from team' });
    }

    // Supprimer le Pokémon du slot
    await pool.query(
      'DELETE FROM team_pokemon WHERE user_id = ? AND slot = ?',
      [userId, slot]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing Pokemon from team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Récupérer l'équipe du joueur
router.get('/team', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  try {
    const [pokemon] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        CONCAT(p.primary_type, IF(p.secondary_type IS NOT NULL, CONCAT(',', p.secondary_type), '')) as type,
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

    // Créer un tableau de 6 slots avec null pour les slots vides
    const teamArray = Array(6).fill(null);
    
    // Remplir les slots avec les Pokémon existants
    (pokemon as any[]).forEach((p: any) => {
      if (p.slot >= 0 && p.slot < 6) {
        // Convertir le type en tableau
        teamArray[p.slot] = {
          ...p,
          type: p.type.includes(',') ? p.type.split(',').map((t: string) => t.trim()) : [p.type.trim()]
        };
      }
    });

    res.json(teamArray);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Récupérer le Pokédex du joueur
router.get('/pokedex', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  try {
    const [pokemon] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        CONCAT(p.primary_type, IF(p.secondary_type IS NOT NULL, CONCAT(',', p.secondary_type), '')) as type,
        CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/', p.id, '.png') as image,
        EXISTS(
          SELECT 1 
          FROM user_pokemon up 
          WHERE up.user_id = ? AND up.pokemon_id = p.id
        ) as isCaught
      FROM pokemon p
      ORDER BY p.id
    `, [userId]);

    const pokedexRows = pokemon as RowDataPacket[];
    // Convertir le type en tableau
    const formattedPokemon = Array.isArray(pokedexRows) ? pokedexRows.map((p: any) => ({
      ...p,
      type: [p.type]
    })) : [];

    res.json(formattedPokemon);
  } catch (error) {
    console.error('Error fetching Pokédex:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vérifier le temps restant avant le prochain tirage
router.get('/roulette/cooldown', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  try {
    // Pour le développement, on retourne toujours 0 pour désactiver le cooldown
    res.json({ timeUntilNextRoll: 0 });
  } catch (error) {
    console.error('Error checking roulette cooldown:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Effectuer un tirage
router.post('/roulette/roll', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  try {
    // Récupérer les pokémons déjà possédés (normal et shiny)
    const [owned] = await pool.query('SELECT pokemon_id, is_shiny FROM user_pokemon WHERE user_id = ?', [userId]);
    const ownedRows = owned as RowDataPacket[];
    const ownedIds = ownedRows.map((p: any) => p.pokemon_id + (p.is_shiny ? '_shiny' : ''));

    // Sélectionner tous les Pokémon
    const [allPokemon] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        CONCAT(p.primary_type, IF(p.secondary_type IS NOT NULL, CONCAT(',', p.secondary_type), '')) as type,
        p.rarity
      FROM pokemon p
    `);
    const allPokemonRows = allPokemon as RowDataPacket[];
    
    // Calculer les probabilités
    const roll = Math.random() * 100;
    const isShiny = roll < 0.1; // 0.1% de chance d'être shiny

    // Filtrer les Pokémon non possédés (en tenant compte du shiny)
    let available: any[] = [];
    if (roll < 1) {
      available = allPokemonRows.filter((p: any) => p.rarity === 4 && !ownedIds.includes(p.id + (isShiny ? '_shiny' : '')));
    } else if (roll < 5) {
      available = allPokemonRows.filter((p: any) => p.rarity === 3 && !ownedIds.includes(p.id + (isShiny ? '_shiny' : '')));
    } else if (roll < 15) {
      available = allPokemonRows.filter((p: any) => p.rarity === 2 && !ownedIds.includes(p.id + (isShiny ? '_shiny' : '')));
    } else {
      available = allPokemonRows.filter((p: any) => p.rarity === 1 && !ownedIds.includes(p.id + (isShiny ? '_shiny' : '')));
    }

    // Si tout est possédé, on autorise les doublons (pour ne pas bloquer la roulette)
    if (available.length === 0) {
      available = allPokemonRows.filter((p: any) => !ownedIds.includes(p.id + (isShiny ? '_shiny' : '')));
      if (available.length === 0) {
        // Si vraiment tout est possédé, on autorise tout
        available = allPokemonRows;
      }
    }

    // Sélectionner un Pokémon au hasard
    const pokemon = available[Math.floor(Math.random() * available.length)];

    // Vérifier si le joueur possède déjà ce Pokémon (même version)
    const alreadyOwned = ownedRows.some((p: any) => p.pokemon_id === pokemon.id && !!p.is_shiny === !!isShiny);
    if (alreadyOwned) {
      return res.status(409).json({ error: 'Vous possédez déjà ce Pokémon dans cette version.' });
    }

    // Ajouter le Pokémon à la collection de l'utilisateur
    await pool.query(`
      INSERT INTO user_pokemon 
      (user_id, pokemon_id, is_shiny, rarity) 
      VALUES (?, ?, ?, ?)
    `, [userId, pokemon.id, isShiny, pokemon.rarity]);

    // Préparer la réponse
    const response = {
      id: pokemon.id,
      name: pokemon.name,
      type: pokemon.type.split(',').map((t: string) => t.trim()),
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? 'shiny/' : ''}${pokemon.id}.png`,
      isShiny,
      rarity: pokemon.rarity
    };

    res.json(response);
  } catch (error) {
    console.error('Error rolling:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mettre à jour l'avatar de l'utilisateur
router.post('/avatar', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const { avatarUrl } = req.body;

  try {
    await pool.query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [avatarUrl, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour récupérer les attaques d'un Pokémon
router.get('/moves/:pokemonId', authenticateToken, async (req, res) => {
  try {
    const { pokemonId } = req.params;
    console.log('Récupération des attaques pour le Pokémon:', pokemonId);
    
    const query = `
      SELECT 
        m.id, 
        m.name, 
        t.name as type, 
        m.power, 
        m.accuracy, 
        m.pp, 
        m.description
      FROM moves m
      JOIN pokemon_learnable_moves plm ON m.id = plm.move_id
      JOIN types t ON m.type_id = t.id
      WHERE plm.pokemon_id = ?
      ORDER BY plm.learn_level ASC
    `;

    const [rows] = await pool.query(query, [pokemonId]);
    console.log('Attaques trouvées:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des attaques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer les attaques apprises par un Pokémon possédé
router.get('/owned/:pokemonId/moves', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { pokemonId } = req.params;
    const userId = req.user!.id;

    const [ownershipCheck] = await pool.query(
      'SELECT id FROM user_pokemon WHERE id = ? AND user_id = ?',
      [pokemonId, userId]
    ) as RowDataPacket[];
    if (!ownershipCheck || (ownershipCheck as RowDataPacket[]).length === 0) {
      return res.status(403).json({ error: 'Ce Pokémon ne vous appartient pas' });
    }

    const query = `
      SELECT m.id, m.name, t.name as type, m.power, m.accuracy, m.pp, m.description,
             pm.slot, pm.pp_ups
      FROM moves m
      JOIN pokemon_moves pm ON m.id = pm.move_id
      JOIN types t ON m.type_id = t.id
      WHERE pm.pokemon_id = ?
      ORDER BY pm.slot ASC
    `;
    const [rows] = await pool.query(query, [pokemonId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des attaques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour ajouter une attaque à un Pokémon possédé
router.post('/owned/:pokemonId/moves', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { pokemonId } = req.params;
    const { moveId, slot } = req.body;
    const userId = req.user!.id;

    // Vérifier que le Pokémon appartient à l'utilisateur
    const [ownershipCheck] = await pool.query(
      'SELECT id FROM user_pokemon WHERE id = ? AND user_id = ?',
      [pokemonId, userId]
    ) as RowDataPacket[];
    if (!ownershipCheck || (ownershipCheck as RowDataPacket[]).length === 0) {
      return res.status(403).json({ error: 'Ce Pokémon ne vous appartient pas' });
    }

    // Vérifier que le Pokémon peut apprendre cette attaque
    const [moveCheck] = await pool.query(
      'SELECT 1 FROM pokemon_learnable_moves WHERE pokemon_id = ? AND move_id = ?',
      [pokemonId, moveId]
    ) as RowDataPacket[];
    if (!moveCheck || (moveCheck as RowDataPacket[]).length === 0) {
      return res.status(400).json({ error: 'Ce Pokémon ne peut pas apprendre cette attaque' });
    }

    // Vérifier si le slot est déjà occupé
    if (slot !== undefined) {
      const [slotCheck] = await pool.query(
        'SELECT 1 FROM pokemon_moves WHERE pokemon_id = ? AND slot = ?',
        [pokemonId, slot]
      ) as RowDataPacket[];
      if ((slotCheck as RowDataPacket[]).length > 0) {
        return res.status(400).json({ error: 'Ce slot est déjà occupé' });
      }
    }

    // Ajouter l'attaque
    await pool.query(
      'INSERT INTO pokemon_moves (pokemon_id, move_id, slot) VALUES (?, ?, ?)',
      [pokemonId, moveId, slot]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'attaque:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour supprimer une attaque d'un Pokémon possédé
router.delete('/owned/:pokemonId/moves/:moveId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { pokemonId, moveId } = req.params;
    const userId = req.user!.id;

    // Vérifier que le Pokémon appartient à l'utilisateur
    const [ownershipCheck] = await pool.query(
      'SELECT id FROM user_pokemon WHERE id = ? AND user_id = ?',
      [pokemonId, userId]
    ) as RowDataPacket[];
    if (!ownershipCheck || (ownershipCheck as RowDataPacket[]).length === 0) {
      return res.status(403).json({ error: 'Ce Pokémon ne vous appartient pas' });
    }

    // Supprimer l'attaque
    const [result] = await pool.query(
      'DELETE FROM pokemon_moves WHERE pokemon_id = ? AND move_id = ?',
      [pokemonId, moveId]
    ) as RowDataPacket[];

    res.json({ message: 'Attaque supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'attaque:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer tous les Pokémon
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        CONCAT(p.primary_type, IF(p.secondary_type IS NOT NULL, CONCAT(',', p.secondary_type), '')) as type,
        p.catch_rate,
        p.rarity,
        CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/', p.id, '.png') as sprite_url,
        CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/', p.id, '.png') as shiny_sprite_url
      FROM pokemon p
      ORDER BY p.id ASC
    `);

    // Convertir la chaîne de types en tableau
    const formattedRows = (rows as any[]).map(pokemon => ({
      ...pokemon,
      type: pokemon.type.includes(',') ? pokemon.type.split(',').map((t: string) => t.trim()) : [pokemon.type.trim()]
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error('Error fetching all Pokemon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Récupérer un Pokémon spécifique
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        CONCAT(p.primary_type, IF(p.secondary_type IS NOT NULL, CONCAT(',', p.secondary_type), '')) as type,
        p.catch_rate,
        p.rarity,
        CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/', p.id, '.png') as sprite_url,
        CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/', p.id, '.png') as sprite_shiny_url
      FROM pokemon p
      WHERE p.id = ?
    `, [req.params.id]);

    const pokemon = (rows as RowDataPacket[])[0];
    if (!pokemon) {
      return res.status(404).json({ error: 'Pokemon not found' });
    }

    res.json(pokemon);
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 