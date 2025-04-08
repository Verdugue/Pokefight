-- Création de la base de données
CREATE DATABASE IF NOT EXISTS pokefight;

-- Table des utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    elo_rating INT DEFAULT 1000,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0
);

-- Table des Pokémon possédés
CREATE TABLE owned_pokemon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    pokemon_id INT NOT NULL, -- ID du Pokémon dans l'API
    nickname VARCHAR(50),
    level INT DEFAULT 1,
    experience INT DEFAULT 0,
    is_starter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Stats individuelles (IVs)
    iv_hp INT CHECK (iv_hp BETWEEN 0 AND 31),
    iv_attack INT CHECK (iv_attack BETWEEN 0 AND 31),
    iv_defense INT CHECK (iv_defense BETWEEN 0 AND 31),
    iv_sp_attack INT CHECK (iv_sp_attack BETWEEN 0 AND 31),
    iv_sp_defense INT CHECK (iv_sp_defense BETWEEN 0 AND 31),
    iv_speed INT CHECK (iv_speed BETWEEN 0 AND 31),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des combats
CREATE TABLE battles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id INT,
    player2_id INT,
    winner_id INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    elo_change INT,
    battle_log JSON, -- Stocke le déroulement du combat
    FOREIGN KEY (player1_id) REFERENCES users(id),
    FOREIGN KEY (player2_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- Table des mouvements des Pokémon
CREATE TABLE pokemon_moves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pokemon_id INT,
    move_id INT NOT NULL, -- ID du mouvement dans l'API
    pp_ups INT DEFAULT 0,
    slot INT,
    FOREIGN KEY (pokemon_id) REFERENCES owned_pokemon(id) ON DELETE CASCADE,
    CONSTRAINT check_pp_ups CHECK (pp_ups BETWEEN 0 AND 3),
    CONSTRAINT check_slot CHECK (slot BETWEEN 1 AND 4)
);

-- Index pour améliorer les performances
CREATE INDEX idx_owned_pokemon_user_id ON owned_pokemon(user_id);
CREATE INDEX idx_battles_player1_id ON battles(player1_id);
CREATE INDEX idx_battles_player2_id ON battles(player2_id);
CREATE INDEX idx_pokemon_moves_pokemon_id ON pokemon_moves(pokemon_id);

-- Trigger pour mettre à jour les statistiques après un combat
DELIMITER //
CREATE TRIGGER after_battle_complete
    AFTER UPDATE ON battles
    FOR EACH ROW
BEGIN
    IF OLD.winner_id IS NULL AND NEW.winner_id IS NOT NULL THEN
        -- Mettre à jour les victoires du gagnant
        UPDATE users 
        SET wins = wins + 1,
            elo_rating = elo_rating + NEW.elo_change
        WHERE id = NEW.winner_id;
        
        -- Mettre à jour les défaites du perdant
        UPDATE users 
        SET losses = losses + 1,
            elo_rating = elo_rating - NEW.elo_change
        WHERE id IN (NEW.player1_id, NEW.player2_id) 
        AND id != NEW.winner_id;
    END IF;
END//
DELIMITER ; 