import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Inventory as InventoryIcon,
  Business as BusinessIcon,
  CalendarMonth as CalendarIcon,
  ChevronRight as ChevronRightIcon,
  SwapHoriz as SwapIcon,
  MusicNote as MusicNoteIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import bandaService from '../services/bandaService';
import itemService from '../services/itemService';
import localService from '../services/localService';
import reservaService from '../services/reservaService';
import prestamoService from '../services/prestamoService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    bandas: [],
    items: [],
    locales: [],
    reservas: [],
    prestamos: [],
    aprobacionesPendientes: []
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar todas las bandas y filtrar las del usuario
      const bandasResponse = await bandaService.getAll();
      const todasBandas = bandasResponse.data || [];
      const misBandas = todasBandas.filter(banda =>
        banda.miembros && banda.miembros.some(m => m.id === user.id)
      );

      // Cargar items del usuario
      const itemsResponse = await itemService.getByUsuario(user.id);
      const misItems = itemsResponse || [];

      // Cargar todos los locales
      const localesResponse = await localService.getAll();
      const todosLocales = localesResponse.data || [];

      // Filtrar locales donde el usuario participa (a través de sus bandas)
      const localesIds = [...new Set(misBandas.map(b => b.local?.id).filter(Boolean))];
      const misLocales = todosLocales.filter(local => localesIds.includes(local.id));

      // Cargar reservas compartidas del usuario (propias + de las bandas)
      const reservasResponse = await reservaService.getCompartidas(user.id);
      const todasReservas = reservasResponse || [];

      // Filtrar próximas reservas (futuras)
      const ahora = new Date();
      const proximasReservas = todasReservas
        .filter(r => new Date(r.fechaInicio) > ahora)
        .sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio))
        .slice(0, 5);

      // Cargar préstamos activos del usuario
      const prestamosResponse = await prestamoService.getByPrestadoPorId(user.id);
      const todosPrestamos = prestamosResponse || [];
      const prestamosActivos = todosPrestamos.filter(p => p.estado === 'ACTIVO');

      // Cargar aprobaciones pendientes
      const aprobacionesResponse = await reservaService.getAprobacionesPendientes(user.id);
      const aprobacionesPendientes = aprobacionesResponse || [];

      setData({
        bandas: misBandas,
        items: misItems,
        locales: misLocales,
        reservas: proximasReservas,
        prestamos: prestamosActivos,
        aprobacionesPendientes: aprobacionesPendientes
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper para obtener el label del tipo de evento
  const getTipoEventoLabel = (reserva) => {
    if (reserva.tipoEvento === 'ENSAYO') {
      return reserva.esReservaDiaCompleto ? 'ENSAYO TODO EL DÍA' : 'ENSAYO';
    } else if (reserva.tipoEvento === 'SHOW') {
      return 'SHOW BANDA';
    } else if (reserva.tipoEvento === 'SHOW_PERSONAL') {
      return 'SHOW SOLISTA';
    }
    return reserva.tipoEvento || 'ENSAYO';
  };

  // Helper para obtener el icono del tipo de evento
  const getTipoEventoIcon = (reserva) => {
    if (reserva.tipoEvento === 'ENSAYO') {
      return reserva.esReservaDiaCompleto ? <EventIcon fontSize="small" /> : <MusicNoteIcon fontSize="small" />;
    } else if (reserva.tipoEvento === 'SHOW') {
      return <StarIcon fontSize="small" />;
    } else if (reserva.tipoEvento === 'SHOW_PERSONAL') {
      return <PersonIcon fontSize="small" />;
    }
    return <MusicNoteIcon fontSize="small" />;
  };

  // Helper para obtener el estilo del chip de tipo de evento
  const getTipoEventoStyle = (reserva) => {
    if (reserva.tipoEvento === 'ENSAYO') {
      if (reserva.esReservaDiaCompleto) {
        return {
          backgroundColor: '#9C27B0',
          color: 'white',
          fontWeight: 600,
        };
      }
      return {
        backgroundColor: '#4CAF50',
        color: 'white',
        fontWeight: 600,
      };
    } else if (reserva.tipoEvento === 'SHOW') {
      return {
        backgroundColor: '#2196F3',
        color: 'white',
        fontWeight: 600,
      };
    } else if (reserva.tipoEvento === 'SHOW_PERSONAL') {
      return {
        backgroundColor: '#FF9800',
        color: 'white',
        fontWeight: 600,
      };
    }
    return {
      backgroundColor: '#4CAF50',
      color: 'white',
      fontWeight: 600,
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bienvenido/a, {user?.nombre} {user?.apellido}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/mis-bandas')}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    {data.bandas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mis Bandas
                  </Typography>
                </Box>
                <GroupsIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/items')}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    {data.items.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mi Backline
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/locales')}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    {data.locales.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mis Locales
                  </Typography>
                </Box>
                <BusinessIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/reservas')}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    {data.reservas.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Próximas Reservas
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Sections */}
      <Grid container spacing={3}>
        {/* Mis Bandas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  <GroupsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Mis Bandas
                </Typography>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/mis-bandas')}
                >
                  Ver todas
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {data.bandas.length > 0 ? (
                <List disablePadding>
                  {data.bandas.slice(0, 3).map((banda, index) => (
                    <ListItem
                      key={banda.id}
                      divider={index < Math.min(data.bandas.length, 3) - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemText
                        primary={banda.nombre}
                        secondary={
                          <Box component="span">
                            {banda.local?.nombre && (
                              <Chip
                                label={banda.local.nombre}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                            {banda.miembros && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                {banda.miembros.length} miembros
                              </Typography>
                            )}
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No tienes bandas. <Button size="small" onClick={() => navigate('/mis-bandas')}>Crear una</Button>
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mi Backline */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Mi Backline
                </Typography>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/items')}
                >
                  Ver todo
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {data.items.length > 0 ? (
                <List disablePadding>
                  {data.items.slice(0, 3).map((item, index) => (
                    <ListItem
                      key={item.id}
                      divider={index < Math.min(data.items.length, 3) - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemText
                        primary={item.descripcion}
                        secondary={`Cantidad: ${item.cantidad || 1}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No tienes items. <Button size="small" onClick={() => navigate('/items')}>Agregar</Button>
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Préstamos Activos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  <SwapIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Préstamos Activos
                </Typography>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/prestamos')}
                >
                  Ver todos
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {data.prestamos.length > 0 ? (
                <List disablePadding>
                  {data.prestamos.slice(0, 3).map((prestamo, index) => (
                    <ListItem
                      key={prestamo.id}
                      divider={index < Math.min(data.prestamos.length, 3) - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemText
                        primary={prestamo.item?.descripcion || 'Item'}
                        secondary={
                          <Box component="span">
                            <Typography variant="caption" display="block">
                              Prestado a: {prestamo.prestadoAUsuario ?
                                `${prestamo.prestadoAUsuario.nombre} ${prestamo.prestadoAUsuario.apellido}` :
                                prestamo.prestadoABanda?.nombre || 'N/A'}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Devolución: {formatDate(prestamo.fechaDevolucionEsperada)}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No tienes préstamos activos
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Locales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Mis Locales
                </Typography>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/locales')}
                >
                  Ver todos
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {data.locales.length > 0 ? (
                <List disablePadding>
                  {data.locales.slice(0, 3).map((local, index) => (
                    <ListItem
                      key={local.id}
                      divider={index < Math.min(data.locales.length, 3) - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemText
                        primary={local.nombre}
                        secondary={
                          data.bandas.filter(b => b.local?.id === local.id).length > 0 && (
                            <Typography variant="caption">
                              {data.bandas.filter(b => b.local?.id === local.id).length} banda(s)
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No participas en ningún local aún
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Solicitudes de Aprobación */}
        {data.aprobacionesPendientes.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight={600} color="warning.main">
                    ⚠️ Solicitudes de Aprobación Pendientes
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ChevronRightIcon />}
                    onClick={() => navigate('/reservas')}
                    color="warning"
                    variant="outlined"
                  >
                    Ver todas ({data.aprobacionesPendientes.length})
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List disablePadding>
                  {data.aprobacionesPendientes.slice(0, 3).map((aprobacion, index) => (
                    <ListItem
                      key={aprobacion.id}
                      divider={index < Math.min(data.aprobacionesPendientes.length, 3) - 1}
                      sx={{ px: 0, alignItems: 'flex-start', py: 1.5 }}
                    >
                      <ListItemText
                        primary={
                          <Box>
                            {/* Chip de tipo de evento */}
                            <Chip
                              icon={getTipoEventoIcon(aprobacion.reserva)}
                              label={getTipoEventoLabel(aprobacion.reserva)}
                              size="small"
                              sx={{
                                ...getTipoEventoStyle(aprobacion.reserva),
                                fontSize: '0.75rem',
                                height: 24,
                                mb: 0.5,
                              }}
                            />
                            <Box sx={{ mt: 0.5 }}>
                              {aprobacion.reserva?.local?.nombre}
                              {aprobacion.reserva?.banda && (
                                <Chip
                                  label={aprobacion.reserva.banda.nombre}
                                  size="small"
                                  sx={{ ml: 1 }}
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box component="span">
                            <Typography variant="caption" display="block">
                              Solicitado por: {aprobacion.reserva?.usuario?.nombre} {aprobacion.reserva?.usuario?.apellido}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {formatDate(aprobacion.reserva?.fechaInicio)}
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ component: 'div' }}
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  ))}
                </List>
                <Box mt={2} textAlign="center">
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => navigate('/reservas')}
                  >
                    Revisar Solicitudes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Próximas Reservas */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Próximas Reservas
                </Typography>
                <Button
                  size="small"
                  endIcon={<ChevronRightIcon />}
                  onClick={() => navigate('/reservas')}
                >
                  Ver todas
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {data.reservas.length > 0 ? (
                <List disablePadding>
                  {data.reservas.map((reserva, index) => (
                    <ListItem
                      key={reserva.id}
                      divider={index < data.reservas.length - 1}
                      sx={{ px: 0, alignItems: 'flex-start', py: 1.5 }}
                    >
                      <ListItemText
                        primary={
                          <Box>
                            {/* Chip de tipo de evento - PROMINENTE */}
                            <Chip
                              icon={getTipoEventoIcon(reserva)}
                              label={getTipoEventoLabel(reserva)}
                              size="small"
                              sx={{
                                ...getTipoEventoStyle(reserva),
                                fontSize: '0.75rem',
                                height: 24,
                                mb: 0.5,
                              }}
                            />
                            <Box sx={{ mt: 0.5 }}>
                              {reserva.local?.nombre}
                              {reserva.banda && (
                                <Chip
                                  label={reserva.banda.nombre}
                                  size="small"
                                  sx={{ ml: 1 }}
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={formatDate(reserva.fechaInicio)}
                        primaryTypographyProps={{ component: 'div' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No tienes reservas próximas. <Button size="small" onClick={() => navigate('/reservas')}>Crear una</Button>
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;