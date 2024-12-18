import React, { useEffect } from 'react';
import { Box, Button, Typography, Container, Grid, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import { motion, useScroll, useTransform, useAnimation } from 'framer-motion';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TimelineIcon from '@mui/icons-material/Timeline';
import splashBackground from '../splashscreenbackground.jpg';

const Section = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  padding: 0,
  margin: 0
}));

const BackgroundImage = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${splashBackground})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  width: '100%',
  position: 'relative',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column'
}));

const Overlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  zIndex: 1,
});

const StatCard = styled(motion.div)({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  padding: '3rem 2rem',
  borderRadius: '15px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  textAlign: 'center',
  width: '100%',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transformStyle: 'preserve-3d',
  perspective: '1000px',
  minHeight: '250px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
});

const DetailBox = styled(motion.div)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '3rem 2rem',
  background: 'rgba(0, 0, 0, 0.9)',
  backdropFilter: 'blur(20px)',
  transformOrigin: 'bottom',
  maxHeight: '100%',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
});

const FeatureCard = styled(motion.div)({
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  padding: '2rem',
  borderRadius: '15px',
  color: 'white',
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
});

const FullScreenWrapper = styled(Box)({
  position: 'relative',
  margin: 0,
  padding: 0,
  minHeight: '100vh',
  width: '100%',
  overflowY: 'auto',
  overflowX: 'hidden'
});

function SplashScreen() {
  const { scrollYProgress } = useScroll();
  const controls = useAnimation();

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  const stats = [
    {
      number: '1000+',
      label: 'Active Dealerships',
      details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      number: '$500M+',
      label: 'Monthly Transactions',
      details: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.'
    },
    {
      number: '50,000+',
      label: 'Vehicles Managed',
      details: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.'
    },
    {
      number: '99.9%',
      label: 'Uptime',
      details: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus.'
    },
  ];

  const features = [
    {
      icon: <DirectionsCarIcon sx={{ fontSize: 50 }} />,
      title: 'Inventory Management',
      description: 'Track every vehicle from acquisition to sale with detailed history and documentation.',
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 50 }} />,
      title: 'Real-time Analytics',
      description: 'Make data-driven decisions with comprehensive reporting and insights.',
    },
    {
      icon: <ReceiptIcon sx={{ fontSize: 50 }} />,
      title: 'Expense Tracking',
      description: 'Monitor all costs and expenses with our advanced OCR technology.',
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 50 }} />,
      title: 'Performance Metrics',
      description: 'Track profitability and performance across your entire inventory.',
    },
  ];

  return (
    <FullScreenWrapper>
      <BackgroundImage>
        <Overlay />
        
        {/* Hero Section */}
        <Section>
          <motion.div
            style={{ opacity, scale, zIndex: 2 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Typography
              variant="h1"
              align="center"
              sx={{
                fontSize: { xs: '3rem', md: '5rem' },
                fontWeight: 900,
                color: 'white',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              DEALCOST
            </Typography>
            <Typography
              variant="h4"
              align="center"
              sx={{
                color: 'white',
                mt: 2,
                opacity: 0.9,
              }}
            >
              Revolutionizing Dealership Management
            </Typography>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <Box display="flex" justifyContent="center" mt={4} gap={2}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    borderRadius: '50px',
                    padding: '12px 40px',
                    fontSize: '1.2rem',
                    backgroundColor: '#1976d2',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: '50px',
                    padding: '12px 40px',
                    fontSize: '1.2rem',
                    color: 'white',
                    borderColor: 'white',
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </motion.div>
          </motion.div>
          
          <IconButton
            onClick={scrollToNext}
            sx={{
              position: 'absolute',
              bottom: '2rem',
              color: 'white',
              zIndex: 2,
            }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
            </motion.div>
          </IconButton>
        </Section>

        {/* Stats Section */}
        <Section sx={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
          <Container maxWidth="lg" sx={{ zIndex: 2 }}>
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <StatCard
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    whileHover="hover"
                    variants={{
                      hover: {
                        scale: 1.1,
                        rotateX: 10,
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)",
                        transition: {
                          duration: 0.3,
                          ease: "easeOut"
                        }
                      }
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 1 }}
                      variants={{
                        hover: {
                          y: -20,
                          transition: {
                            duration: 0.3,
                            ease: "easeOut"
                          }
                        }
                      }}
                    >
                      <Typography 
                        variant="h3" 
                        sx={{ 
                          fontWeight: 'bold', 
                          mb: 2,
                          background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {stat.number}
                      </Typography>
                      <Typography variant="h6">{stat.label}</Typography>
                    </motion.div>

                    <DetailBox
                      variants={{
                        hover: {
                          y: 0,
                          opacity: 1,
                          transition: {
                            duration: 0.3,
                            ease: "easeOut"
                          }
                        }
                      }}
                      initial={{ y: "100%", opacity: 0 }}
                    >
                      <motion.div
                        variants={{
                          hover: {
                            y: 0,
                            opacity: 1,
                            transition: {
                              delay: 0.1,
                              duration: 0.3
                            }
                          }
                        }}
                        initial={{ y: 20, opacity: 0 }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            lineHeight: 1.6,
                            color: '#4facfe',
                            fontWeight: 500
                          }}
                        >
                          {stat.details}
                        </Typography>
                      </motion.div>
                    </DetailBox>
                  </StatCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Section>

        {/* Features Section */}
        <Section>
          <Container maxWidth="lg" sx={{ zIndex: 2 }}>
            <Typography
              variant="h2"
              align="center"
              sx={{ color: 'white', mb: 8, fontWeight: 'bold' }}
            >
              Features
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FeatureCard
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {feature.icon}
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.8 }}>
                      {feature.description}
                    </Typography>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Section>
      </BackgroundImage>
    </FullScreenWrapper>
  );
}

export default SplashScreen;