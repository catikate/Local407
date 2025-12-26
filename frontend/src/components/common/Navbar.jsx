import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { DRAWER_WIDTH } from './Sidebar';

const Navbar = ({ onDrawerToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotifOpen = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (!user) return '?';
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        {/* Menu button for mobile */}
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Breadcrumbs */}
        <Box sx={{ flex: 1 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="/dashboard"
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Dashboard
            </Link>
          </Breadcrumbs>
        </Box>

        {/* Notifications */}
        <IconButton
          color="inherit"
          onClick={handleNotifOpen}
          sx={{ mr: 1 }}
        >
          <Badge badgeContent={0} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>

        {/* User menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
            <Typography variant="body2" fontWeight={600}>
              {user?.nombre} {user?.apellido}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {getInitials()}
            </Avatar>
          </IconButton>
        </Box>

        {/* User dropdown menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 200,
            },
          }}
        >
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Mi Perfil
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Cerrar Sesión
          </MenuItem>
        </Menu>

        {/* Notifications menu */}
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleNotifClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 300,
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No hay notificaciones nuevas
            </Typography>
          </Box>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;