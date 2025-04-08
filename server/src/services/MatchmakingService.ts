import { WebSocket, WebSocketServer } from 'ws';
import { pool } from '../config/database';

interface QueuePlayer {
  userId: number;
  socket: WebSocket;
  elo: number;
  joinedAt: number;
}

class MatchmakingService {
  private wss: WebSocketServer;
  private queue: QueuePlayer[] = [];
  private readonly MAX_ELO_DIFFERENCE = 200;
  private readonly MAX_WAIT_TIME = 30000; // 30 secondes

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (socket: WebSocket) => {
      console.log('🔌 Nouveau joueur connecté au matchmaking');

      socket.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          
          switch (data.type) {
            case 'JOIN_QUEUE':
              await this.handleJoinQueue(socket, data.userId);
              break;
            case 'LEAVE_QUEUE':
              this.handleLeaveQueue(socket);
              break;
          }
        } catch (error) {
          console.error('❌ Erreur de traitement du message:', error);
        }
      });

      socket.on('close', () => {
        this.handleLeaveQueue(socket);
        console.log('🔌 Joueur déconnecté du matchmaking');
      });
    });

    // Vérification périodique des matchs possibles
    setInterval(() => this.findMatches(), 5000);
  }

  private async handleJoinQueue(socket: WebSocket, userId: number) {
    try {
      // Récupérer l'ELO du joueur depuis la base de données
      const [rows] = await pool.query(
        'SELECT elo FROM users WHERE id = ?',
        [userId]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        socket.send(JSON.stringify({
          type: 'ERROR',
          message: 'Utilisateur non trouvé'
        }));
        return;
      }

      const player: QueuePlayer = {
        userId,
        socket,
        elo: rows[0].elo || 1000,
        joinedAt: Date.now()
      };

      // Vérifier si le joueur n'est pas déjà dans la file
      if (!this.queue.some(p => p.userId === userId)) {
        this.queue.push(player);
        console.log(`👥 Joueur ${userId} ajouté à la file d'attente (ELO: ${player.elo})`);
        
        socket.send(JSON.stringify({
          type: 'QUEUE_JOINED',
          message: 'Vous avez rejoint la file d\'attente'
        }));
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout à la file d\'attente:', error);
      socket.send(JSON.stringify({
        type: 'ERROR',
        message: 'Erreur lors de l\'ajout à la file d\'attente'
      }));
    }
  }

  private handleLeaveQueue(socket: WebSocket) {
    const index = this.queue.findIndex(p => p.socket === socket);
    if (index !== -1) {
      const player = this.queue[index];
      this.queue.splice(index, 1);
      console.log(`👋 Joueur ${player.userId} a quitté la file d'attente`);
    }
  }

  private findMatches() {
    const now = Date.now();
    
    for (let i = 0; i < this.queue.length; i++) {
      const player1 = this.queue[i];
      
      // Chercher un adversaire compatible
      for (let j = i + 1; j < this.queue.length; j++) {
        const player2 = this.queue[j];
        
        // Vérifier la différence d'ELO
        const eloDiff = Math.abs(player1.elo - player2.elo);
        
        // Calculer le temps d'attente
        const waitTime1 = now - player1.joinedAt;
        const waitTime2 = now - player2.joinedAt;
        
        // Critères d'appariement plus souples si l'attente est longue
        const maxEloDiff = this.MAX_ELO_DIFFERENCE + 
          Math.min(waitTime1, waitTime2) / 1000 * 10; // +10 ELO/seconde d'attente
        
        if (eloDiff <= maxEloDiff) {
          this.createMatch(player1, player2);
          
          // Retirer les joueurs de la file
          this.queue = this.queue.filter(p => 
            p.userId !== player1.userId && p.userId !== player2.userId
          );
          
          // Passer au joueur suivant
          i--;
          break;
        }
      }
    }
  }

  private createMatch(player1: QueuePlayer, player2: QueuePlayer) {
    console.log(`🎮 Match trouvé: ${player1.userId} vs ${player2.userId}`);
    
    // Notifier les joueurs
    const matchData = {
      type: 'MATCH_FOUND',
      data: {
        opponent: {
          id: player2.userId,
          elo: player2.elo
        }
      }
    };
    
    player1.socket.send(JSON.stringify({
      ...matchData,
      data: {
        ...matchData.data,
        opponent: {
          id: player2.userId,
          elo: player2.elo
        }
      }
    }));
    
    player2.socket.send(JSON.stringify({
      ...matchData,
      data: {
        ...matchData.data,
        opponent: {
          id: player1.userId,
          elo: player1.elo
        }
      }
    }));
  }
}

export default MatchmakingService; 