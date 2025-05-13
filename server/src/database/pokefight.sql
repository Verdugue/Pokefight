-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 12 mai 2025 à 07:30
-- Version du serveur : 8.3.0
-- Version de PHP : 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `pokefight`
--

-- --------------------------------------------------------

--
-- Structure de la table `area_pokemon`
--

DROP TABLE IF EXISTS `area_pokemon`;
CREATE TABLE IF NOT EXISTS `area_pokemon` (
  `area_id` int NOT NULL,
  `pokemon_id` int NOT NULL,
  PRIMARY KEY (`area_id`,`pokemon_id`),
  KEY `pokemon_id` (`pokemon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `battles`
--

DROP TABLE IF EXISTS `battles`;
CREATE TABLE IF NOT EXISTS `battles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player1_id` int DEFAULT NULL,
  `player2_id` int DEFAULT NULL,
  `winner_id` int DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ended_at` timestamp NULL DEFAULT NULL,
  `elo_change` int DEFAULT NULL,
  `battle_log` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `winner_id` (`winner_id`),
  KEY `idx_battles_player1_id` (`player1_id`),
  KEY `idx_battles_player2_id` (`player2_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déclencheurs `battles`
--
DROP TRIGGER IF EXISTS `after_battle_complete`;
DELIMITER $$
CREATE TRIGGER `after_battle_complete` AFTER UPDATE ON `battles` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `exploration_areas`
--

DROP TABLE IF EXISTS `exploration_areas`;
CREATE TABLE IF NOT EXISTS `exploration_areas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `min_level` int DEFAULT '1',
  `max_level` int DEFAULT '100',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `matches`
--

DROP TABLE IF EXISTS `matches`;
CREATE TABLE IF NOT EXISTS `matches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `player1_id` int NOT NULL,
  `player2_id` int NOT NULL,
  `status` enum('waiting','in_progress','finished') NOT NULL DEFAULT 'waiting',
  `winner_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `current_player_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `player1_id` (`player1_id`),
  KEY `player2_id` (`player2_id`),
  KEY `winner_id` (`winner_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `matches`
--

INSERT INTO `matches` (`id`, `player1_id`, `player2_id`, `status`, `winner_id`, `created_at`, `updated_at`, `current_player_id`) VALUES
(31, 2, 1, 'in_progress', NULL, '2025-05-11 13:55:39', '2025-05-11 13:55:39', NULL),
(32, 1, 2, 'in_progress', NULL, '2025-05-11 13:56:21', '2025-05-11 13:56:21', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `match_actions`
--

DROP TABLE IF EXISTS `match_actions`;
CREATE TABLE IF NOT EXISTS `match_actions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id` int NOT NULL,
  `user_id` int NOT NULL,
  `pokemon_id` int NOT NULL,
  `move_id` int NOT NULL,
  `target_pokemon_id` int NOT NULL,
  `damage` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `match_id` (`match_id`),
  KEY `user_id` (`user_id`),
  KEY `pokemon_id` (`pokemon_id`),
  KEY `move_id` (`move_id`),
  KEY `target_pokemon_id` (`target_pokemon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `match_pokemon`
--

DROP TABLE IF EXISTS `match_pokemon`;
CREATE TABLE IF NOT EXISTS `match_pokemon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `match_id` int NOT NULL,
  `user_id` int NOT NULL,
  `pokemon_id` int NOT NULL,
  `current_hp` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `user_pokemon_id` int DEFAULT NULL,
  `is_alive` tinyint(1) DEFAULT '1',
  `slot` int DEFAULT '0',
  `max_hp` int NOT NULL DEFAULT '50',
  `level` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `match_id` (`match_id`),
  KEY `user_id` (`user_id`),
  KEY `pokemon_id` (`pokemon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `match_pokemon`
--

INSERT INTO `match_pokemon` (`id`, `match_id`, `user_id`, `pokemon_id`, `current_hp`, `is_active`, `created_at`, `user_pokemon_id`, `is_alive`, `slot`, `max_hp`, `level`) VALUES
(69, 31, 2, 102, 50, 0, '2025-05-11 13:55:39', 2, 1, 0, 50, 1),
(70, 31, 2, 104, 50, 0, '2025-05-11 13:55:39', 3, 1, 0, 50, 1),
(71, 31, 2, 58, 50, 0, '2025-05-11 13:55:39', 5, 1, 0, 50, 1),
(72, 31, 2, 69, 50, 0, '2025-05-11 13:55:39', 6, 1, 0, 50, 1),
(73, 31, 2, 108, 50, 0, '2025-05-11 13:55:39', 8, 1, 0, 50, 1),
(74, 31, 1, 90, 50, 0, '2025-05-11 13:55:39', 1, 1, 0, 50, 1),
(75, 31, 1, 29, 50, 0, '2025-05-11 13:55:39', 4, 1, 0, 50, 1),
(76, 31, 1, 7, 50, 0, '2025-05-11 13:55:39', 7, 1, 0, 50, 1),
(77, 31, 1, 98, 50, 0, '2025-05-11 13:55:39', 9, 1, 0, 50, 1),
(78, 32, 1, 90, 50, 0, '2025-05-11 13:56:21', 1, 1, 0, 50, 1),
(79, 32, 1, 29, 50, 0, '2025-05-11 13:56:21', 4, 1, 0, 50, 1),
(80, 32, 1, 7, 50, 0, '2025-05-11 13:56:21', 7, 1, 0, 50, 1),
(81, 32, 1, 98, 50, 0, '2025-05-11 13:56:21', 9, 1, 0, 50, 1),
(82, 32, 2, 102, 50, 0, '2025-05-11 13:56:21', 2, 1, 0, 50, 1),
(83, 32, 2, 104, 50, 0, '2025-05-11 13:56:21', 3, 1, 0, 50, 1),
(84, 32, 2, 58, 50, 0, '2025-05-11 13:56:21', 5, 1, 0, 50, 1),
(85, 32, 2, 69, 50, 0, '2025-05-11 13:56:21', 6, 1, 0, 50, 1),
(86, 32, 2, 108, 50, 0, '2025-05-11 13:56:21', 8, 1, 0, 50, 1);

-- --------------------------------------------------------

--
-- Structure de la table `moves`
--

DROP TABLE IF EXISTS `moves`;
CREATE TABLE IF NOT EXISTS `moves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `type_id` int NOT NULL,
  `power` int DEFAULT NULL,
  `accuracy` int DEFAULT NULL,
  `pp` int NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `type_id` (`type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `moves`
--

INSERT INTO `moves` (`id`, `name`, `type_id`, `power`, `accuracy`, `pp`, `description`) VALUES
(1, 'Charge', 1, 40, 100, 35, 'Une charge physique basique.'),
(2, 'Griffe', 1, 40, 100, 35, 'Lacère l\'ennemi avec des griffes acérées.'),
(3, 'Rugissement', 1, NULL, 100, 40, 'Baisse l\'Attaque de l\'ennemi.'),
(4, 'Morsure', 1, 60, 100, 25, 'Mord l\'ennemi avec des crocs acérés.'),
(5, 'Fouet Lianes', 4, 45, 100, 25, 'Le Pokémon fouette l\'ennemi avec de fines lianes.'),
(6, 'Tranch\'Herbe', 4, 55, 95, 25, 'Des feuilles tranchantes comme des rasoirs lacèrent l\'ennemi.'),
(7, 'Vampigraine', 4, NULL, 90, 10, 'Plante des graines qui drainent les PV de l\'ennemi à chaque tour.'),
(8, 'Lance-Soleil', 4, 120, 100, 10, 'Absorbe la lumière au premier tour et attaque au second.'),
(9, 'Flammèche', 2, 40, 100, 25, 'Une faible attaque de feu qui peut brûler l\'ennemi.'),
(10, 'Flamme', 2, 90, 100, 15, 'Une puissante attaque de feu qui peut brûler l\'ennemi.'),
(11, 'Lance-Flammes', 2, 90, 100, 15, 'Un souffle de feu intense qui peut brûler l\'ennemi.'),
(12, 'Déflagration', 2, 110, 85, 5, 'Une explosion de feu dévastatrice qui peut brûler l\'ennemi.'),
(13, 'Pistolet à O', 3, 40, 100, 25, 'De l\'eau est projetée avec force sur l\'ennemi.'),
(14, 'Bulle d\'O', 3, 65, 100, 20, 'Des bulles sont envoyées sur l\'ennemi.'),
(15, 'Hydrocanon', 3, 110, 80, 5, 'Un puissant jet d\'eau est projeté sur l\'ennemi.'),
(16, 'Surf', 3, 90, 100, 15, 'Une énorme vague s\'abat sur le terrain.'),
(17, 'Piqûre', 12, 60, 100, 20, 'Pique l\'ennemi avec un dard.'),
(18, 'Toile', 12, NULL, 95, 15, 'Ralentit l\'ennemi avec une toile collante.'),
(19, 'Dard-Venin', 12, 15, 100, 35, 'Un dard toxique qui peut empoisonner.'),
(20, 'Tornade', 10, 40, 100, 35, 'Crée une tornade qui frappe l\'ennemi.'),
(21, 'Cru-Aile', 10, 60, 100, 35, 'Frappe l\'ennemi avec des ailes.'),
(22, 'Cyclone', 10, NULL, 100, 20, 'Force l\'ennemi à quitter le combat.'),
(23, 'Gaz Toxik', 8, NULL, 90, 40, 'Un gaz toxique qui peut empoisonner.'),
(24, 'Acide', 8, 40, 100, 30, 'Asperge l\'ennemi d\'acide corrosif.'),
(25, 'Bomb-Beurk', 8, 90, 100, 10, 'Lance des déchets toxiques sur l\'ennemi.'),
(26, 'Éclair', 5, 40, 100, 30, 'Une décharge électrique basique.'),
(27, 'Tonnerre', 5, 110, 70, 10, 'Une puissante décharge électrique.'),
(28, 'Cage-Éclair', 5, NULL, 100, 20, 'Paralyse l\'ennemi avec de l\'électricité statique.'),
(29, 'Tunnel', 9, 80, 100, 10, 'Creuse un tunnel et attaque au second tour.'),
(30, 'Séisme', 9, 100, 100, 10, 'Un tremblement de terre qui frappe tous les Pokémon.'),
(31, 'Jet-Pierres', 9, 50, 90, 15, 'Lance des pierres sur l\'ennemi.'),
(32, 'Jet de Sable', 13, NULL, 100, 15, 'Réduit la précision de l\'ennemi.'),
(33, 'Lance-Pierre', 13, 50, 90, 15, 'Lance des pierres sur l\'ennemi.'),
(34, 'Éboulement', 13, 75, 90, 10, 'Fait tomber des rochers sur l\'ennemi.'),
(35, 'Poing-Karaté', 7, 50, 100, 25, 'Un coup de poing puissant.'),
(36, 'Balayage', 7, 60, 85, 20, 'Un coup de pied qui peut faire tomber l\'ennemi.'),
(37, 'Poing de Feu', 7, 75, 100, 15, 'Un coup de poing enflammé qui peut brûler.'),
(38, 'Psyko', 11, 90, 100, 10, 'Une puissante attaque psychique.'),
(39, 'Téléport', 11, NULL, 100, 20, 'Permet de fuir le combat.'),
(40, 'Hypnose', 11, NULL, 60, 20, 'Endort l\'ennemi.'),
(41, 'Laser Glace', 6, 90, 100, 10, 'Un rayon de glace qui peut geler.'),
(42, 'Blizzard', 6, 110, 70, 5, 'Une tempête de neige qui peut geler.'),
(43, 'Poudreuse', 6, 40, 100, 25, 'Une bouffée de neige qui peut geler.'),
(44, 'Draco-Rage', 15, 40, 100, 10, 'Une attaque draconique qui inflige toujours 40 dégâts.'),
(45, 'Ouragan', 15, 110, 70, 10, 'Une attaque draconique puissante.'),
(46, 'Léchouille', 14, 30, 100, 30, 'Lèche l\'ennemi et peut le paralyser.'),
(47, 'Ball\'Ombre', 14, 80, 100, 15, 'Une boule d\'ombre qui peut baisser la Défense.'),
(48, 'Destiny Bond', 14, NULL, 100, 5, 'Si le Pokémon est K.O., l\'ennemi est aussi K.O.');

-- --------------------------------------------------------

--
-- Structure de la table `pokemon`
--

DROP TABLE IF EXISTS `pokemon`;
CREATE TABLE IF NOT EXISTS `pokemon` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `catch_rate` int DEFAULT '50',
  `rarity` int DEFAULT '1',
  `sprite_url` varchar(255) DEFAULT NULL,
  `sprite_shiny_url` varchar(255) DEFAULT NULL,
  `speed` int DEFAULT '50',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `pokemon`
--

INSERT INTO `pokemon` (`id`, `name`, `type`, `catch_rate`, `rarity`, `sprite_url`, `sprite_shiny_url`, `speed`) VALUES
(1, 'Bulbizarre', 'Plante', 45, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png', 45),
(2, 'Herbizarre', 'Plante', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/2.png', 60),
(3, 'Florizarre', 'Plante', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/3.png', 80),
(4, 'Salamèche', 'Feu', 45, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/4.png', 65),
(5, 'Reptincel', 'Feu', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/5.png', 80),
(6, 'Dracaufeu', 'Feu,Vol', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png', 100),
(7, 'Carapuce', 'Eau', 45, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/7.png', 43),
(8, 'Carabaffe', 'Eau', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/8.png', 58),
(9, 'Tortank', 'Eau', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/9.png', 78),
(10, 'Chenipan', 'Insecte', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10.png', 45),
(11, 'Chrysacier', 'Insecte', 120, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/11.png', 30),
(12, 'Papilusion', 'Insecte,Vol', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/12.png', 70),
(13, 'Aspicot', 'Insecte,Poison', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/13.png', 50),
(14, 'Coconfort', 'Insecte,Poison', 120, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/14.png', 35),
(15, 'Dardargnan', 'Insecte,Poison', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/15.png', 75),
(16, 'Roucool', 'Normal,Vol', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/16.png', 56),
(17, 'Roucoups', 'Normal,Vol', 120, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/17.png', 71),
(18, 'Roucarnage', 'Normal,Vol', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/18.png', 101),
(19, 'Rattata', 'Normal', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/19.png', 72),
(20, 'Rattatac', 'Normal', 127, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/20.png', 97),
(21, 'Piafabec', 'Normal,Vol', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/21.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/21.png', 70),
(22, 'Rapasdepic', 'Normal,Vol', 90, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/22.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/22.png', 100),
(23, 'Abo', 'Poison', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/23.png', 55),
(24, 'Arbok', 'Poison', 90, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/24.png', 80),
(25, 'Pikachu', 'Électrik', 190, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png', 90),
(26, 'Raichu', 'Électrik', 75, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/26.png', 110),
(27, 'Sabelette', 'Sol', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/27.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/27.png', 40),
(28, 'Sablaireau', 'Sol', 90, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/28.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/28.png', 65),
(29, 'Nidoran♀', 'Poison', 235, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/29.png', 41),
(30, 'Nidorina', 'Poison', 120, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/30.png', 56),
(31, 'Nidoqueen', 'Poison,Sol', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/31.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/31.png', 76),
(32, 'Nidoran♂', 'Poison', 235, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/32.png', 50),
(33, 'Nidorino', 'Poison', 120, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/33.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/33.png', 65),
(34, 'Nidoking', 'Poison,Sol', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/34.png', 85),
(35, 'Mélofée', 'Fée', 150, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/35.png', 35),
(36, 'Mélodelfe', 'Fée', 25, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/36.png', 60),
(37, 'Goupix', 'Feu', 190, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/37.png', 65),
(38, 'Feunard', 'Feu', 75, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/38.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/38.png', 100),
(39, 'Rondoudou', 'Normal,Fée', 170, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/39.png', 20),
(40, 'Grodoudou', 'Normal,Fée', 50, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/40.png', 50),
(41, 'Nosferapti', 'Poison,Vol', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/41.png', 55),
(42, 'Nosferalto', 'Poison,Vol', 90, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/42.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/42.png', 90),
(43, 'Mystherbe', 'Plante,Poison', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/43.png', 30),
(44, 'Ortide', 'Plante,Poison', 120, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/44.png', 40),
(45, 'Rafflesia', 'Plante,Poison', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/45.png', 50),
(46, 'Paras', 'Insecte,Plante', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/46.png', 25),
(47, 'Parasect', 'Insecte,Plante', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/47.png', 30),
(48, 'Mimitoss', 'Insecte,Poison', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/48.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/48.png', 45),
(49, 'Aéromite', 'Insecte,Poison', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/49.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/49.png', 90),
(50, 'Taupiqueur', 'Sol', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/50.png', 95),
(51, 'Triopikeur', 'Sol', 50, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/51.png', 120),
(52, 'Miaouss', 'Normal', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/52.png', 90),
(53, 'Persian', 'Normal', 90, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/53.png', 115),
(54, 'Psykokwak', 'Eau', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/54.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/54.png', 55),
(55, 'Akwakwak', 'Eau', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/55.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/55.png', 85),
(56, 'Férosinge', 'Combat', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/56.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/56.png', 70),
(57, 'Colossinge', 'Combat', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/57.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/57.png', 95),
(58, 'Caninos', 'Feu', 190, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/58.png', 60),
(59, 'Arcanin', 'Feu', 75, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/59.png', 95),
(60, 'Ptitard', 'Eau', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/60.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/60.png', 90),
(61, 'Têtarte', 'Eau', 120, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/61.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/61.png', 50),
(62, 'Tartard', 'Eau,Combat', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/62.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/62.png', 70),
(63, 'Abra', 'Psy', 200, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/63.png', 90),
(64, 'Kadabra', 'Psy', 100, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/64.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/64.png', 105),
(65, 'Alakazam', 'Psy', 50, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/65.png', 120),
(66, 'Machoc', 'Combat', 180, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/66.png', 35),
(67, 'Machopeur', 'Combat', 90, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/67.png', 45),
(68, 'Mackogneur', 'Combat', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/68.png', 55),
(69, 'Chétiflor', 'Plante,Poison', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/69.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/69.png', 40),
(70, 'Boustiflor', 'Plante,Poison', 120, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/70.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/70.png', 55),
(71, 'Empiflor', 'Plante,Poison', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/71.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/71.png', 70),
(72, 'Tentacool', 'Eau,Poison', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/72.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/72.png', 40),
(73, 'Tentacruel', 'Eau,Poison', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/73.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/73.png', 100),
(74, 'Racaillou', 'Roche,Sol', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/74.png', 20),
(75, 'Gravalanch', 'Roche,Sol', 120, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/75.png', 35),
(76, 'Grolem', 'Roche,Sol', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/76.png', 45),
(77, 'Ponyta', 'Feu', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/77.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/77.png', 90),
(78, 'Galopa', 'Feu', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/78.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/78.png', 110),
(79, 'Ramoloss', 'Eau,Psy', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/79.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/79.png', 15),
(80, 'Flagadoss', 'Eau,Psy', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/80.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/80.png', 30),
(81, 'Magnéti', 'Électrik,Acier', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/81.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/81.png', 45),
(82, 'Magnéton', 'Électrik,Acier', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/82.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/82.png', 70),
(83, 'Canarticho', 'Normal,Vol', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/83.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/83.png', 60),
(84, 'Doduo', 'Normal,Vol', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/84.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/84.png', 75),
(85, 'Dodrio', 'Normal,Vol', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/85.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/85.png', 110),
(86, 'Otaria', 'Eau', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/86.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/86.png', 45),
(87, 'Lamantine', 'Eau,Glace', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/87.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/87.png', 70),
(88, 'Tadmorv', 'Poison', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/88.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/88.png', 25),
(89, 'Grotadmorv', 'Poison', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/89.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/89.png', 50),
(90, 'Kokiyas', 'Eau', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/90.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/90.png', 40),
(91, 'Crustabri', 'Eau,Glace', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/91.png', 70),
(92, 'Fantominus', 'Spectre,Poison', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/92.png', 80),
(93, 'Spectrum', 'Spectre,Poison', 90, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/93.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/93.png', 95),
(94, 'Ectoplasma', 'Spectre,Poison', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/94.png', 110),
(95, 'Onix', 'Roche,Sol', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/95.png', 70),
(96, 'Soporifik', 'Psy', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/96.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/96.png', 42),
(97, 'Hypnomade', 'Psy', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/97.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/97.png', 67),
(98, 'Krabby', 'Eau', 225, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/98.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/98.png', 50),
(99, 'Krabboss', 'Eau', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/99.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/99.png', 75),
(100, 'Voltorbe', 'Électrik', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/100.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/100.png', 100),
(101, 'Électrode', 'Électrik', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/101.png', 150),
(102, 'Noeunoeuf', 'Plante,Psy', 90, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/102.png', 40),
(103, 'Noadkoko', 'Plante,Psy', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/103.png', 55),
(104, 'Osselait', 'Sol', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/104.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/104.png', 35),
(105, 'Ossatueur', 'Sol', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/105.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/105.png', 45),
(106, 'Kicklee', 'Combat', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/106.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/106.png', 87),
(107, 'Tygnon', 'Combat', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/107.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/107.png', 76),
(108, 'Excelangue', 'Normal', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/108.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/108.png', 30),
(109, 'Smogo', 'Poison', 190, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/109.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/109.png', 35),
(110, 'Smogogo', 'Poison', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/110.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/110.png', 60),
(111, 'Rhinocorne', 'Sol,Roche', 120, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/111.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/111.png', 40),
(112, 'Rhinoféros', 'Sol,Roche', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/112.png', 55),
(113, 'Leveinard', 'Normal', 30, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/113.png', 50),
(114, 'Saquedeneu', 'Plante', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/114.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/114.png', 60),
(115, 'Kangourex', 'Normal', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/115.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/115.png', 110),
(116, 'Hypotrempe', 'Eau', 225, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/116.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/116.png', 60),
(117, 'Hypocéan', 'Eau', 75, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/117.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/117.png', 115),
(118, 'Poissirène', 'Eau', 225, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/118.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/118.png', 63),
(119, 'Poissoroy', 'Eau', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/119.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/119.png', 68),
(120, 'Stari', 'Eau', 225, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/120.png', 85),
(121, 'Staross', 'Eau,Psy', 60, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/121.png', 115),
(122, 'M. Mime', 'Psy,Fée', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/122.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/122.png', 90),
(123, 'Insécateur', 'Insecte,Vol', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/123.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/123.png', 105),
(124, 'Lippoutou', 'Glace,Psy', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/124.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/124.png', 95),
(125, 'Élektek', 'Électrik', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/125.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/125.png', 105),
(126, 'Magmar', 'Feu', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/126.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/126.png', 93),
(127, 'Scarabrute', 'Insecte', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/127.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/127.png', 85),
(128, 'Tauros', 'Normal', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/128.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/128.png', 110),
(129, 'Magicarpe', 'Eau', 255, 1, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/129.png', 80),
(130, 'Léviator', 'Eau,Vol', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/130.png', 81),
(131, 'Lokhlass', 'Eau,Glace', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/131.png', 60),
(132, 'Métamorph', 'Normal', 35, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/132.png', 48),
(133, 'Évoli', 'Normal', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/133.png', 55),
(134, 'Aquali', 'Eau', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/134.png', 65),
(135, 'Voltali', 'Électrik', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/135.png', 130),
(136, 'Pyroli', 'Feu', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/136.png', 65),
(137, 'Porygon', 'Normal', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/137.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/137.png', 40),
(138, 'Amonita', 'Roche,Eau', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/138.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/138.png', 35),
(139, 'Amonistar', 'Roche,Eau', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/139.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/139.png', 55),
(140, 'Kabuto', 'Roche,Eau', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/140.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/140.png', 55),
(141, 'Kabutops', 'Roche,Eau', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/141.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/141.png', 80),
(142, 'Ptéra', 'Roche,Vol', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/142.png', 130),
(143, 'Ronflex', 'Normal', 25, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/143.png', 30),
(144, 'Artikodin', 'Glace,Vol', 3, 4, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/144.png', 85),
(145, 'Électhor', 'Électrik,Vol', 3, 4, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/145.png', 100),
(146, 'Sulfura', 'Feu,Vol', 3, 4, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/146.png', 90),
(147, 'Minidraco', 'Dragon', 45, 2, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/147.png', 50),
(148, 'Draco', 'Dragon', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/148.png', 70),
(149, 'Dracolosse', 'Dragon,Vol', 45, 3, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/149.png', 80),
(150, 'Mewtwo', 'Psy', 3, 4, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png', 130),
(151, 'Mew', 'Psy', 45, 4, 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/151.png', 100);

-- --------------------------------------------------------

--
-- Structure de la table `pokemon_learnable_moves`
--

DROP TABLE IF EXISTS `pokemon_learnable_moves`;
CREATE TABLE IF NOT EXISTS `pokemon_learnable_moves` (
  `pokemon_id` int NOT NULL,
  `move_id` int NOT NULL,
  `learn_level` int NOT NULL,
  PRIMARY KEY (`pokemon_id`,`move_id`,`learn_level`),
  KEY `move_id` (`move_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `pokemon_learnable_moves`
--

INSERT INTO `pokemon_learnable_moves` (`pokemon_id`, `move_id`, `learn_level`) VALUES
(1, 1, 1),
(2, 1, 1),
(3, 1, 1),
(4, 1, 1),
(5, 1, 1),
(6, 1, 1),
(7, 1, 1),
(8, 1, 1),
(9, 1, 1),
(10, 1, 1),
(11, 1, 1),
(12, 1, 1),
(13, 1, 1),
(14, 1, 1),
(15, 1, 1),
(16, 1, 1),
(17, 1, 1),
(18, 1, 1),
(19, 1, 1),
(20, 1, 1),
(21, 1, 1),
(22, 1, 1),
(23, 1, 1),
(24, 1, 1),
(25, 1, 1),
(26, 1, 1),
(27, 1, 1),
(28, 1, 1),
(29, 1, 1),
(30, 1, 1),
(31, 1, 1),
(32, 1, 1),
(33, 1, 1),
(34, 1, 1),
(35, 1, 1),
(36, 1, 1),
(37, 1, 1),
(38, 1, 1),
(39, 1, 1),
(40, 1, 1),
(41, 1, 1),
(42, 1, 1),
(43, 1, 1),
(44, 1, 1),
(45, 1, 1),
(46, 1, 1),
(47, 1, 1),
(48, 1, 1),
(49, 1, 1),
(50, 1, 1),
(51, 1, 1),
(52, 1, 1),
(53, 1, 1),
(54, 1, 1),
(55, 1, 1),
(56, 1, 1),
(57, 1, 1),
(58, 1, 1),
(59, 1, 1),
(60, 1, 1),
(61, 1, 1),
(62, 1, 1),
(63, 1, 1),
(64, 1, 1),
(65, 1, 1),
(66, 1, 1),
(67, 1, 1),
(68, 1, 1),
(69, 1, 1),
(70, 1, 1),
(71, 1, 1),
(72, 1, 1),
(73, 1, 1),
(74, 1, 1),
(75, 1, 1),
(76, 1, 1),
(77, 1, 1),
(78, 1, 1),
(79, 1, 1),
(80, 1, 1),
(81, 1, 1),
(82, 1, 1),
(83, 1, 1),
(84, 1, 1),
(85, 1, 1),
(86, 1, 1),
(87, 1, 1),
(88, 1, 1),
(89, 1, 1),
(90, 1, 1),
(91, 1, 1),
(92, 1, 1),
(93, 1, 1),
(94, 1, 1),
(95, 1, 1),
(96, 1, 1),
(97, 1, 1),
(98, 1, 1),
(99, 1, 1),
(100, 1, 1),
(101, 1, 1),
(102, 1, 1),
(103, 1, 1),
(104, 1, 1),
(105, 1, 1),
(106, 1, 1),
(107, 1, 1),
(108, 1, 1),
(109, 1, 1),
(110, 1, 1),
(111, 1, 1),
(112, 1, 1),
(113, 1, 1),
(114, 1, 1),
(115, 1, 1),
(116, 1, 1),
(117, 1, 1),
(118, 1, 1),
(119, 1, 1),
(120, 1, 1),
(121, 1, 1),
(122, 1, 1),
(123, 1, 1),
(124, 1, 1),
(125, 1, 1),
(126, 1, 1),
(127, 1, 1),
(128, 1, 1),
(129, 1, 1),
(130, 1, 20),
(131, 1, 20),
(132, 1, 1),
(133, 1, 1),
(134, 1, 1),
(135, 1, 1),
(136, 1, 1),
(137, 1, 1),
(138, 1, 1),
(139, 1, 1),
(140, 1, 1),
(141, 1, 1),
(142, 1, 1),
(143, 1, 1),
(144, 1, 1),
(145, 1, 1),
(146, 1, 1),
(147, 1, 13),
(148, 1, 13),
(149, 1, 20),
(150, 1, 1),
(151, 1, 1),
(19, 2, 1),
(20, 2, 1),
(115, 2, 7),
(123, 2, 13),
(127, 2, 7),
(11, 3, 1),
(14, 3, 1),
(35, 3, 1),
(36, 3, 1),
(39, 3, 1),
(40, 3, 1),
(41, 3, 1),
(113, 3, 1),
(115, 3, 20),
(19, 4, 1),
(20, 4, 1),
(42, 4, 1),
(43, 4, 1),
(44, 4, 1),
(115, 4, 13),
(143, 4, 7),
(1, 5, 1),
(2, 5, 1),
(3, 5, 1),
(43, 5, 1),
(44, 5, 1),
(45, 5, 1),
(46, 5, 1),
(47, 5, 1),
(102, 5, 1),
(103, 5, 1),
(114, 5, 1),
(151, 5, 1),
(1, 6, 7),
(2, 6, 1),
(3, 6, 1),
(43, 6, 7),
(44, 6, 1),
(45, 6, 1),
(102, 6, 7),
(103, 6, 1),
(114, 6, 7),
(2, 7, 1),
(3, 7, 1),
(43, 7, 13),
(44, 7, 1),
(45, 7, 1),
(102, 7, 13),
(103, 7, 1),
(114, 7, 13),
(1, 8, 20),
(2, 8, 25),
(3, 8, 1),
(44, 8, 1),
(45, 8, 1),
(4, 9, 1),
(5, 9, 1),
(6, 9, 1),
(37, 9, 1),
(38, 9, 1),
(58, 9, 1),
(59, 9, 1),
(126, 9, 1),
(136, 9, 1),
(146, 9, 1),
(151, 9, 1),
(4, 10, 7),
(5, 10, 1),
(6, 10, 1),
(37, 10, 7),
(38, 10, 1),
(58, 10, 7),
(59, 10, 1),
(126, 10, 7),
(136, 10, 7),
(146, 10, 7),
(5, 11, 13),
(6, 11, 1),
(37, 11, 13),
(38, 11, 1),
(58, 11, 13),
(59, 11, 1),
(126, 11, 13),
(136, 11, 13),
(4, 12, 20),
(5, 12, 25),
(38, 12, 1),
(59, 12, 1),
(7, 13, 1),
(8, 13, 1),
(9, 13, 1),
(60, 13, 1),
(61, 13, 1),
(62, 13, 1),
(72, 13, 1),
(73, 13, 1),
(86, 13, 1),
(87, 13, 1),
(90, 13, 1),
(91, 13, 1),
(116, 13, 1),
(117, 13, 1),
(118, 13, 1),
(119, 13, 1),
(120, 13, 1),
(121, 13, 1),
(130, 13, 1),
(131, 13, 1),
(134, 13, 1),
(138, 13, 1),
(139, 13, 1),
(140, 13, 1),
(141, 13, 1),
(147, 13, 7),
(148, 13, 7),
(149, 13, 7),
(151, 13, 1),
(7, 14, 7),
(8, 14, 1),
(9, 14, 1),
(60, 14, 7),
(61, 14, 1),
(62, 14, 1),
(72, 14, 7),
(73, 14, 1),
(116, 14, 7),
(117, 14, 1),
(118, 14, 7),
(119, 14, 1),
(120, 14, 7),
(134, 14, 7),
(138, 14, 7),
(139, 14, 1),
(140, 14, 7),
(141, 14, 1),
(7, 15, 13),
(8, 15, 13),
(9, 15, 1),
(60, 15, 13),
(61, 15, 1),
(62, 15, 1),
(73, 15, 1),
(80, 15, 1),
(116, 15, 13),
(117, 15, 1),
(118, 15, 13),
(119, 15, 1),
(134, 15, 13),
(8, 16, 25),
(9, 16, 1),
(61, 16, 1),
(118, 16, 20),
(119, 16, 1),
(134, 16, 20),
(12, 17, 1),
(15, 17, 1),
(46, 17, 7),
(47, 17, 1),
(48, 17, 1),
(49, 17, 1),
(123, 17, 1),
(127, 17, 1),
(10, 18, 1),
(11, 18, 1),
(12, 18, 1),
(46, 18, 13),
(47, 18, 1),
(48, 18, 7),
(49, 18, 1),
(13, 19, 1),
(14, 19, 1),
(15, 19, 1),
(48, 19, 13),
(49, 19, 1),
(6, 20, 1),
(12, 20, 1),
(16, 20, 1),
(17, 20, 1),
(18, 20, 1),
(83, 20, 1),
(84, 20, 1),
(85, 20, 1),
(123, 20, 7),
(130, 20, 7),
(142, 20, 1),
(144, 20, 13),
(145, 20, 13),
(146, 20, 13),
(149, 20, 13),
(12, 21, 1),
(17, 21, 1),
(18, 21, 1),
(84, 21, 7),
(85, 21, 1),
(142, 21, 7),
(18, 22, 1),
(84, 22, 13),
(85, 22, 1),
(15, 23, 1),
(29, 23, 1),
(30, 23, 1),
(31, 23, 1),
(32, 23, 1),
(33, 23, 1),
(34, 23, 1),
(47, 23, 1),
(88, 23, 1),
(89, 23, 1),
(15, 24, 1),
(29, 24, 7),
(30, 24, 1),
(31, 24, 1),
(32, 24, 7),
(33, 24, 1),
(34, 24, 1),
(72, 24, 13),
(73, 24, 1),
(88, 24, 7),
(89, 24, 1),
(29, 25, 13),
(30, 25, 1),
(31, 25, 1),
(32, 25, 13),
(33, 25, 1),
(34, 25, 1),
(88, 25, 13),
(89, 25, 1),
(25, 26, 1),
(26, 26, 1),
(81, 26, 1),
(82, 26, 1),
(83, 26, 1),
(100, 26, 1),
(101, 26, 1),
(125, 26, 1),
(135, 26, 1),
(145, 26, 1),
(151, 26, 1),
(25, 27, 15),
(26, 27, 1),
(81, 27, 15),
(82, 27, 1),
(83, 27, 1),
(100, 27, 15),
(101, 27, 1),
(125, 27, 7),
(135, 27, 7),
(145, 27, 7),
(25, 28, 10),
(26, 28, 1),
(81, 28, 10),
(82, 28, 1),
(83, 28, 1),
(100, 28, 10),
(101, 28, 1),
(125, 28, 13),
(135, 28, 13),
(27, 29, 1),
(28, 29, 1),
(50, 29, 1),
(51, 29, 1),
(95, 29, 1),
(104, 29, 1),
(105, 29, 1),
(111, 29, 1),
(112, 29, 1),
(128, 29, 7),
(143, 29, 13),
(27, 30, 15),
(28, 30, 1),
(31, 30, 1),
(34, 30, 1),
(50, 30, 7),
(51, 30, 1),
(89, 30, 1),
(104, 30, 15),
(105, 30, 1),
(111, 30, 15),
(112, 30, 1),
(128, 30, 13),
(27, 31, 7),
(28, 31, 1),
(50, 31, 13),
(51, 31, 1),
(104, 31, 7),
(105, 31, 1),
(111, 31, 7),
(112, 31, 1),
(51, 32, 1),
(95, 32, 7),
(138, 33, 13),
(139, 33, 1),
(140, 33, 13),
(141, 33, 1),
(95, 34, 20),
(112, 34, 1),
(139, 34, 7),
(141, 34, 7),
(142, 34, 13),
(56, 35, 1),
(57, 35, 1),
(58, 35, 1),
(62, 35, 1),
(56, 36, 7),
(57, 36, 1),
(58, 36, 1),
(56, 37, 13),
(57, 37, 1),
(58, 37, 1),
(35, 38, 15),
(36, 38, 1),
(39, 38, 15),
(40, 38, 1),
(41, 38, 1),
(49, 38, 1),
(63, 38, 1),
(64, 38, 1),
(65, 38, 1),
(79, 38, 1),
(80, 38, 1),
(94, 38, 1),
(96, 38, 1),
(97, 38, 1),
(102, 38, 15),
(103, 38, 1),
(113, 38, 15),
(120, 38, 20),
(121, 38, 1),
(122, 38, 1),
(124, 38, 13),
(137, 38, 7),
(150, 38, 1),
(151, 38, 1),
(63, 39, 1),
(64, 39, 1),
(65, 39, 1),
(79, 39, 1),
(80, 39, 1),
(96, 39, 1),
(97, 39, 1),
(122, 39, 7),
(63, 40, 1),
(64, 40, 1),
(65, 40, 1),
(79, 40, 1),
(80, 40, 1),
(96, 40, 1),
(97, 40, 1),
(122, 40, 13),
(150, 40, 1),
(151, 40, 1),
(86, 41, 7),
(87, 41, 1),
(90, 41, 7),
(91, 41, 1),
(120, 41, 13),
(121, 41, 1),
(124, 41, 1),
(131, 41, 7),
(144, 41, 1),
(86, 42, 13),
(87, 42, 1),
(90, 42, 13),
(91, 42, 1),
(124, 42, 7),
(131, 42, 13),
(144, 42, 7),
(87, 43, 1),
(91, 43, 1),
(130, 44, 13),
(147, 44, 1),
(148, 44, 1),
(149, 44, 1),
(42, 46, 7),
(43, 46, 1),
(44, 46, 1),
(92, 46, 1),
(93, 46, 1),
(94, 46, 1),
(42, 47, 13),
(43, 47, 1),
(44, 47, 1),
(92, 47, 7),
(93, 47, 1),
(94, 47, 1),
(44, 48, 1),
(92, 48, 13),
(93, 48, 1),
(94, 48, 1);

-- --------------------------------------------------------

--
-- Structure de la table `pokemon_moves`
--

DROP TABLE IF EXISTS `pokemon_moves`;
CREATE TABLE IF NOT EXISTS `pokemon_moves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pokemon_id` int DEFAULT NULL,
  `move_id` int NOT NULL,
  `pp_ups` int DEFAULT '0',
  `slot` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pokemon_moves_pokemon_id` (`pokemon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `pokemon_moves`
--

INSERT INTO `pokemon_moves` (`id`, `pokemon_id`, `move_id`, `pp_ups`, `slot`) VALUES
(1, 1, 1, 0, 0),
(2, 1, 13, 0, 1),
(3, 2, 5, 0, 0),
(4, 3, 1, 0, 0),
(5, 3, 29, 0, 1),
(8, 4, 1, 0, 0),
(9, 4, 23, 0, 1),
(10, 5, 1, 0, 0),
(11, 5, 9, 0, 1),
(12, 5, 35, 0, 2),
(13, 5, 36, 0, 3),
(14, 7, 1, 0, 0),
(15, 7, 13, 0, 1),
(16, 11, 1, 0, 0),
(17, 13, 1, 0, 0),
(18, 13, 29, 0, 1),
(19, 14, 13, 0, 0),
(20, 15, 1, 0, 0),
(21, 15, 29, 0, 1);

-- --------------------------------------------------------

--
-- Structure de la table `pokemon_types`
--

DROP TABLE IF EXISTS `pokemon_types`;
CREATE TABLE IF NOT EXISTS `pokemon_types` (
  `pokemon_id` int NOT NULL,
  `type_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`pokemon_id`,`type_id`),
  KEY `type_id` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `pokemon_types`
--

INSERT INTO `pokemon_types` (`pokemon_id`, `type_id`, `is_primary`) VALUES
(1, 4, 1),
(2, 4, 1),
(3, 4, 1),
(4, 2, 1),
(5, 2, 1),
(6, 2, 1),
(6, 10, 0),
(7, 3, 1),
(8, 3, 1),
(9, 3, 1),
(10, 12, 1),
(11, 12, 1),
(12, 10, 0),
(12, 12, 1),
(13, 8, 0),
(13, 12, 1),
(14, 8, 0),
(14, 12, 1),
(15, 8, 0),
(15, 12, 1),
(16, 1, 1),
(16, 10, 0),
(17, 1, 1),
(17, 10, 0),
(18, 1, 1),
(18, 10, 0),
(19, 1, 1),
(20, 1, 1),
(21, 1, 1),
(21, 10, 0),
(22, 1, 1),
(22, 10, 0),
(23, 8, 1),
(24, 8, 1),
(25, 5, 1),
(26, 5, 1),
(27, 9, 1),
(28, 9, 1),
(29, 8, 1),
(30, 8, 1),
(31, 8, 1),
(31, 9, 0),
(32, 8, 1),
(33, 8, 1),
(34, 8, 1),
(34, 9, 0),
(35, 18, 1),
(36, 18, 1),
(37, 2, 1),
(38, 2, 1),
(39, 1, 1),
(39, 18, 0),
(40, 1, 1),
(40, 18, 0),
(41, 8, 1),
(41, 10, 0),
(42, 8, 1),
(42, 10, 0),
(43, 4, 1),
(43, 8, 0),
(44, 4, 1),
(44, 8, 0),
(45, 4, 1),
(45, 8, 0),
(46, 4, 0),
(46, 12, 1),
(47, 4, 0),
(47, 12, 1),
(48, 8, 0),
(48, 12, 1),
(49, 8, 0),
(49, 12, 1),
(50, 9, 1),
(51, 9, 1),
(52, 1, 1),
(53, 1, 1),
(54, 3, 1),
(55, 3, 1),
(56, 7, 1),
(57, 7, 1),
(58, 2, 1),
(59, 2, 1),
(60, 3, 1),
(61, 3, 1),
(62, 3, 1),
(62, 7, 0),
(63, 11, 1),
(64, 11, 1),
(65, 11, 1),
(66, 7, 1),
(67, 7, 1),
(68, 7, 1),
(69, 4, 1),
(69, 8, 0),
(70, 4, 1),
(70, 8, 0),
(71, 4, 1),
(71, 8, 0),
(72, 3, 1),
(72, 8, 0),
(73, 3, 1),
(73, 8, 0),
(74, 9, 0),
(74, 13, 1),
(75, 9, 0),
(75, 13, 1),
(76, 9, 0),
(76, 13, 1),
(77, 2, 1),
(78, 2, 1),
(79, 3, 1),
(79, 11, 0),
(80, 3, 1),
(80, 11, 0),
(81, 5, 1),
(81, 17, 0),
(82, 5, 1),
(82, 17, 0),
(83, 1, 1),
(83, 10, 0),
(84, 1, 1),
(84, 10, 0),
(85, 1, 1),
(85, 10, 0),
(86, 3, 1),
(87, 3, 1),
(87, 6, 0),
(88, 8, 1),
(89, 8, 1),
(90, 3, 1),
(91, 3, 1),
(91, 6, 0),
(92, 8, 0),
(92, 14, 1),
(93, 8, 0),
(93, 14, 1),
(94, 8, 0),
(94, 14, 1),
(95, 9, 0),
(95, 13, 1),
(96, 11, 1),
(97, 11, 1),
(98, 3, 1),
(99, 3, 1),
(100, 5, 1),
(101, 5, 1),
(102, 4, 1),
(102, 11, 0),
(103, 4, 1),
(103, 11, 0),
(104, 9, 1),
(105, 9, 1),
(106, 7, 1),
(107, 7, 1),
(108, 1, 1),
(109, 8, 1),
(110, 8, 1),
(111, 9, 1),
(111, 13, 0),
(112, 9, 1),
(112, 13, 0),
(113, 1, 1),
(114, 4, 1),
(115, 1, 1),
(116, 3, 1),
(117, 3, 1),
(118, 3, 1),
(119, 3, 1),
(120, 3, 1),
(121, 3, 1),
(121, 11, 0),
(122, 11, 1),
(122, 18, 0),
(123, 10, 0),
(123, 12, 1),
(124, 6, 1),
(124, 11, 0),
(125, 5, 1),
(126, 2, 1),
(127, 12, 1),
(128, 1, 1),
(129, 3, 1),
(130, 3, 1),
(130, 10, 0),
(131, 3, 1),
(131, 6, 0),
(132, 1, 1),
(133, 1, 1),
(134, 3, 1),
(135, 5, 1),
(136, 2, 1),
(137, 1, 1),
(138, 3, 0),
(138, 13, 1),
(139, 3, 0),
(139, 13, 1),
(140, 3, 0),
(140, 13, 1),
(141, 3, 0),
(141, 13, 1),
(142, 10, 0),
(142, 13, 1),
(143, 1, 1),
(144, 6, 1),
(144, 10, 0),
(145, 5, 1),
(145, 10, 0),
(146, 2, 1),
(146, 10, 0),
(147, 15, 1),
(148, 15, 1),
(149, 10, 0),
(149, 15, 1),
(150, 11, 1),
(151, 11, 1);

-- --------------------------------------------------------

--
-- Structure de la table `team_pokemon`
--

DROP TABLE IF EXISTS `team_pokemon`;
CREATE TABLE IF NOT EXISTS `team_pokemon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `pokemon_id` int NOT NULL,
  `slot` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_slot` (`user_id`,`slot`),
  UNIQUE KEY `unique_user_pokemon` (`user_id`,`pokemon_id`),
  KEY `pokemon_id` (`pokemon_id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `team_pokemon`
--

INSERT INTO `team_pokemon` (`id`, `user_id`, `pokemon_id`, `slot`) VALUES
(1, 1, 90, 0),
(2, 2, 102, 0),
(3, 1, 7, 1),
(4, 1, 29, 2),
(5, 1, 98, 3),
(6, 2, 58, 1),
(7, 2, 108, 2),
(8, 2, 69, 4),
(9, 2, 104, 3),
(10, 3, 52, 0),
(11, 3, 151, 1),
(12, 3, 111, 2),
(17, 3, 50, 3),
(18, 3, 118, 4),
(19, 3, 23, 5);

-- --------------------------------------------------------

--
-- Structure de la table `types`
--

DROP TABLE IF EXISTS `types`;
CREATE TABLE IF NOT EXISTS `types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `color` varchar(7) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `types`
--

INSERT INTO `types` (`id`, `name`, `color`) VALUES
(1, 'Normal', '#A8A878'),
(2, 'Feu', '#F08030'),
(3, 'Eau', '#6890F0'),
(4, 'Plante', '#78C850'),
(5, 'Électrik', '#F8D030'),
(6, 'Glace', '#98D8D8'),
(7, 'Combat', '#C03028'),
(8, 'Poison', '#A040A0'),
(9, 'Sol', '#E0C068'),
(10, 'Vol', '#A890F0'),
(11, 'Psy', '#F85888'),
(12, 'Insecte', '#A8B820'),
(13, 'Roche', '#B8A038'),
(14, 'Spectre', '#705898'),
(15, 'Dragon', '#7038F8'),
(16, 'Ténèbres', '#705848'),
(17, 'Acier', '#B8B8D0'),
(18, 'Fée', '#EE99AC');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `elo_rating` int DEFAULT '1000',
  `wins` int DEFAULT '0',
  `losses` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `avatar`, `created_at`, `last_login`, `elo_rating`, `wins`, `losses`) VALUES
(1, 'per', 'per@gmail.com', '$2b$10$YAXDwP5fNYDFyNCrGxkRiujornZsKEw4zj2qZbN.fS.MXsuK0hnOO', NULL, '2025-05-10 13:33:47', '2025-05-11 13:22:31', 1000, 0, 0),
(2, 'player2', 'p2@gmail.com', '$2b$10$7naUN7ECtcn0nJLtDUVY8uhJ7YC0Qria6.9c3lL6heYcKW73nKcsC', NULL, '2025-05-10 13:42:16', '2025-05-11 13:52:43', 1000, 0, 0),
(3, 'lolo', 'lolo@gmail.com', '$2b$10$vQ.whpaYugeiru1GPjY4D.NVpRkBbXHQDiwxBcOFTHVqu7NOGk/VW', NULL, '2025-05-12 07:11:11', NULL, 1000, 0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `user_pokemon`
--

DROP TABLE IF EXISTS `user_pokemon`;
CREATE TABLE IF NOT EXISTS `user_pokemon` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `pokemon_id` int NOT NULL,
  `level` int DEFAULT '1',
  `hp` int DEFAULT '50',
  `max_hp` int DEFAULT '50',
  `is_starter` tinyint(1) DEFAULT '0',
  `is_shiny` tinyint(1) DEFAULT '0',
  `rarity` enum('normal','legendary') DEFAULT 'normal',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `pokemon_id` (`pokemon_id`),
  KEY `idx_user_pokemon_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `user_pokemon`
--

INSERT INTO `user_pokemon` (`id`, `user_id`, `pokemon_id`, `level`, `hp`, `max_hp`, `is_starter`, `is_shiny`, `rarity`, `created_at`) VALUES
(1, 1, 90, 1, 50, 50, 0, 0, 'normal', '2025-05-10 13:33:51'),
(2, 2, 102, 1, 50, 50, 0, 0, 'normal', '2025-05-10 13:42:21'),
(3, 2, 104, 1, 50, 50, 0, 0, 'normal', '2025-05-10 14:00:36'),
(4, 1, 29, 1, 50, 50, 0, 0, 'normal', '2025-05-10 22:41:48'),
(5, 2, 58, 1, 50, 50, 0, 0, 'legendary', '2025-05-10 22:41:50'),
(6, 2, 69, 1, 50, 50, 0, 0, 'normal', '2025-05-10 22:41:53'),
(7, 1, 7, 1, 50, 50, 0, 0, 'normal', '2025-05-10 22:41:54'),
(8, 2, 108, 1, 50, 50, 0, 0, 'legendary', '2025-05-10 22:41:58'),
(9, 1, 98, 1, 50, 50, 0, 0, 'normal', '2025-05-10 22:41:59'),
(10, 3, 52, 1, 50, 50, 0, 0, 'normal', '2025-05-12 07:11:34'),
(11, 3, 151, 1, 50, 50, 0, 1, '', '2025-05-12 07:11:40'),
(12, 3, 23, 1, 50, 50, 0, 0, 'normal', '2025-05-12 07:11:52'),
(13, 3, 50, 1, 50, 50, 0, 0, 'normal', '2025-05-12 07:11:55'),
(14, 3, 118, 1, 50, 50, 0, 0, 'normal', '2025-05-12 07:11:59'),
(15, 3, 111, 1, 50, 50, 0, 0, 'normal', '2025-05-12 07:12:02');

--
-- Déclencheurs `user_pokemon`
--
DROP TRIGGER IF EXISTS `after_user_pokemon_insert`;
DELIMITER $$
CREATE TRIGGER `after_user_pokemon_insert` AFTER INSERT ON `user_pokemon` FOR EACH ROW BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE moveId INT;
  DECLARE learnLevel INT;
  DECLARE slot INT DEFAULT 0;
  DECLARE cur CURSOR FOR
    SELECT move_id, learn_level
    FROM pokemon_learnable_moves
    WHERE pokemon_id = NEW.pokemon_id AND learn_level <= NEW.level
    ORDER BY learn_level ASC
    LIMIT 4;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO moveId, learnLevel;
    IF done THEN
      LEAVE read_loop;
    END IF;
    INSERT INTO pokemon_moves (pokemon_id, move_id, slot)
    VALUES (NEW.id, moveId, slot);
    SET slot = slot + 1;
  END LOOP;
  CLOSE cur;
END
$$
DELIMITER ;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `area_pokemon`
--
ALTER TABLE `area_pokemon`
  ADD CONSTRAINT `area_pokemon_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `exploration_areas` (`id`),
  ADD CONSTRAINT `area_pokemon_ibfk_2` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemon` (`id`);

--
-- Contraintes pour la table `battles`
--
ALTER TABLE `battles`
  ADD CONSTRAINT `battles_ibfk_1` FOREIGN KEY (`player1_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `battles_ibfk_2` FOREIGN KEY (`player2_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `battles_ibfk_3` FOREIGN KEY (`winner_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`player1_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`player2_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`winner_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `match_actions`
--
ALTER TABLE `match_actions`
  ADD CONSTRAINT `match_actions_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`),
  ADD CONSTRAINT `match_actions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `match_actions_ibfk_3` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemon` (`id`),
  ADD CONSTRAINT `match_actions_ibfk_4` FOREIGN KEY (`move_id`) REFERENCES `moves` (`id`),
  ADD CONSTRAINT `match_actions_ibfk_5` FOREIGN KEY (`target_pokemon_id`) REFERENCES `pokemon` (`id`);

--
-- Contraintes pour la table `match_pokemon`
--
ALTER TABLE `match_pokemon`
  ADD CONSTRAINT `match_pokemon_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`),
  ADD CONSTRAINT `match_pokemon_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `match_pokemon_ibfk_3` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemon` (`id`);

--
-- Contraintes pour la table `moves`
--
ALTER TABLE `moves`
  ADD CONSTRAINT `moves_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `types` (`id`);

--
-- Contraintes pour la table `pokemon_learnable_moves`
--
ALTER TABLE `pokemon_learnable_moves`
  ADD CONSTRAINT `pokemon_learnable_moves_ibfk_1` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemon` (`id`),
  ADD CONSTRAINT `pokemon_learnable_moves_ibfk_2` FOREIGN KEY (`move_id`) REFERENCES `moves` (`id`);

--
-- Contraintes pour la table `pokemon_moves`
--
ALTER TABLE `pokemon_moves`
  ADD CONSTRAINT `pokemon_moves_ibfk_1` FOREIGN KEY (`pokemon_id`) REFERENCES `user_pokemon` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `pokemon_types`
--
ALTER TABLE `pokemon_types`
  ADD CONSTRAINT `pokemon_types_ibfk_1` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemon` (`id`),
  ADD CONSTRAINT `pokemon_types_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `types` (`id`);

--
-- Contraintes pour la table `team_pokemon`
--
ALTER TABLE `team_pokemon`
  ADD CONSTRAINT `team_pokemon_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `team_pokemon_ibfk_2` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemon` (`id`);

--
-- Contraintes pour la table `user_pokemon`
--
ALTER TABLE `user_pokemon`
  ADD CONSTRAINT `user_pokemon_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_pokemon_ibfk_2` FOREIGN KEY (`pokemon_id`) REFERENCES `pokemon` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
