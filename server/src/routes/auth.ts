import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface User extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  last_login: Date;
  elo_rating: number;
  wins: number;
  losses: number;
}

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log('Tentative d\'inscription avec:', { username, email });

    // Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await pool.query<User[]>(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    console.log('Résultat de la vérification d\'existence:', existingUsers);

    if (existingUsers.length > 0) {
      console.log('Utilisateur déjà existant');
      return res.status(400).json({ message: 'Nom d\'utilisateur ou email déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Mot de passe haché avec succès');

    // Insérer le nouvel utilisateur avec les valeurs par défaut
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password_hash, elo_rating, wins, losses) VALUES (?, ?, ?, 1000, 0, 0)',
      [username, email, hashedPassword]
    );
    console.log('Résultat de l\'insertion:', result);

    // Générer le token JWT
    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '24h' }
    );
    console.log('Token JWT généré avec succès');

    res.status(201).json({
      token,
      user: {
        id: result.insertId,
        username,
        email,
        elo_rating: 1000,
        wins: 0,
        losses: 0
      }
    });
  } catch (error) {
    console.error('Erreur détaillée lors de l\'inscription:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentative de connexion avec email:', email);

    // Récupérer l'utilisateur
    const [users] = await pool.query<User[]>(
      'SELECT id, username, email, password_hash, elo_rating, wins, losses FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé avec cet email');
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];
    console.log('Utilisateur trouvé:', { 
      id: user.id, 
      username: user.username,
      email: user.email,
      passwordHashLength: user.password_hash.length
    });

    // Vérifier le mot de passe
    console.log('Début de la vérification du mot de passe');
    console.log('Mot de passe fourni:', password);
    console.log('Hash stocké:', user.password_hash);
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('Résultat de la comparaison:', validPassword);

    if (!validPassword) {
      console.log('Mot de passe invalide');
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );
    console.log('Dernière connexion mise à jour');

    // Générer le token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'votre_secret_jwt',
      { expiresIn: '24h' }
    );
    console.log('Token JWT généré avec succès');

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        elo_rating: user.elo_rating,
        wins: user.wins,
        losses: user.losses
      }
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la connexion:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const [users] = await pool.query<User[]>(
      'SELECT id, username, email, created_at, last_login, elo_rating, wins, losses FROM users WHERE id = ?',
      [req.user?.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      last_login: user.last_login,
      elo_rating: user.elo_rating,
      wins: user.wins,
      losses: user.losses
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export default router; 