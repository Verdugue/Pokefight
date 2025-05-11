import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import authRouter from './routes/auth';
import pokemonRouter from './routes/pokemon';
import matchmakingRoutes from './routes/matchmaking';
import MatchmakingService from './services/MatchmakingService';
import { initializeDatabase } from './routes/pokemon';

// Configuration
dotenv.config();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialiser le WebSocket
// initializeWebSocket(io);

const PORT = Number(process.env.PORT) || 3001;

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
app.use('/api/matchmaking', matchmakingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialiser le service de matchmaking
new MatchmakingService(server);

// Initialiser la base de données
initializeDatabase().catch(console.error);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the server from other devices using: http://<your-local-ip>:${PORT}`);
  console.log(`🎮 Service de matchmaking initialisé`);
}); 