import mysql, { Pool, PoolConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pokefight',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test de la connexion
pool.getConnection()
  .then((connection: PoolConnection) => {
    console.log('Connexion à la base de données MySQL établie avec succès');
    connection.release();
  })
  .catch((err: Error) => {
    console.error('Erreur lors de la connexion à la base de données:', err);
  });

export { pool }; 