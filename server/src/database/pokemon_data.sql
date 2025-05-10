-- Vider les tables existantes
DELETE FROM pokemon_types;
DELETE FROM pokemon;

-- Génération 1 (1-151)
INSERT INTO pokemon (id, name, type, catch_rate, rarity) VALUES
(1, 'Bulbizarre', 'Plante', 45, 1),
(2, 'Herbizarre', 'Plante', 45, 2),
(3, 'Florizarre', 'Plante', 45, 3),
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
(26, 'Raichu', 'Électrik', 75, 3),
(27, 'Sabelette', 'Sol', 255, 1),
(28, 'Sablaireau', 'Sol', 90, 2),
(29, 'Nidoran♀', 'Poison', 235, 1),
(30, 'Nidorina', 'Poison', 120, 2),
(31, 'Nidoqueen', 'Poison,Sol', 45, 3),
(32, 'Nidoran♂', 'Poison', 235, 1),
(33, 'Nidorino', 'Poison', 120, 2),
(34, 'Nidoking', 'Poison,Sol', 45, 3),
(35, 'Mélofée', 'Fée', 150, 2),
(36, 'Mélodelfe', 'Fée', 25, 3),
(37, 'Goupix', 'Feu', 190, 2),
(38, 'Feunard', 'Feu', 75, 3),
(39, 'Rondoudou', 'Normal,Fée', 170, 2),
(40, 'Grodoudou', 'Normal,Fée', 50, 3),
(41, 'Nosferapti', 'Poison,Vol', 255, 1),
(42, 'Nosferalto', 'Poison,Vol', 90, 2),
(43, 'Mystherbe', 'Plante,Poison', 255, 1),
(44, 'Ortide', 'Plante,Poison', 120, 2),
(45, 'Rafflesia', 'Plante,Poison', 45, 3),
(46, 'Paras', 'Insecte,Plante', 190, 1),
(47, 'Parasect', 'Insecte,Plante', 75, 2),
(48, 'Mimitoss', 'Insecte,Poison', 190, 1),
(49, 'Aéromite', 'Insecte,Poison', 75, 2),
(50, 'Taupiqueur', 'Sol', 255, 1),
(51, 'Triopikeur', 'Sol', 50, 2),
(52, 'Miaouss', 'Normal', 255, 1),
(53, 'Persian', 'Normal', 90, 2),
(54, 'Psykokwak', 'Eau', 190, 1),
(55, 'Akwakwak', 'Eau', 75, 2),
(56, 'Férosinge', 'Combat', 190, 1),
(57, 'Colossinge', 'Combat', 75, 2),
(58, 'Caninos', 'Feu', 190, 2),
(59, 'Arcanin', 'Feu', 75, 3),
(60, 'Ptitard', 'Eau', 255, 1),
(61, 'Têtarte', 'Eau', 120, 2),
(62, 'Tartard', 'Eau,Combat', 45, 3),
(63, 'Abra', 'Psy', 200, 1),
(64, 'Kadabra', 'Psy', 100, 2),
(65, 'Alakazam', 'Psy', 50, 3),
(66, 'Machoc', 'Combat', 180, 1),
(67, 'Machopeur', 'Combat', 90, 2),
(68, 'Mackogneur', 'Combat', 45, 3),
(69, 'Chétiflor', 'Plante,Poison', 255, 1),
(70, 'Boustiflor', 'Plante,Poison', 120, 2),
(71, 'Empiflor', 'Plante,Poison', 45, 3),
(72, 'Tentacool', 'Eau,Poison', 190, 1),
(73, 'Tentacruel', 'Eau,Poison', 60, 2),
(74, 'Racaillou', 'Roche,Sol', 255, 1),
(75, 'Gravalanch', 'Roche,Sol', 120, 2),
(76, 'Grolem', 'Roche,Sol', 45, 3),
(77, 'Ponyta', 'Feu', 190, 1),
(78, 'Galopa', 'Feu', 60, 2),
(79, 'Ramoloss', 'Eau,Psy', 190, 1),
(80, 'Flagadoss', 'Eau,Psy', 75, 2),
(81, 'Magnéti', 'Électrik,Acier', 190, 1),
(82, 'Magnéton', 'Électrik,Acier', 60, 2),
(83, 'Canarticho', 'Normal,Vol', 45, 2),
(84, 'Doduo', 'Normal,Vol', 190, 1),
(85, 'Dodrio', 'Normal,Vol', 45, 2),
(86, 'Otaria', 'Eau', 190, 1),
(87, 'Lamantine', 'Eau,Glace', 75, 2),
(88, 'Tadmorv', 'Poison', 190, 1),
(89, 'Grotadmorv', 'Poison', 75, 2),
(90, 'Kokiyas', 'Eau', 190, 1),
(91, 'Crustabri', 'Eau,Glace', 60, 2),
(92, 'Fantominus', 'Spectre,Poison', 190, 1),
(93, 'Spectrum', 'Spectre,Poison', 90, 2),
(94, 'Ectoplasma', 'Spectre,Poison', 45, 3),
(95, 'Onix', 'Roche,Sol', 45, 2),
(96, 'Soporifik', 'Psy', 190, 1),
(97, 'Hypnomade', 'Psy', 75, 2),
(98, 'Krabby', 'Eau', 225, 1),
(99, 'Krabboss', 'Eau', 60, 2),
(100, 'Voltorbe', 'Électrik', 190, 1),
(101, 'Électrode', 'Électrik', 60, 2),
(102, 'Noeunoeuf', 'Plante,Psy', 90, 1),
(103, 'Noadkoko', 'Plante,Psy', 45, 2),
(104, 'Osselait', 'Sol', 190, 1),
(105, 'Ossatueur', 'Sol', 75, 2),
(106, 'Kicklee', 'Combat', 45, 2),
(107, 'Tygnon', 'Combat', 45, 2),
(108, 'Excelangue', 'Normal', 45, 2),
(109, 'Smogo', 'Poison', 190, 1),
(110, 'Smogogo', 'Poison', 60, 2),
(111, 'Rhinocorne', 'Sol,Roche', 120, 1),
(112, 'Rhinoféros', 'Sol,Roche', 60, 2),
(113, 'Leveinard', 'Normal', 30, 2),
(114, 'Saquedeneu', 'Plante', 45, 2),
(115, 'Kangourex', 'Normal', 45, 2),
(116, 'Hypotrempe', 'Eau', 225, 1),
(117, 'Hypocéan', 'Eau', 75, 2),
(118, 'Poissirène', 'Eau', 225, 1),
(119, 'Poissoroy', 'Eau', 60, 2),
(120, 'Stari', 'Eau', 225, 1),
(121, 'Staross', 'Eau,Psy', 60, 2),
(122, 'M. Mime', 'Psy,Fée', 45, 2),
(123, 'Insécateur', 'Insecte,Vol', 45, 2),
(124, 'Lippoutou', 'Glace,Psy', 45, 2),
(125, 'Élektek', 'Électrik', 45, 2),
(126, 'Magmar', 'Feu', 45, 2),
(127, 'Scarabrute', 'Insecte', 45, 2),
(128, 'Tauros', 'Normal', 45, 2),
(129, 'Magicarpe', 'Eau', 255, 1),
(130, 'Léviator', 'Eau,Vol', 45, 3),
(131, 'Lokhlass', 'Eau,Glace', 45, 2),
(132, 'Métamorph', 'Normal', 35, 2),
(133, 'Évoli', 'Normal', 45, 2),
(134, 'Aquali', 'Eau', 45, 3),
(135, 'Voltali', 'Électrik', 45, 3),
(136, 'Pyroli', 'Feu', 45, 3),
(137, 'Porygon', 'Normal', 45, 2),
(138, 'Amonita', 'Roche,Eau', 45, 2),
(139, 'Amonistar', 'Roche,Eau', 45, 3),
(140, 'Kabuto', 'Roche,Eau', 45, 2),
(141, 'Kabutops', 'Roche,Eau', 45, 3),
(142, 'Ptéra', 'Roche,Vol', 45, 3),
(143, 'Ronflex', 'Normal', 25, 3),
(144, 'Artikodin', 'Glace,Vol', 3, 4),
(145, 'Électhor', 'Électrik,Vol', 3, 4),
(146, 'Sulfura', 'Feu,Vol', 3, 4),
(147, 'Minidraco', 'Dragon', 45, 2),
(148, 'Draco', 'Dragon', 45, 3),
(149, 'Dracolosse', 'Dragon,Vol', 45, 3),
(150, 'Mewtwo', 'Psy', 3, 4),
(151, 'Mew', 'Psy', 45, 4);

-- Mise à jour des URLs des sprites
UPDATE pokemon SET 
    sprite_url = CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/', id, '.png'),
    sprite_shiny_url = CONCAT('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/', id, '.png');

-- Créer une table temporaire pour les types
CREATE TEMPORARY TABLE temp_types AS
SELECT 
    id as pokemon_id,
    SUBSTRING_INDEX(type, ',', 1) as primary_type,
    CASE 
        WHEN type LIKE '%,%' THEN SUBSTRING_INDEX(type, ',', -1)
        ELSE NULL
    END as secondary_type
FROM pokemon;

-- Mettre à jour la table pokemon avec les types séparés
ALTER TABLE pokemon 
ADD COLUMN primary_type VARCHAR(50),
ADD COLUMN secondary_type VARCHAR(50);

UPDATE pokemon p
JOIN temp_types t ON p.id = t.pokemon_id
SET 
    p.primary_type = TRIM(t.primary_type),
    p.secondary_type = TRIM(t.secondary_type);

-- Supprimer la colonne type originale
ALTER TABLE pokemon DROP COLUMN type;

-- Supprimer la table temporaire
DROP TEMPORARY TABLE IF EXISTS temp_types;

-- Ajouter les relations avec les types
INSERT INTO pokemon_types (pokemon_id, type_id, is_primary)
SELECT p.id, t.id, true
FROM pokemon p
JOIN types t ON t.name = TRIM(SUBSTRING_INDEX(p.primary_type, ',', 1));

INSERT INTO pokemon_types (pokemon_id, type_id, is_primary)
SELECT p.id, t.id, false
FROM pokemon p
JOIN types t ON t.name = TRIM(SUBSTRING_INDEX(p.secondary_type, ',', -1))
WHERE p.secondary_type LIKE '%,%';