import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onDrawerToggle={handleDrawerToggle} />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        {/* Navbar */}
        <Navbar onDrawerToggle={handleDrawerToggle} />

        {/* Offset for fixed navbar */}
        <Toolbar />

        {/* Page content */}
        <Box sx={{ flex: 1, p: 3 }}>
          {children}
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
};

export default MainLayout;