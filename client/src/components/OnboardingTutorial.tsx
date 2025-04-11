import React, { useState } from 'react';
import {
  Box,
  
  
  
  Button,
  Typography,
  
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import styles from '../styles/OnboardingTutorial.module.css';

interface StarterPokemon {
  id: number;
  name: string;
  type: string[];
  image: string;
  description: string;
}

const STARTER_POKEMONS: StarterPokemon[] = [
  {
    id: 1,
    name: 'Bulbizarre',
    type: ['Plante', 'Poison'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    description: 'Un Pokémon calme et loyal, parfait pour les débutants. Sa capacité à utiliser des attaques de type Plante le rend très polyvalent.',
  },
  {
    id: 4,
    name: 'Salamèche',
    type: ['Feu'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    description: 'Un Pokémon fougueux et puissant. Ses attaques de feu peuvent rapidement mettre fin à un combat.',
  },
  {
    id: 7,
    name: 'Carapuce',
    type: ['Eau'],
    image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
    description: 'Un Pokémon défensif et endurant. Sa carapace lui permet de résister à de nombreuses attaques.',
  },
];

interface TutorialStepContent {
  label: string;
  title: string;
  content: string | ((props: { onSelectStarter: (pokemon: StarterPokemon) => void }) => React.ReactNode);
  image?: string;
}

const tutorialSteps: TutorialStepContent[] = [
  {
    label: 'Bienvenue',
    title: 'Bienvenue dans le monde des Pokémon !',
    content: 'Je suis le Professeur Chen, et je serai votre guide dans cette aventure. Dans ce monde, vous pourrez capturer des Pokémon, les entraîner, et devenir le meilleur dresseur !',
    image: '/professor-oak.png'
  },
  {
    label: 'Les bases',
    title: 'Voici ce qui vous attend',
    content: 'Dans PokéFight, vous pourrez affronter d\'autres dresseurs en temps réel, grimper dans le classement, et devenir le meilleur dresseur. Chaque victoire vous rapprochera du sommet !',
    image: '/battle-scene.png'
  },
  {
    label: 'Choix du starter',
    title: 'Choisissez votre premier Pokémon',
    content: ({ onSelectStarter }) => (
      <Grid container spacing={3}>
        {STARTER_POKEMONS.map((pokemon) => (
          <Grid item xs={12} md={4} key={pokemon.id}>
            <Card 
              className={styles.starterCard}
              onClick={() => onSelectStarter(pokemon)}
            >
              <CardMedia
                component="img"
                className={styles.starterImage}
                image={pokemon.image}
                alt={pokemon.name}
              />
              <CardContent className={styles.starterInfo}>
                <Typography variant="h6" gutterBottom>
                  {pokemon.name}
                </Typography>
                <Box mb={1}>
                  {pokemon.type.map((type) => (
                    <span key={type} className={`${styles.starterType} ${styles[type]}`}>
                      {type}
                    </span>
                  ))}
                </Box>
                <Typography variant="body2">
                  {pokemon.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    ),
  },
];

interface OnboardingTutorialProps {
  open: boolean;
  onComplete: (selectedStarter: StarterPokemon) => void;
}

const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ open, onComplete }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedStarter, setSelectedStarter] = useState<StarterPokemon | null>(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSelectStarter = (pokemon: StarterPokemon) => {
    setSelectedStarter(pokemon);
  };

  const handleComplete = () => {
    if (selectedStarter) {
      onComplete(selectedStarter);
    }
  };

  const currentStep = tutorialSteps[activeStep];
  const isLastStep = activeStep === tutorialSteps.length - 1;

  return (
    <Dialog 
      open={open} 
      maxWidth={false}
      className={styles.tutorialDialog}
      disableEscapeKeyDown
    >
      <Box className={styles.contentContainer}>
        {/* Flèche gauche */}
        <IconButton
          className={`${styles.navigationArrow} ${styles.left}`}
          onClick={handleBack}
          disabled={activeStep === 0}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Colonne de texte */}
        <Box className={styles.textColumn}>
          <Typography variant="h4" gutterBottom>
            {currentStep.title}
          </Typography>
          {typeof currentStep.content === 'string' ? (
            <Typography variant="body1">
              {currentStep.content}
            </Typography>
          ) : (
            currentStep.content({ onSelectStarter: handleSelectStarter })
          )}
        </Box>

        {/* Colonne d'image */}
        {!isLastStep && (
          <Box className={styles.imageColumn}>
            {currentStep.image ? (
              <img
                src={currentStep.image}
                alt={currentStep.label}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Typography variant="h6" textAlign="center">
                Image à venir
              </Typography>
            )}
          </Box>
        )}

        {/* Flèche droite ou bouton de fin */}
        {isLastStep ? (
          <Button
            variant="contained"
            onClick={handleComplete}
            disabled={!selectedStarter}
            sx={{
              position: 'absolute',
              right: 24,
              bottom: 24,
              backgroundColor: 'white',
              color: 'var(--pokemon-red)',
              '&:hover': {
                backgroundColor: 'var(--pokemon-yellow)',
              }
            }}
          >
            Commencer l'aventure
          </Button>
        ) : (
          <IconButton
            className={`${styles.navigationArrow} ${styles.right}`}
            onClick={handleNext}
          >
            <ArrowForwardIcon />
          </IconButton>
        )}

        {/* Indicateur de progression */}
        <Typography className={styles.progressIndicator}>
          {activeStep + 1} / {tutorialSteps.length}
        </Typography>
      </Box>
    </Dialog>
  );
};

export default OnboardingTutorial; 