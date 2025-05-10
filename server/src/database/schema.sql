-- Création de la base de données
DROP DATABASE IF EXISTS pokefight;
CREATE DATABASE pokefight;
USE pokefight;

-- Table des types de Pokémon
CREATE TABLE types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL
);

-- Table des Pokémon
CREATE TABLE pokemon (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    catch_rate INT DEFAULT 50,
    rarity INT DEFAULT 1 CHECK (rarity BETWEEN 1 AND 4),
    sprite_url VARCHAR(255),
    sprite_shiny_url VARCHAR(255)
);

-- Table des utilisateurs
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    elo_rating INT DEFAULT 1000,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0
);

-- Table des zones d'exploration
CREATE TABLE exploration_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    min_level INT DEFAULT 1,
    max_level INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison entre les zones et les Pokémon
CREATE TABLE area_pokemon (
    area_id INT,
    pokemon_id INT,
    FOREIGN KEY (area_id) REFERENCES exploration_areas(id),
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
    PRIMARY KEY (area_id, pokemon_id)
);

-- Table des Pokémon possédés
CREATE TABLE user_pokemon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    pokemon_id INT NOT NULL,
    level INT DEFAULT 1,
    hp INT DEFAULT 50,
    max_hp INT DEFAULT 50,
    is_starter BOOLEAN DEFAULT FALSE,
    is_shiny BOOLEAN DEFAULT FALSE,
    rarity ENUM('normal', 'legendary') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id)
);

-- Table de l'équipe
CREATE TABLE team_pokemon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pokemon_id INT NOT NULL,
    slot INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
    UNIQUE KEY unique_user_slot (user_id, slot),
    UNIQUE KEY unique_user_pokemon (user_id, pokemon_id),
    CHECK (slot >= 0 AND slot <= 5)
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
    battle_log JSON,
    FOREIGN KEY (player1_id) REFERENCES users(id),
    FOREIGN KEY (player2_id) REFERENCES users(id),
    FOREIGN KEY (winner_id) REFERENCES users(id)
);

-- Table des mouvements des Pokémon
CREATE TABLE pokemon_moves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pokemon_id INT,
    move_id INT NOT NULL,
    pp_ups INT DEFAULT 0,
    slot INT,
    FOREIGN KEY (pokemon_id) REFERENCES user_pokemon(id) ON DELETE CASCADE,
    CHECK (pp_ups >= 0 AND pp_ups <= 3),
    CHECK (slot >= 1 AND slot <= 4)
);

-- Table des attaques
CREATE TABLE moves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type_id INT NOT NULL,
    power INT,
    accuracy INT,
    pp INT NOT NULL,
    description TEXT,
    FOREIGN KEY (type_id) REFERENCES types(id)
);

-- Table de liaison entre Pokémon et types
CREATE TABLE pokemon_types (
    pokemon_id INT,
    type_id INT,
    is_primary BOOLEAN DEFAULT true,
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
    FOREIGN KEY (type_id) REFERENCES types(id),
    PRIMARY KEY (pokemon_id, type_id)
);

-- Table des attaques apprises par niveau
CREATE TABLE pokemon_learnable_moves (
    pokemon_id INT,
    move_id INT,
    learn_level INT NOT NULL,
    FOREIGN KEY (pokemon_id) REFERENCES pokemon(id),
    FOREIGN KEY (move_id) REFERENCES moves(id),
    PRIMARY KEY (pokemon_id, move_id, learn_level)
);

-- Index pour améliorer les performances
CREATE INDEX idx_user_pokemon_user_id ON user_pokemon(user_id);
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

-- Insérer les types
INSERT INTO types (name, color) VALUES
('Normal', '#A8A878'),
('Feu', '#F08030'),
('Eau', '#6890F0'),
('Plante', '#78C850'),
('Électrik', '#F8D030'),
('Glace', '#98D8D8'),
('Combat', '#C03028'),
('Poison', '#A040A0'),
('Sol', '#E0C068'),
('Vol', '#A890F0'),
('Psy', '#F85888'),
('Insecte', '#A8B820'),
('Roche', '#B8A038'),
('Spectre', '#705898'),
('Dragon', '#7038F8'),
('Ténèbres', '#705848'),
('Acier', '#B8B8D0'),
('Fée', '#EE99AC');

-- Insérer les Pokémon
INSERT INTO pokemon (id, name, type, catch_rate, rarity) VALUES
-- Starters et évolutions
(1, 'Bulbizarre', 'Plante,Poison', 45, 1),
(2, 'Herbizarre', 'Plante,Poison', 45, 2),
(3, 'Florizarre', 'Plante,Poison', 45, 3),
(4, 'Salamèche', 'Feu', 45, 1),
(5, 'Reptincel', 'Feu', 45, 2),
(6, 'Dracaufeu', 'Feu,Vol', 45, 3),
(7, 'Carapuce', 'Eau', 45, 1),
(8, 'Carabaffe', 'Eau', 45, 2),
(9, 'Tortank', 'Eau', 45, 3),
(10, 'Chenipan', 'Insecte', 255, 1),
(11, 'Chrysacier', 'Insecte', 120, 2),
(12, 'Papilusion', 'Insecte,Vol', 45, 3),
(13, 'Aspicot', 'Insecte,Poison', 255, 1),
(14, 'Coconfort', 'Insecte,Poison', 120, 2),
(15, 'Dardargnan', 'Insecte,Poison', 45, 3),
(16, 'Roucool', 'Normal,Vol', 255, 1),
(17, 'Roucoups', 'Normal,Vol', 120, 2),
(18, 'Roucarnage', 'Normal,Vol', 45, 3),
(19, 'Rattata', 'Normal', 255, 1),
(20, 'Rattatac', 'Normal', 127, 2),
(21, 'Piafabec', 'Normal,Vol', 255, 1),
(22, 'Rapasdepic', 'Normal,Vol', 90, 2),
(23, 'Abo', 'Poison', 255, 1),
(24, 'Arbok', 'Poison', 90, 2),
(25, 'Pikachu', 'Électrik', 190, 2),
(26, 'Raichu', 'Électrik', 75, 3);

-- Mettre à jour les URLs des sprites
UPDATE pokemon SET 
    sprite_url = CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/', id, '.png'),
    sprite_shiny_url = CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/', id, '.png');

-- Ajouter les relations avec les types
INSERT INTO pokemon_types (pokemon_id, type_id, is_primary)
SELECT p.id, t.id, true
FROM pokemon p
JOIN types t ON t.name = TRIM(SUBSTRING_INDEX(p.type, ',', 1));

INSERT INTO pokemon_types (pokemon_id, type_id, is_primary)
SELECT p.id, t.id, false
FROM pokemon p
JOIN types t ON t.name = TRIM(SUBSTRING_INDEX(p.type, ',', -1))
WHERE p.type LIKE '%,%'; 