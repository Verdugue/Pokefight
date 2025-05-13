# PokéFight - Documentation du Projet

## 📌 Présentation du Projet

### Titre du Projet
**PokéFight** - Une plateforme de combat Pokémon en ligne

### Comment installer et lancer le projet
- git clone https://github.com/Verdugue/Pokefight.git
- dans le fichier racine :
  npm i
  - cd /server -> npm i -> npm run dev
  - cd /client -> npm i -> npm run dev
- Ouvrez votre gestionnaire de base de données et impoortez le fichier pokefight.sql
- Puis dans votre navigateur tapez htpp://localhost:3000

### Contexte
Ce projet s'inscrit dans le cadre d'un cours de développement web avancé, visant à mettre en pratique les concepts de développement full-stack, de gestion de base de données, et de création d'applications web interactives. La thématique Pokémon a été choisie pour son univers riche et son potentiel en termes de mécaniques de jeu et d'interactions utilisateur.

### Objectifs
- Créer une plateforme web permettant aux utilisateurs de s'affronter en utilisant des Pokémon
- Implémenter un système de combat en temps réel
- Développer une interface utilisateur intuitive et responsive
- Mettre en place un système d'authentification sécurisé
- Gérer une base de données de Pokémon et de statistiques de combat

### Résumé Global
PokéFight est une application web permettant aux joueurs de s'affronter en utilisant des Pokémon. Les utilisateurs peuvent créer un compte, choisir leur Pokémon de départ, et participer à des combats en temps réel contre d'autres joueurs. L'application inclut un système de matchmaking, des statistiques de combat, et une progression des Pokémon.

## 📌 Conception du Projet

### Analyse des Besoins
- **Attentes** :
  - Interface utilisateur intuitive et responsive
  - Système de combat fluide et équilibré
  - Gestion des utilisateurs et des statistiques
  - Expérience utilisateur immersive

- **Contraintes** :
  - Respect des règles de combat Pokémon
  - Performance optimale pour les combats en temps réel
  - Sécurité des données utilisateur
  - Compatibilité multi-navigateurs

- **Ressources Disponibles** :
  - API Pokémon officielle pour les données
  - Stack technique moderne (React, Node.js, MySQL)
  - Documentation complète des frameworks utilisés

### Choix Techniques
- **Frontend** :
  - React avec TypeScript pour la robustesse et la maintenabilité
  - Material-UI pour l'interface utilisateur
  - Socket.io pour les communications en temps réel
  - Vite pour le build et le développement

- **Backend** :
  - Node.js avec Express pour le serveur
  - MySQL pour la base de données
  - JWT pour l'authentification
  - Socket.io pour la gestion des combats

- **Outils de Développement** :
  - Git pour le versionnement
  - ESLint et Prettier pour la qualité du code
  - Jest pour les tests
  - Docker pour la containerisation

### Architecture du Projet
```
pokefight/
├── client/                 # Application React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/         # Pages de l'application
│   │   ├── services/      # Services API
│   │   ├── styles/        # Styles CSS
│   │   └── utils/         # Utilitaires
├── server/                 # Serveur Node.js
│   ├── src/
│   │   ├── controllers/   # Contrôleurs
│   │   ├── models/        # Modèles de données
│   │   ├── routes/        # Routes API
│   │   └── services/      # Services métier
└── database/              # Scripts de base de données
```

### Fonctionnalités Principales
1. **Authentification**
   - Inscription et connexion des utilisateurs
   - Gestion des profils
   - Sélection du Pokémon de départ

2. **Système de Combat**
   - Matchmaking automatique
   - Combats en temps réel
   - Système de tours
   - Gestion des attaques et des dégâts

3. **Progression**
   - Niveaux et expérience
   - Évolution des Pokémon
   - Déblocage de nouvelles capacités

4. **Social**
   - Classement des joueurs
   - Historique des combats
   - Système d'amis

## 📌 Gestion du Projet

### Organisation de l'Équipe
- **Développeur Frontend** : Responsable de l'interface utilisateur et des interactions
- **Développeur Backend** : Gestion du serveur et de la base de données
- **Designer** : Création des maquettes et des assets visuels
- **Product Owner** : Gestion des priorités et des fonctionnalités

### Planification
| Phase | Date Début | Date Fin | Objectifs |
|-------|------------|----------|-----------|
| Conception | 01/03 | 15/03 | Maquettes, architecture, choix techniques |
| Développement Frontend | 16/03 | 30/03 | Interface utilisateur, composants |
| Développement Backend | 16/03 | 30/03 | API, base de données |
| Intégration | 31/03 | 07/04 | Tests, corrections, optimisation |
| Déploiement | 08/04 | 10/04 | Mise en production, documentation |

### Méthodologie de Travail
- Approche Agile avec sprints de 2 semaines
- Réunions quotidiennes pour le suivi
- Revue de code systématique
- Tests unitaires et d'intégration

### Résolution des Problèmes
1. **Problème de Performance**
   - Optimisation des requêtes SQL
   - Mise en cache des données fréquemment utilisées
   - Compression des assets

2. **Synchronisation Temps Réel**
   - Implémentation de WebSocket
   - Gestion des déconnexions
   - Système de reconnexion automatique

3. **Sécurité**
   - Validation des entrées utilisateur


   - Chiffrement des mots de passe
   - Protection contre les attaques CSRF

## Conclusion
PokéFight représente un défi technique intéressant combinant développement web moderne, gestion de données en temps réel, et création d'une expérience utilisateur immersive. Le projet permet de mettre en pratique de nombreux concepts de développement full-stack tout en créant une application ludique et fonctionnelle. 


-reste a finir:
 -fin du systeme de combat 
 -systeme de classement
 -page gagnant et perdant -> baisse ou augmentation de rang.
 
--
