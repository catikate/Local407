import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Mail as MailIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/items' },
  { text: 'Locales', icon: <BusinessIcon />, path: '/locales' },
  { text: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios' },
  { text: 'Invitaciones', icon: <MailIcon />, path: '/invitaciones' },
  { text: 'Mi Perfil', icon: <PersonIcon />, path: '/profile' },
];

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onDrawerToggle();
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo / Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary">
            🏢 LOCAL407
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Gestión de Locales
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={onDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Footer Info */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Versión 1.0.0
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          © 2025 LOCAL407
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
export { DRAWER_WIDTH };