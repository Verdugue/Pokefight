import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import pokemonRouter from './routes/pokemon';
import MatchmakingService from './services/MatchmakingService';

// Configuration
dotenv.config();
const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body) console.log('Body:', req.body);
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/pokemon', pokemonRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialiser le service de matchmaking
new MatchmakingService(server);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

server.listen(port, () => {
  console.log(`🚀 Serveur démarré sur le port ${port}`);
  console.log(`🎮 Service de matchmaking initialisé`);
}); 