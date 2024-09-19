import React from 'react';
import { Box, Button, Typography, Container, Grid } from '@mui/material';
import { styled } from '@mui/system';
import splashBackground from '../splashscreenbackground.jpg';

// Background styling
const BackgroundImage = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${splashBackground})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  width: '100%',        // Changed from '100vw' to '100%'
  minHeight: '100vh',   // Changed from 'height' to 'minHeight'
  display: 'flex',
  flexDirection: 'column', // Added for vertical alignment
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  position: 'relative',
  zIndex: 1,
  overflow: 'hidden',
  margin: 0,             // Added to remove default margins
  padding: 0,            // Added to remove default padding
}));

// Dark overlay to improve text readability
const Overlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay
  zIndex: 2,
});

// Feature box styling
const FeatureBox = styled(Box)({
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  padding: '20px',
  borderRadius: '8px',
  textAlign: 'center',
});

// Text content
const Content = styled(Box)({
  position: 'relative',
  zIndex: 3,
  textAlign: 'center',
  color: 'white',
  textShadow: '1px 1px 10px rgba(0, 0, 0, 0.9)',
});

const SplashScreen = () => {
  return (
    <BackgroundImage>
      <Overlay />
      <Content>
        <Container maxWidth="lg" disableGutters>
          {/* Added disableGutters to remove default padding */}
          <Typography variant="h2" align="center" gutterBottom>
            ONE SYSTEM FOR YOUR ENTIRE DEALERSHIP
          </Typography>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4}>
              <FeatureBox>
                <Typography variant="h5" gutterBottom>
                  QUICK
                </Typography>
                <Typography variant="body1">
                  Stop waiting around by using our powerful software.
                </Typography>
              </FeatureBox>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureBox>
                <Typography variant="h5" gutterBottom>
                  MOBILE
                </Typography>
                <Typography variant="body1">
                  Run your dealership anytime, anywhere, and on any device.
                </Typography>
              </FeatureBox>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureBox>
                <Typography variant="h5" gutterBottom>
                  EFFICIENT
                </Typography>
                <Typography variant="body1">
                  Run your entire dealership from a single system.
                </Typography>
              </FeatureBox>
            </Grid>
          </Grid>

          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button variant="contained" color="primary" size="large">
              FEATURES
            </Button>
            <Button variant="contained" color="secondary" size="large">
              SCHEDULE DEMO
            </Button>
          </Box>
        </Container>
      </Content>
    </BackgroundImage>
  );
};

export default SplashScreen;