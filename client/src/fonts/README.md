# Polices pour PokéFight

Ce dossier contient les polices utilisées dans l'application PokéFight.

## Polices nécessaires

1. `Pokemon-Solid.ttf` - Police principale pour les titres
2. `Pokemon-Hollow.ttf` - Police alternative pour les titres
3. `PressStart2P-Regular.ttf` - Police pixel art pour le texte

## Comment obtenir les polices

1. Pokemon Font:
   - Téléchargez depuis [DaFont - Pokemon Solid](https://www.dafont.com/fr/pokemon.font)
   - Placez les fichiers `Pokemon-Solid.ttf` et `Pokemon-Hollow.ttf` dans ce dossier

2. Press Start 2P:
   - Disponible sur [Google Fonts](https://fonts.google.com/specimen/Press+Start+2P)
   - Téléchargez et placez `PressStart2P-Regular.ttf` dans ce dossier

## Utilisation

Dans votre code CSS, utilisez les classes suivantes :

```css
/* Titre style Pokémon avec contour */
.pokemon-title {
  font-family: 'Pokemon Solid', sans-serif;
}

/* Titre style Pokémon creux */
.pokemon-title-hollow {
  font-family: 'Pokemon Hollow', sans-serif;
}

/* Texte style pixel art */
.pixel-text {
  font-family: 'Press Start 2P', cursive;
}
```

## Note légale

Ces polices sont utilisées à des fins éducatives. Assurez-vous de respecter les licences appropriées pour une utilisation commerciale. 