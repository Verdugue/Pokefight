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
(28, 'Cage-Éclair', (SELECT id FROM types WHERE name = 'Électrik'), NULL, 100, 20, 'Paralyse l''ennemi avec de l''électricité statique.');

-- Associer les attaques aux Pokémon
INSERT INTO pokemon_learnable_moves (pokemon_id, move_id, learn_level) VALUES
-- Bulbizarre et évolutions
(1, 1, 1),   -- Charge
(1, 5, 1),   -- Fouet Lianes
(1, 6, 7),   -- Tranch'Herbe
(1, 7, 13),  -- Vampigraine
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
(4, 11, 13), -- Lance-Flammes
(4, 12, 20), -- Déflagration
(5, 9, 1),   -- Flammèche
(5, 10, 1),  -- Flamme
(5, 11, 13), -- Lance-Flammes
(5, 12, 25), -- Déflagration
(6, 9, 1),   -- Flammèche
(6, 10, 1),  -- Flamme
(6, 11, 1),  -- Lance-Flammes
(6, 12, 1),  -- Déflagration
(6, 20, 1),  -- Tornade
(6, 21, 1),  -- Cru-Aile

-- Carapuce et évolutions
(7, 1, 1),   -- Charge
(7, 13, 1),  -- Pistolet à O
(7, 14, 7),  -- Bulle d'O
(7, 15, 13), -- Hydrocanon
(7, 16, 20), -- Surf
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
(26, 28, 1);  -- Cage-Éclair 