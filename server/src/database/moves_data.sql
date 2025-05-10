-- Vider les tables existantes
DELETE FROM pokemon_learnable_moves;
DELETE FROM moves;

-- Insérer les attaques de base
INSERT INTO moves (id, name, type_id, power, accuracy, pp, description) VALUES
-- Attaques de type Normal
(1, 'Charge', (SELECT id FROM types WHERE name = 'Normal'), 40, 100, 35, 'Une charge physique basique.'),
(2, 'Griffe', (SELECT id FROM types WHERE name = 'Normal'), 40, 100, 35, 'Lacère l''ennemi avec des griffes acérées.'),
(3, 'Rugissement', (SELECT id FROM types WHERE name = 'Normal'), NULL, 100, 40, 'Baisse l''Attaque de l''ennemi.'),
(4, 'Morsure', (SELECT id FROM types WHERE name = 'Normal'), 60, 100, 25, 'Mord l''ennemi avec des crocs acérés.'),

-- Attaques de type Plante
(5, 'Fouet Lianes', (SELECT id FROM types WHERE name = 'Plante'), 45, 100, 25, 'Le Pokémon fouette l''ennemi avec de fines lianes.'),
(6, 'Tranch''Herbe', (SELECT id FROM types WHERE name = 'Plante'), 55, 95, 25, 'Des feuilles tranchantes comme des rasoirs lacèrent l''ennemi.'),
(7, 'Vampigraine', (SELECT id FROM types WHERE name = 'Plante'), NULL, 90, 10, 'Plante des graines qui drainent les PV de l''ennemi à chaque tour.'),
(8, 'Lance-Soleil', (SELECT id FROM types WHERE name = 'Plante'), 120, 100, 10, 'Absorbe la lumière au premier tour et attaque au second.'),

-- Attaques de type Feu
(9, 'Flammèche', (SELECT id FROM types WHERE name = 'Feu'), 40, 100, 25, 'Une faible attaque de feu qui peut brûler l''ennemi.'),
(10, 'Flamme', (SELECT id FROM types WHERE name = 'Feu'), 90, 100, 15, 'Une puissante attaque de feu qui peut brûler l''ennemi.'),
(11, 'Lance-Flammes', (SELECT id FROM types WHERE name = 'Feu'), 90, 100, 15, 'Un souffle de feu intense qui peut brûler l''ennemi.'),
(12, 'Déflagration', (SELECT id FROM types WHERE name = 'Feu'), 110, 85, 5, 'Une explosion de feu dévastatrice qui peut brûler l''ennemi.'),

-- Attaques de type Eau
(13, 'Pistolet à O', (SELECT id FROM types WHERE name = 'Eau'), 40, 100, 25, 'De l''eau est projetée avec force sur l''ennemi.'),
(14, 'Bulle d''O', (SELECT id FROM types WHERE name = 'Eau'), 65, 100, 20, 'Des bulles sont envoyées sur l''ennemi.'),
(15, 'Hydrocanon', (SELECT id FROM types WHERE name = 'Eau'), 110, 80, 5, 'Un puissant jet d''eau est projeté sur l''ennemi.'),
(16, 'Surf', (SELECT id FROM types WHERE name = 'Eau'), 90, 100, 15, 'Une énorme vague s''abat sur le terrain.'),

-- Attaques de type Insecte
(17, 'Piqûre', (SELECT id FROM types WHERE name = 'Insecte'), 60, 100, 20, 'Pique l''ennemi avec un dard.'),
(18, 'Toile', (SELECT id FROM types WHERE name = 'Insecte'), NULL, 95, 15, 'Ralentit l''ennemi avec une toile collante.'),
(19, 'Dard-Venin', (SELECT id FROM types WHERE name = 'Insecte'), 15, 100, 35, 'Un dard toxique qui peut empoisonner.'),

-- Attaques de type Vol
(20, 'Tornade', (SELECT id FROM types WHERE name = 'Vol'), 40, 100, 35, 'Crée une tornade qui frappe l''ennemi.'),
(21, 'Cru-Aile', (SELECT id FROM types WHERE name = 'Vol'), 60, 100, 35, 'Frappe l''ennemi avec des ailes.'),
(22, 'Cyclone', (SELECT id FROM types WHERE name = 'Vol'), NULL, 100, 20, 'Force l''ennemi à quitter le combat.'),

-- Attaques de type Poison
(23, 'Gaz Toxik', (SELECT id FROM types WHERE name = 'Poison'), NULL, 90, 40, 'Un gaz toxique qui peut empoisonner.'),
(24, 'Acide', (SELECT id FROM types WHERE name = 'Poison'), 40, 100, 30, 'Asperge l''ennemi d''acide corrosif.'),
(25, 'Bomb-Beurk', (SELECT id FROM types WHERE name = 'Poison'), 90, 100, 10, 'Lance des déchets toxiques sur l''ennemi.'),

-- Attaques de type Électrik
(26, 'Éclair', (SELECT id FROM types WHERE name = 'Électrik'), 40, 100, 30, 'Une décharge électrique basique.'),
(27, 'Tonnerre', (SELECT id FROM types WHERE name = 'Électrik'), 110, 70, 10, 'Une puissante décharge électrique.'),
(28, 'Cage-Éclair', (SELECT id FROM types WHERE name = 'Électrik'), NULL, 100, 20, 'Paralyse l''ennemi avec de l''électricité statique.'),

-- Attaques de type Sol
(29, 'Tunnel', (SELECT id FROM types WHERE name = 'Sol'), 80, 100, 10, 'Creuse un tunnel et attaque au second tour.'),
(30, 'Séisme', (SELECT id FROM types WHERE name = 'Sol'), 100, 100, 10, 'Un tremblement de terre qui frappe tous les Pokémon.'),
(31, 'Jet-Pierres', (SELECT id FROM types WHERE name = 'Sol'), 50, 90, 15, 'Lance des pierres sur l''ennemi.'),

-- Attaques de type Roche
(32, 'Jet de Sable', (SELECT id FROM types WHERE name = 'Roche'), NULL, 100, 15, 'Réduit la précision de l''ennemi.'),
(33, 'Lance-Pierre', (SELECT id FROM types WHERE name = 'Roche'), 50, 90, 15, 'Lance des pierres sur l''ennemi.'),
(34, 'Éboulement', (SELECT id FROM types WHERE name = 'Roche'), 75, 90, 10, 'Fait tomber des rochers sur l''ennemi.'),

-- Attaques de type Combat
(35, 'Poing-Karaté', (SELECT id FROM types WHERE name = 'Combat'), 50, 100, 25, 'Un coup de poing puissant.'),
(36, 'Balayage', (SELECT id FROM types WHERE name = 'Combat'), 60, 85, 20, 'Un coup de pied qui peut faire tomber l''ennemi.'),
(37, 'Poing de Feu', (SELECT id FROM types WHERE name = 'Combat'), 75, 100, 15, 'Un coup de poing enflammé qui peut brûler.'),

-- Attaques de type Psy
(38, 'Psyko', (SELECT id FROM types WHERE name = 'Psy'), 90, 100, 10, 'Une puissante attaque psychique.'),
(39, 'Téléport', (SELECT id FROM types WHERE name = 'Psy'), NULL, 100, 20, 'Permet de fuir le combat.'),
(40, 'Hypnose', (SELECT id FROM types WHERE name = 'Psy'), NULL, 60, 20, 'Endort l''ennemi.'),

-- Attaques de type Glace
(41, 'Laser Glace', (SELECT id FROM types WHERE name = 'Glace'), 90, 100, 10, 'Un rayon de glace qui peut geler.'),
(42, 'Blizzard', (SELECT id FROM types WHERE name = 'Glace'), 110, 70, 5, 'Une tempête de neige qui peut geler.'),
(43, 'Poudreuse', (SELECT id FROM types WHERE name = 'Glace'), 40, 100, 25, 'Une bouffée de neige qui peut geler.'),

-- Attaques de type Dragon
(44, 'Draco-Rage', (SELECT id FROM types WHERE name = 'Dragon'), 40, 100, 10, 'Une attaque draconique qui inflige toujours 40 dégâts.'),
(45, 'Ouragan', (SELECT id FROM types WHERE name = 'Dragon'), 110, 70, 10, 'Une attaque draconique puissante.'),

-- Attaques de type Spectre
(46, 'Léchouille', (SELECT id FROM types WHERE name = 'Spectre'), 30, 100, 30, 'Lèche l''ennemi et peut le paralyser.'),
(47, 'Ball''Ombre', (SELECT id FROM types WHERE name = 'Spectre'), 80, 100, 15, 'Une boule d''ombre qui peut baisser la Défense.'),
(48, 'Destiny Bond', (SELECT id FROM types WHERE name = 'Spectre'), NULL, 100, 5, 'Si le Pokémon est K.O., l''ennemi est aussi K.O.');

-- Associer les attaques aux Pokémon
INSERT INTO pokemon_learnable_moves (pokemon_id, move_id, learn_level) VALUES
-- Bulbizarre et évolutions
(1, 1, 1),   -- Charge
(1, 5, 1),   -- Fouet Lianes
(1, 6, 7),   -- Tranch'Herbe
(1, 8, 20),  -- Lance-Soleil
(2, 5, 1),   -- Fouet Lianes
(2, 6, 1),   -- Tranch'Herbe
(2, 7, 1),   -- Vampigraine
(2, 8, 25),  -- Lance-Soleil
(3, 5, 1),   -- Fouet Lianes
(3, 6, 1),   -- Tranch'Herbe
(3, 7, 1),   -- Vampigraine
(3, 8, 1),   -- Lance-Soleil

-- Salamèche et évolutions
(4, 1, 1),   -- Charge
(4, 9, 1),   -- Flammèche
(4, 10, 7),  -- Flamme
(4, 12, 20), -- Déflagration
(5, 9, 1),   -- Flammèche
(5, 10, 1),  -- Flamme
(5, 11, 13), -- Lance-Flammes
(5, 12, 25), -- Déflagration
(6, 9, 1),   -- Flammèche
(6, 10, 1),  -- Flamme
(6, 11, 1),  -- Lance-Flammes
(6, 20, 1),  -- Tornade

-- Carapuce et évolutions
(7, 1, 1),   -- Charge
(7, 13, 1),  -- Pistolet à O
(7, 14, 7),  -- Bulle d'O
(7, 15, 13), -- Hydrocanon
(8, 13, 1),  -- Pistolet à O
(8, 14, 1),  -- Bulle d'O
(8, 15, 13), -- Hydrocanon
(8, 16, 25), -- Surf
(9, 13, 1),  -- Pistolet à O
(9, 14, 1),  -- Bulle d'O
(9, 15, 1),  -- Hydrocanon
(9, 16, 1),  -- Surf

-- Chenipan et évolutions
(10, 1, 1),  -- Charge
(10, 18, 1), -- Toile
(11, 3, 1),  -- Rugissement
(11, 18, 1), -- Toile
(12, 17, 1), -- Piqûre
(12, 18, 1), -- Toile
(12, 20, 1), -- Tornade
(12, 21, 1), -- Cru-Aile

-- Aspicot et évolutions
(13, 1, 1),   -- Charge
(13, 19, 1),  -- Dard-Venin
(14, 3, 1),   -- Rugissement
(14, 19, 1),  -- Dard-Venin
(15, 17, 1),  -- Piqûre
(15, 19, 1),  -- Dard-Venin
(15, 23, 1),  -- Gaz Toxik
(15, 24, 1),  -- Acide

-- Roucool et évolutions
(16, 1, 1),   -- Charge
(16, 20, 1),  -- Tornade
(17, 20, 1),  -- Tornade
(17, 21, 1),  -- Cru-Aile
(18, 20, 1),  -- Tornade
(18, 21, 1),  -- Cru-Aile
(18, 22, 1),  -- Cyclone

-- Rattata et évolution
(19, 1, 1),   -- Charge
(19, 2, 1),   -- Griffe
(19, 4, 1),   -- Morsure
(20, 1, 1),   -- Charge
(20, 2, 1),   -- Griffe
(20, 4, 1),   -- Morsure

-- Pikachu et évolution
(25, 1, 1),   -- Charge
(25, 26, 1),  -- Éclair
(25, 27, 15), -- Tonnerre
(25, 28, 10), -- Cage-Éclair
(26, 26, 1),  -- Éclair
(26, 27, 1),  -- Tonnerre
(26, 28, 1),  -- Cage-Éclair

-- Sabelette et évolution
(27, 1, 1),   -- Charge
(27, 29, 1),  -- Tunnel
(27, 30, 15), -- Séisme
(27, 31, 7),  -- Jet-Pierres
(28, 29, 1),  -- Tunnel
(28, 30, 1),  -- Séisme
(28, 31, 1),  -- Jet-Pierres

-- Nidoran♀ et évolutions
(29, 1, 1),   -- Charge
(29, 23, 1),  -- Gaz Toxik
(29, 24, 7),  -- Acide
(29, 25, 13), -- Bomb-Beurk
(30, 23, 1),  -- Gaz Toxik
(30, 24, 1),  -- Acide
(30, 25, 1),  -- Bomb-Beurk
(31, 23, 1),  -- Gaz Toxik
(31, 24, 1),  -- Acide
(31, 25, 1),  -- Bomb-Beurk
(31, 30, 1),  -- Séisme

-- Nidoran♂ et évolutions
(32, 1, 1),   -- Charge
(32, 23, 1),  -- Gaz Toxik
(32, 24, 7),  -- Acide
(32, 25, 13), -- Bomb-Beurk
(33, 23, 1),  -- Gaz Toxik
(33, 24, 1),  -- Acide
(33, 25, 1),  -- Bomb-Beurk
(34, 23, 1),  -- Gaz Toxik
(34, 24, 1),  -- Acide
(34, 25, 1),  -- Bomb-Beurk
(34, 30, 1),  -- Séisme

-- Mélofée et évolution
(35, 1, 1),   -- Charge
(35, 3, 1),   -- Rugissement
(35, 38, 15), -- Psyko
(36, 1, 1),   -- Charge
(36, 3, 1),   -- Rugissement
(36, 38, 1),  -- Psyko

-- Goupix et évolution
(37, 1, 1),   -- Charge
(37, 9, 1),   -- Flammèche
(37, 10, 7),  -- Flamme
(37, 11, 13), -- Lance-Flammes
(38, 9, 1),   -- Flammèche
(38, 10, 1),  -- Flamme
(38, 11, 1),  -- Lance-Flammes
(38, 12, 1),  -- Déflagration

-- Rondoudou et évolutions
(39, 1, 1),   -- Charge
(39, 3, 1),   -- Rugissement
(39, 38, 15), -- Psyko
(40, 1, 1),   -- Charge
(40, 3, 1),   -- Rugissement
(40, 38, 1),  -- Psyko
(41, 1, 1),   -- Charge
(41, 3, 1),   -- Rugissement
(41, 38, 1),  -- Psyko

-- Nosferapti et évolutions
(42, 1, 1),   -- Charge
(42, 4, 1),   -- Morsure
(42, 46, 7),  -- Léchouille
(42, 47, 13), -- Ball'Ombre
(43, 4, 1),   -- Morsure
(43, 46, 1),  -- Léchouille
(43, 47, 1),  -- Ball'Ombre
(44, 4, 1),   -- Morsure
(44, 46, 1),  -- Léchouille
(44, 47, 1),  -- Ball'Ombre
(44, 48, 1),  -- Destiny Bond

-- Mystherbe et évolutions
(43, 1, 1),   -- Charge
(43, 5, 1),   -- Fouet Lianes
(43, 6, 7),   -- Tranch'Herbe
(43, 7, 13),  -- Vampigraine
(44, 5, 1),   -- Fouet Lianes
(44, 6, 1),   -- Tranch'Herbe
(44, 7, 1),   -- Vampigraine
(44, 8, 1),   -- Lance-Soleil
(45, 5, 1),   -- Fouet Lianes
(45, 6, 1),   -- Tranch'Herbe
(45, 7, 1),   -- Vampigraine
(45, 8, 1),   -- Lance-Soleil

-- Paras et évolution
(46, 1, 1),   -- Charge
(46, 5, 1),   -- Fouet Lianes
(46, 17, 7),  -- Piqûre
(46, 18, 13), -- Toile
(47, 5, 1),   -- Fouet Lianes
(47, 17, 1),  -- Piqûre
(47, 18, 1),  -- Toile
(47, 23, 1),  -- Gaz Toxik

-- Mimitoss et évolutions
(48, 1, 1),   -- Charge
(48, 17, 1),  -- Piqûre
(48, 18, 7),  -- Toile
(48, 19, 13), -- Dard-Venin
(49, 17, 1),  -- Piqûre
(49, 18, 1),  -- Toile
(49, 19, 1),  -- Dard-Venin
(49, 38, 1),  -- Psyko

-- Taupiqueur et évolution
(50, 1, 1),   -- Charge
(50, 29, 1),  -- Tunnel
(50, 30, 7),  -- Séisme
(50, 31, 13), -- Jet-Pierres
(51, 29, 1),  -- Tunnel
(51, 30, 1),  -- Séisme
(51, 31, 1),  -- Jet-Pierres
(51, 32, 1),  -- Jet de Sable

-- Machoc et évolutions
(56, 1, 1),   -- Charge
(56, 35, 1),  -- Poing-Karaté
(56, 36, 7),  -- Balayage
(56, 37, 13), -- Poing de Feu
(57, 35, 1),  -- Poing-Karaté
(57, 36, 1),  -- Balayage
(57, 37, 1),  -- Poing de Feu
(58, 35, 1),  -- Poing-Karaté
(58, 36, 1),  -- Balayage
(58, 37, 1),  -- Poing de Feu

-- Caninos et évolution
(58, 1, 1),   -- Charge
(58, 9, 1),   -- Flammèche
(58, 10, 7),  -- Flamme
(58, 11, 13), -- Lance-Flammes
(59, 9, 1),   -- Flammèche
(59, 10, 1),  -- Flamme
(59, 11, 1),  -- Lance-Flammes
(59, 12, 1),  -- Déflagration

-- Ptitard et évolutions
(60, 1, 1),   -- Charge
(60, 13, 1),  -- Pistolet à O
(60, 14, 7),  -- Bulle d'O
(60, 15, 13), -- Hydrocanon
(61, 13, 1),  -- Pistolet à O
(61, 14, 1),  -- Bulle d'O
(61, 15, 1),  -- Hydrocanon
(61, 16, 1),  -- Surf
(62, 13, 1),  -- Pistolet à O
(62, 14, 1),  -- Bulle d'O
(62, 15, 1),  -- Hydrocanon
(62, 35, 1),  -- Poing-Karaté

-- Abra et évolutions
(63, 1, 1),   -- Charge
(63, 38, 1),  -- Psyko
(63, 39, 1),  -- Téléport
(63, 40, 1),  -- Hypnose
(64, 38, 1),  -- Psyko
(64, 39, 1),  -- Téléport
(64, 40, 1),  -- Hypnose
(65, 38, 1),  -- Psyko
(65, 39, 1),  -- Téléport
(65, 40, 1),  -- Hypnose

-- Tentacool et évolution
(72, 1, 1),   -- Charge
(72, 13, 1),  -- Pistolet à O
(72, 14, 7),  -- Bulle d'O
(72, 24, 13), -- Acide
(73, 13, 1),  -- Pistolet à O
(73, 14, 1),  -- Bulle d'O
(73, 24, 1),  -- Acide
(73, 15, 1),  -- Hydrocanon

-- Ramoloss et évolutions
(79, 1, 1),   -- Charge
(79, 38, 1),  -- Psyko
(79, 39, 1),  -- Téléport
(79, 40, 1),  -- Hypnose
(80, 38, 1),  -- Psyko
(80, 39, 1),  -- Téléport
(80, 40, 1),  -- Hypnose
(80, 15, 1),  -- Hydrocanon

-- Magnéti et évolutions
(81, 1, 1),   -- Charge
(81, 26, 1),  -- Éclair
(81, 27, 15), -- Tonnerre
(81, 28, 10), -- Cage-Éclair
(82, 26, 1),  -- Éclair
(82, 27, 1),  -- Tonnerre
(82, 28, 1),  -- Cage-Éclair
(83, 26, 1),  -- Éclair
(83, 27, 1),  -- Tonnerre
(83, 28, 1),  -- Cage-Éclair
(83, 20, 1),  -- Tornade

-- Doduo et évolution
(84, 1, 1),   -- Charge
(84, 20, 1),  -- Tornade
(84, 21, 7),  -- Cru-Aile
(84, 22, 13), -- Cyclone
(85, 20, 1),  -- Tornade
(85, 21, 1),  -- Cru-Aile
(85, 22, 1),  -- Cyclone

-- Otaria et évolution
(86, 1, 1),   -- Charge
(86, 13, 1),  -- Pistolet à O
(86, 41, 7),  -- Laser Glace
(86, 42, 13), -- Blizzard
(87, 13, 1),  -- Pistolet à O
(87, 41, 1),  -- Laser Glace
(87, 42, 1),  -- Blizzard
(87, 43, 1),  -- Poudreuse

-- Tadmorv et évolution
(88, 1, 1),   -- Charge
(88, 23, 1),  -- Gaz Toxik
(88, 24, 7),  -- Acide
(88, 25, 13), -- Bomb-Beurk
(89, 23, 1),  -- Gaz Toxik
(89, 24, 1),  -- Acide
(89, 25, 1),  -- Bomb-Beurk
(89, 30, 1),  -- Séisme

-- Fantominus et évolutions
(92, 1, 1),   -- Charge
(92, 46, 1),  -- Léchouille
(92, 47, 7),  -- Ball'Ombre
(92, 48, 13), -- Destiny Bond
(93, 46, 1),  -- Léchouille
(93, 47, 1),  -- Ball'Ombre
(93, 48, 1),  -- Destiny Bond
(94, 46, 1),  -- Léchouille
(94, 47, 1),  -- Ball'Ombre
(94, 48, 1),  -- Destiny Bond
(94, 38, 1),  -- Psyko

-- Onix et évolution
(95, 1, 1),   -- Charge
(95, 29, 1),  -- Tunnel
(95, 32, 7),  -- Jet de Sable
(95, 34, 20), -- Éboulement

-- Soporifik et évolution
(96, 1, 1),   -- Charge
(96, 38, 1),  -- Psyko
(96, 39, 1),  -- Téléport
(96, 40, 1),  -- Hypnose
(97, 38, 1),  -- Psyko
(97, 39, 1),  -- Téléport
(97, 40, 1),  -- Hypnose

-- Kokiyas et évolution
(90, 1, 1),   -- Charge
(90, 13, 1),  -- Pistolet à O
(90, 41, 7),  -- Laser Glace
(90, 42, 13), -- Blizzard
(91, 13, 1),  -- Pistolet à O
(91, 41, 1),  -- Laser Glace
(91, 42, 1),  -- Blizzard
(91, 43, 1),  -- Poudreuse

-- Voltorbe et Electrode
(100, 26, 1),  -- Éclair
(100, 27, 15), -- Tonnerre
(100, 28, 10), -- Cage-Éclair
(100, 1, 1),   -- Charge
(101, 26, 1),  -- Éclair
(101, 27, 1),  -- Tonnerre
(101, 28, 1),  -- Cage-Éclair
(101, 1, 1),   -- Charge

-- Noeunoeuf et Noadkoko
(102, 5, 1),   -- Fouet Lianes
(102, 6, 7),   -- Tranch'Herbe
(102, 7, 13),  -- Vampigraine
(102, 38, 15), -- Psyko
(103, 5, 1),   -- Fouet Lianes
(103, 6, 1),   -- Tranch'Herbe
(103, 7, 1),   -- Vampigraine
(103, 38, 1),  -- Psyko

-- Osselait et Ossatueur
(104, 1, 1),   -- Charge
(104, 29, 1),  -- Tunnel
(104, 30, 15), -- Séisme
(104, 31, 7),  -- Jet-Pierres
(105, 29, 1),  -- Tunnel
(105, 30, 1),  -- Séisme
(105, 31, 1),  -- Jet-Pierres
(105, 1, 1),   -- Charge

-- Rhinocorne et Rhinoféros
(111, 1, 1),   -- Charge
(111, 29, 1),  -- Tunnel
(111, 30, 15), -- Séisme
(111, 31, 7),  -- Jet-Pierres
(112, 29, 1),  -- Tunnel
(112, 30, 1),  -- Séisme
(112, 31, 1),  -- Jet-Pierres
(112, 34, 1),  -- Éboulement

-- Leveinard
(113, 1, 1),   -- Charge
(113, 3, 1),   -- Rugissement
(113, 38, 15), -- Psyko

-- Saquedeneu
(114, 5, 1),   -- Fouet Lianes
(114, 6, 7),   -- Tranch'Herbe
(114, 7, 13),  -- Vampigraine
(114, 8, 20),  -- Lance-Soleil

-- Kangourex
(115, 1, 1),   -- Charge
(115, 2, 7),   -- Griffe
(115, 4, 13),  -- Morsure
(115, 3, 20),  -- Rugissement

-- Hypotrempe et Hypocéan
(116, 13, 1),  -- Pistolet à O
(116, 14, 7),  -- Bulle d'O
(116, 15, 13), -- Hydrocanon
(117, 13, 1),  -- Pistolet à O
(117, 14, 1),  -- Bulle d'O
(117, 15, 1),  -- Hydrocanon

-- Poissirène et Poissoroy
(118, 13, 1),  -- Pistolet à O
(118, 14, 7),  -- Bulle d'O
(118, 15, 13), -- Hydrocanon
(118, 16, 20), -- Surf
(119, 13, 1),  -- Pistolet à O
(119, 14, 1),  -- Bulle d'O
(119, 15, 1),  -- Hydrocanon
(119, 16, 1),  -- Surf

-- Stari et Staross
(120, 13, 1),  -- Pistolet à O
(120, 14, 7),  -- Bulle d'O
(120, 41, 13), -- Laser Glace
(120, 38, 20), -- Psyko
(121, 13, 1),  -- Pistolet à O
(121, 41, 1),  -- Laser Glace
(121, 38, 1),  -- Psyko

-- M. Mime
(122, 1, 1),   -- Charge
(122, 38, 1),  -- Psyko
(122, 39, 7),  -- Téléport
(122, 40, 13), -- Hypnose

-- Insécateur
(123, 1, 1),   -- Charge
(123, 17, 1),  -- Piqûre
(123, 20, 7),  -- Tornade
(123, 2, 13),  -- Griffe

-- Lippoutou
(124, 1, 1),   -- Charge
(124, 41, 1),  -- Laser Glace
(124, 42, 7),  -- Blizzard
(124, 38, 13), -- Psyko

-- Élektek
(125, 1, 1),   -- Charge
(125, 26, 1),  -- Éclair
(125, 27, 7),  -- Tonnerre
(125, 28, 13), -- Cage-Éclair

-- Magmar
(126, 1, 1),   -- Charge
(126, 9, 1),   -- Flammèche
(126, 10, 7),  -- Flamme
(126, 11, 13), -- Lance-Flammes

-- Scarabrute
(127, 1, 1),   -- Charge
(127, 17, 1),  -- Piqûre
(127, 2, 7),   -- Griffe

-- Tauros
(128, 1, 1),   -- Charge
(128, 29, 7),  -- Tunnel
(128, 30, 13), -- Séisme

-- Magicarpe
(129, 1, 1),   -- Charge

-- Léviator
(130, 13, 1),  -- Pistolet à O
(130, 20, 7),  -- Tornade
(130, 44, 13), -- Draco-Rage
(130, 1, 20),  -- Charge

-- Lokhlass
(131, 13, 1),  -- Pistolet à O
(131, 41, 7),  -- Laser Glace
(131, 42, 13), -- Blizzard
(131, 1, 20),  -- Charge

-- Métamorph
(132, 1, 1),   -- Charge

-- Évoli et évolutions
(133, 1, 1),   -- Charge
(134, 13, 1),  -- Pistolet à O
(134, 14, 7),  -- Bulle d'O
(134, 15, 13), -- Hydrocanon
(134, 16, 20), -- Surf
(135, 26, 1),  -- Éclair
(135, 27, 7),  -- Tonnerre
(135, 28, 13), -- Cage-Éclair
(136, 9, 1),   -- Flammèche
(136, 10, 7),  -- Flamme
(136, 11, 13), -- Lance-Flammes

-- Porygon
(137, 1, 1),   -- Charge
(137, 38, 7),  -- Psyko

-- Amonita et Amonistar
(138, 13, 1),  -- Pistolet à O
(138, 14, 7),  -- Bulle d'O
(138, 33, 13), -- Lance-Pierre
(139, 13, 1),  -- Pistolet à O
(139, 14, 1),  -- Bulle d'O
(139, 33, 1),  -- Lance-Pierre
(139, 34, 7),  -- Éboulement

-- Kabuto et Kabutops
(140, 13, 1),  -- Pistolet à O
(140, 14, 7),  -- Bulle d'O
(140, 33, 13), -- Lance-Pierre
(141, 13, 1),  -- Pistolet à O
(141, 14, 1),  -- Bulle d'O
(141, 33, 1),  -- Lance-Pierre
(141, 34, 7),  -- Éboulement

-- Ptéra
(142, 1, 1),   -- Charge
(142, 20, 1),  -- Tornade
(142, 21, 7),  -- Cru-Aile
(142, 34, 13), -- Éboulement

-- Ronflex
(143, 1, 1),   -- Charge
(143, 4, 7),   -- Morsure
(143, 29, 13), -- Tunnel

-- Artikodin
(144, 41, 1),  -- Laser Glace
(144, 42, 7),  -- Blizzard
(144, 20, 13), -- Tornade

-- Électhor
(145, 26, 1),  -- Éclair
(145, 27, 7),  -- Tonnerre
(145, 20, 13), -- Tornade

-- Sulfura
(146, 9, 1),   -- Flammèche
(146, 10, 7),  -- Flamme
(146, 20, 13), -- Tornade

-- Minidraco, Draco, Dracolosse
(147, 44, 1),  -- Draco-Rage
(147, 13, 7),  -- Pistolet à O
(147, 1, 13),  -- Charge
(148, 44, 1),  -- Draco-Rage
(148, 13, 7),  -- Pistolet à O
(148, 1, 13),  -- Charge
(149, 44, 1),  -- Draco-Rage
(149, 13, 7),  -- Pistolet à O
(149, 20, 13), -- Tornade
(149, 1, 20),  -- Charge

-- Mewtwo
(150, 1, 1),   -- Charge
(150, 38, 7),  -- Psyko
(150, 39, 13), -- Téléport

-- Mew
(151, 1, 1),   -- Charge
(151, 38, 7),  -- Psyko
(151, 39, 13); -- Téléport 