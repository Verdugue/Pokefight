import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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

const tutorialSteps = [
  {
    label: 'Bienvenue',
    content: (
      <>
        <Typography variant="h5" gutterBottom>
          Bienvenue dans le monde des Pokémon !
        </Typography>
        <Typography paragraph>
          Je suis le Professeur Chen, et je serai votre guide dans cette aventure. 
          Dans ce monde, vous pourrez capturer des Pokémon, les entraîner, et devenir 
          le meilleur dresseur !
        </Typography>
      </>
    ),
  },
  {
    label: 'Les bases',
    content: (
      <>
        <Typography variant="h5" gutterBottom>
          Voici ce qui vous attend
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Combats</Typography>
                <Typography>
                  Affrontez d'autres dresseurs en temps réel et grimpez dans le classement !
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Exploration</Typography>
                <Typography>
                  Partez à la recherche de Pokémon sauvages et complétez votre Pokédex !
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">Communauté</Typography>
                <Typography>
                  Rejoignez des équipes, participez à des événements et échangez avec d'autres dresseurs !
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </>
    ),
  },
  {
    label: 'Choix du starter',
    content: (props: { onSelectStarter: (pokemon: StarterPokemon) => void }) => (
      <>
        <Typography variant="h5" gutterBottom>
          Choisissez votre premier Pokémon
        </Typography>
        <Typography paragraph>
          Ce Pokémon sera votre fidèle compagnon tout au long de votre aventure. 
          Choisissez-le avec soin !
        </Typography>
        <Grid container spacing={3}>
          {STARTER_POKEMONS.map((pokemon) => (
            <Grid item xs={12} md={4} key={pokemon.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
                onClick={() => props.onSelectStarter(pokemon)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={pokemon.image}
                  alt={pokemon.name}
                  sx={{ objectFit: 'contain', p: 2 }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {pokemon.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Types: {pokemon.type.join(', ')}
                  </Typography>
                  <Typography variant="body2">
                    {pokemon.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
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

  const handleSelectStarter = (pokemon: StarterPokemon) => {
    setSelectedStarter(pokemon);
  };

  const handleComplete = () => {
    if (selectedStarter) {
      onComplete(selectedStarter);
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth 
      disableEscapeKeyDown
      disableBackdropClick
    >
      <Box sx={{ p: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {tutorialSteps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper sx={{ p: 3, mb: 3 }}>
          {activeStep === tutorialSteps.length - 1 ? (
            tutorialSteps[activeStep].content({ onSelectStarter: handleSelectStarter })
          ) : (
            tutorialSteps[activeStep].content
          )}
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {activeStep === tutorialSteps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleComplete}
              disabled={!selectedStarter}
            >
              Commencer l'aventure
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Suivant
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default OnboardingTutorial; 