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
import { useNavigate } from 'react-router-dom';
import desktopScreenshot1 from '../assets/desktop-screenshot-1.png';
import desktopScreenshot2 from '../assets/desktop-screenshot-2.png';
import mobileScreenshot from '../assets/mobile-screenshot.png';
import dealcostScreenshot from '../assets/dealcost_screenshot.png';
import dashboardScreenshot from '../assets/dashboard-screenshot.png';

const Section = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
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
  flexDirection: 'column',
  '& > *': {
    margin: 0,
    padding: 0
  }
}));

const Overlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  zIndex: 1,
});

const StatCard = styled(motion.div)({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  padding: '1rem',
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
  minHeight: '150px',
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
  overflowX: 'hidden',
  backgroundColor: '#000'
});

const StatsSection = styled(Section)({
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(0,242,254,0.1) 0%, rgba(0,0,0,0.9) 70%)',
    transform: 'translateY(-50%)',
    transition: 'transform 0.5s ease-out',
  }
});

const Footer = styled(Box)({
  backgroundColor: '#000',
  padding: '2rem',
  width: '100%',
  position: 'relative',
  zIndex: 2,
  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
});

const styles = `
  body {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }
  
  #root {
    margin: 0 !important;
    padding: 0 !important;
  }
`;

function SplashScreen() {
  const { scrollYProgress } = useScroll();
  const controls = useAnimation();
  const navigate = useNavigate();

  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const scrollToNext = () => {
    const nextSection = document.querySelector('#stats-section');
    if (nextSection) {
      nextSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
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

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  return (
    <>
      <FullScreenWrapper>
        <BackgroundImage>
          <Overlay />
          
          {/* Top navigation buttons */}
          <Box sx={{ 
            position: 'absolute', 
            top: 20, 
            right: 20, 
            display: 'flex', 
            gap: 2, 
            zIndex: 10 
          }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/login')}
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                borderRadius: '50px',
                textTransform: 'uppercase'
              }}
            >
              LOGIN
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate('/create-account')}
              sx={{ 
                backgroundColor: '#1976d2',
                borderRadius: '50px',
                textTransform: 'uppercase'
              }}
            >
              CREATE ACCOUNT
            </Button>
          </Box>
          
          {/* Hero Section */}
          <Section>
            <motion.div
              style={{ opacity, scale, zIndex: 2, width: '100%' }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Grid 
                container 
                spacing={0} 
                sx={{ 
                  minHeight: '100vh',
                  position: 'relative'
                }}
              >
                {/* Left side - Text content */}
                <Grid item xs={12} md={4} sx={{ 
                  pl: { xs: 4, md: 8 },
                  pr: { xs: 4, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 5
                }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3rem', md: '5rem' },
                      fontWeight: 900,
                      color: 'white',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      textAlign: 'left'
                    }}
                  >
                    DEALCOST
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      mt: 2,
                      opacity: 0.9,
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    }}
                  >
                    Revolutionizing{'\n'}
                    Dealership{'\n'}
                    Inventory{'\n'}
                    Cost and Maintenance Management
                  </Typography>
                  
                  <Box display="flex" mt={4} gap={2}>
                    <Button 
                      variant="contained" 
                      onClick={() => navigate('/create-account')}
                      sx={{ 
                        backgroundColor: '#1976d2',
                        borderRadius: '8px',
                        height: '50px',
                        flex: 1,
                        textTransform: 'uppercase'
                      }}
                    >
                      GET STARTED
                    </Button>
                    <Button 
                      variant="outlined" 
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        borderRadius: '8px',
                        height: '50px',
                        flex: 1,
                        textTransform: 'uppercase'
                      }}
                    >
                      LEARN MORE
                    </Button>
                  </Box>
                </Grid>

                {/* Right side - Screenshots */}
                <Grid item xs={12} md={8} sx={{
                  position: 'relative',
                  height: '100vh',
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'flex-end'
                }}>
                  {/* Main Screenshot - Inventory Table */}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      right: '10%',
                      transform: 'translateY(-50%)',
                      width: '805px',
                      zIndex: 1
                    }}
                  >
                    <img
                      src={desktopScreenshot1}
                      alt="Inventory Table"
                      style={{
                        width: '100%',
                        display: 'block',
                        borderRadius: '12px',
                      }}
                    />
                  </Box>

                  {/* Dashboard Screenshot */}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    sx={{
                      position: 'absolute',
                      top: '40%',
                      right: '15%',
                      width: '575px',
                      zIndex: 2
                    }}
                  >
                    <img
                      src={desktopScreenshot2}
                      alt="Dashboard"
                      style={{
                        width: '100%',
                        display: 'block',
                        borderRadius: '12px',
                      }}
                    />
                  </Box>

                  {/* Mobile Screenshot */}
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    sx={{
                      position: 'absolute',
                      top: '30%',
                      right: '5%',
                      width: '345px',
                      zIndex: 3
                    }}
                  >
                    <img
                      src={mobileScreenshot}
                      alt="Mobile View"
                      style={{
                        width: '100%',
                        display: 'block',
                        borderRadius: '24px',
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
            
            <IconButton
              onClick={scrollToNext}
              sx={{
                position: 'absolute',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                zIndex: 2,
              }}
            >
              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                <KeyboardArrowDownIcon sx={{ fontSize: 40 }} />
              </motion.div>
            </IconButton>
          </Section>

          {/* Stats Section */}
          <StatsSection sx={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            minHeight: 'auto',
            position: 'relative',
            margin: 0,
            padding: '4rem 0',
            display: 'flex',
            alignItems: 'center'
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <Container maxWidth="lg" sx={{ zIndex: 2, py: 0 }}>
                <Grid container spacing={3}>
                  {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 20,
                          delay: index * 0.2
                        }}
                      >
                        <StatCard
                          whileHover="hover"
                          variants={{
                            hover: {
                              scale: 1.05,
                              rotateY: 10,
                              boxShadow: "0 25px 50px -12px rgba(0, 242, 254, 0.25)",
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
                                mb: 1,
                                fontSize: '2.5rem',
                                color: '#00f2fe',
                                textShadow: '0 0 20px rgba(0, 242, 254, 0.5)',
                                background: 'linear-gradient(45deg, #00f2fe 30%, #4facfe 90%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'brightness(1.2) contrast(1.1)'
                              }}
                            >
                              {stat.number}
                            </Typography>
                            <Typography 
                              variant="h6"
                              sx={{ 
                                fontSize: '1.1rem',
                                color: 'rgba(255, 255, 255, 0.95)',
                                letterSpacing: '0.5px',
                                textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                              }}
                            >
                              {stat.label}
                            </Typography>
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
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </motion.div>
          </StatsSection>

          {/* Features Section */}
          <Section sx={{ 
            backgroundColor: 'transparent',
            position: 'relative',
            margin: 0,
            padding: '4rem 0 8rem 0'
          }}>
            <Container maxWidth="lg">
              <Typography
                variant="h2"
                sx={{
                  textAlign: 'center',
                  color: 'white',
                  mb: 6,
                  fontSize: { xs: '2.5rem', sm: '3.5rem' },
                  fontWeight: 'bold'
                }}
              >
                Features
              </Typography>
              <Grid container spacing={4}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <FeatureCard>
                      <motion.div
                        whileHover={{ 
                          rotate: [0, -10, 10, 0],
                          transition: { duration: 0.5 }
                        }}
                      >
                        {feature.icon}
                      </motion.div>
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

          {/* Product Showcase Section */}
          <Section sx={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            position: 'relative',
            margin: 0,
            padding: '6rem 0',
            overflow: 'hidden'
          }}>
            <Container maxWidth="xl">
              <Grid container spacing={4} alignItems="center">
                {/* Left side - Screenshot */}
                <Grid item xs={12} md={8}>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <Box
                      component="img"
                      src={dealcostScreenshot}
                      alt="Product Screenshot"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(-15%)',
                        '@media (max-width: 900px)': {
                          width: '100%',
                          transform: 'none',
                          mb: 6
                        }
                      }}
                    />
                  </motion.div>
                </Grid>

                {/* Right side - Text content */}
                <Grid item xs={12} md={4} sx={{  
                  pl: { md: 16 },
                  mt: { xs: 6, md: 0 },
                  position: 'relative',
                  zIndex: 1
                }}>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 3,
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                        background: 'linear-gradient(45deg, #fff 30%, #00f2fe 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Streamline Your Operations
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 4,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        lineHeight: 1.8
                      }}
                    >
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </Typography>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#00f2fe',
                          color: '#000',
                          padding: '12px 30px',
                          borderRadius: '50px',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#4facfe'
                          }
                        }}
                      >
                        Learn More
                      </Button>
                    </motion.div>
                  </motion.div>
                </Grid>
              </Grid>
            </Container>
          </Section>

          {/* Mirrored Product Showcase Section */}
          <Section sx={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            position: 'relative',
            margin: 0,
            padding: '6rem 0',
            overflow: 'hidden'
          }}>
            <Container maxWidth="xl">
              <Grid 
                container 
                spacing={0}
                alignItems="center" 
                sx={{ position: 'relative' }}
              >
                {/* Left side - Text content */}
                <Grid item xs={12} md={4} sx={{  
                  pr: { md: 16 },
                  mt: { xs: 6, md: 0 },
                  position: 'relative',
                  zIndex: 1
                }}>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 3,
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                        background: 'linear-gradient(45deg, #fff 30%, #00f2fe 90%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      Monitor Your Performance
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        mb: 4,
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        lineHeight: 1.8
                      }}
                    >
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </Typography>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: '#00f2fe',
                          color: '#000',
                          padding: '12px 30px',
                          borderRadius: '50px',
                          fontSize: '1.1rem',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          '&:hover': {
                            backgroundColor: '#4facfe'
                          }
                        }}
                      >
                        Learn More
                      </Button>
                    </motion.div>
                  </motion.div>
                </Grid>

                {/* Right side - Screenshot */}
                <Grid item xs={12} md={8}>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <Box
                      component="img"
                      src={dashboardScreenshot}
                      alt="Dashboard Screenshot"
                      sx={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transform: 'translateX(15%)',
                        '@media (max-width: 900px)': {
                          width: '100%',
                          transform: 'none',
                          mb: 6
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
              </Grid>
            </Container>
          </Section>
        </BackgroundImage>
      </FullScreenWrapper>
      <Footer>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.75rem',
                letterSpacing: '0.5px'
              }}
            >
              © 2024 DEALCOST LLC
            </Typography>
          </Box>
        </Container>
      </Footer>
    </>
  );
}

export default SplashScreen;