-- Insertion des starters
INSERT INTO pokemon (id, name, type, catch_rate) VALUES
(1, 'Bulbizarre', 'Plante', 45),
(4, 'Salamèche', 'Feu', 45),
(7, 'Carapuce', 'Eau', 45);

-- Insertion des zones d'exploration
INSERT INTO exploration_areas (name, description, min_level, max_level) VALUES
('Route 1', 'Une route paisible où les débutants peuvent s''entraîner.', 1, 5),
('Forêt de Jade', 'Une forêt dense où vivent de nombreux Pokémon de type Plante.', 3, 8),
('Grotte de Pierre', 'Une grotte sombre où les Pokémon de type Roche sont nombreux.', 5, 10);

-- Association des Pokémon aux zones
INSERT INTO area_pokemon (area_id, pokemon_id) VALUES
(1, 1), -- Bulbizarre dans Route 1
(1, 4), -- Salamèche dans Route 1
(1, 7), -- Carapuce dans Route 1
(2, 1), -- Bulbizarre dans Forêt de Jade
(3, 4); -- Salamèche dans Grotte de Pierre 