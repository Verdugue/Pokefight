import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Fade,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const slides = [
  {
    title: 'Bienvenue sur PokéFight !',
    content: 'Félicitations pour votre inscription ! PokéFight est un jeu de combat de Pokémon en ligne. Vous allez pouvoir affronter d\'autres dresseurs et grimper dans le classement.',
    image: '/pokemon-battle.png'
  },
  {
    title: 'Le système de combat',
    content: 'Les combats se déroulent en tour par tour. À chaque tour, vous choisissez une action pour votre Pokémon. Le Pokémon le plus rapide attaque en premier. Utilisez les faiblesses de types à votre avantage !',
    image: '/battle-system.png'
  },
  {
    title: 'Le classement ELO',
    content: 'Votre score ELO reflète votre niveau. Il augmente quand vous gagnez et diminue quand vous perdez. Plus votre adversaire est fort, plus vous gagnez de points en le battant. Vous commencez avec 1000 points.',
    image: '/ranking.png'
  },
  {
    title: 'Commencer à jouer',
    content: 'Vous êtes maintenant prêt à commencer votre aventure ! Cliquez sur le bouton ci-dessous pour accéder à la page d\'accueil et lancer votre premier combat.',
    image: '/start.png'
  }
];

const TutorialPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      navigate('/');
      return;
    }
    setFadeIn(false);
    setTimeout(() => {
      setCurrentSlide(prev => prev + 1);
      setFadeIn(true);
    }, 300);
  };

  const handleBack = () => {
    if (currentSlide === 0) return;
    setFadeIn(false);
    setTimeout(() => {
      setCurrentSlide(prev => prev - 1);
      setFadeIn(true);
    }, 300);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#EE1515', // Rouge Pokémon
        position: 'relative'
      }}
    >
      {/* Flèche gauche */}
      <IconButton
        onClick={handleBack}
        disabled={currentSlide === 0}
        sx={{
          position: 'absolute',
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 60,
          height: 60,
          color: 'white',
          '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 40 }} />
      </IconButton>

      {/* Contenu principal */}
      <Fade in={fadeIn} timeout={300}>
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            gap: 4,
            px: 10
          }}
        >
          {/* Colonne de gauche (texte) */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              border: '2px solid black',
              borderRadius: 2,
              backgroundColor: 'white'
            }}
          >
            <Typography variant="h3" gutterBottom sx={{ color: '#EE1515' }}>
              {slides[currentSlide].title}
            </Typography>
            <Typography variant="h6" sx={{ textAlign: 'center' }}>
              {slides[currentSlide].content}
            </Typography>
          </Box>

          {/* Colonne de droite (image) */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 4,
              border: '2px solid black',
              borderRadius: 2,
              backgroundColor: 'white'
            }}
          >
            <Typography variant="h4">
              Image
            </Typography>
          </Box>
        </Box>
      </Fade>

      {/* Flèche droite */}
      <IconButton
        onClick={handleNext}
        disabled={currentSlide === slides.length - 1}
        sx={{
          position: 'absolute',
          right: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 60,
          height: 60,
          color: 'white',
          '&.Mui-disabled': { color: 'rgba(255,255,255,0.3)' }
        }}
      >
        <ArrowForwardIcon sx={{ fontSize: 40 }} />
      </IconButton>

      {/* Indicateur de progression */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white'
        }}
      >
        <Typography>
          {currentSlide + 1} / {slides.length}
        </Typography>
      </Box>
    </Box>
  );
};

export default TutorialPage; 