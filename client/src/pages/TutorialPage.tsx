import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';

const TutorialPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Bienvenue sur PokéFight !',
      description: `Félicitations pour votre inscription ! PokéFight est un jeu de combat de Pokémon en ligne.
        Vous allez pouvoir affronter d'autres dresseurs et grimper dans le classement.`,
    },
    {
      label: 'Le système de combat',
      description: `Les combats se déroulent en tour par tour. À chaque tour, vous choisissez une action
        pour votre Pokémon. Le Pokémon le plus rapide attaque en premier. Utilisez les faiblesses
        de types à votre avantage !`,
    },
    {
      label: 'Le classement ELO',
      description: `Votre score ELO reflète votre niveau. Il augmente quand vous gagnez et diminue
        quand vous perdez. Plus votre adversaire est fort, plus vous gagnez de points en le battant.
        Vous commencez avec 1000 points.`,
    },
    {
      label: 'Commencer à jouer',
      description: `Vous êtes maintenant prêt à commencer votre aventure ! Cliquez sur le bouton
        ci-dessous pour accéder à la page d'accueil et lancer votre premier combat.`,
    },
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Tutoriel
          </Typography>

          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="h6">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography>{step.description}</Typography>
                  <Box sx={{ mt: 2 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={index === steps.length - 1 ? handleFinish : handleNext}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        {index === steps.length - 1 ? 'Terminer' : 'Suivant'}
                      </Button>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Retour
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>
    </Container>
  );
};

export default TutorialPage; 