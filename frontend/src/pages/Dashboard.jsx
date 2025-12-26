import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight={600} mb={3}>
        Dashboard
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bienvenido/a, {user?.nombre} {user?.apellido}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {user?.email}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h3" textAlign="center" color="primary">
                0
              </Typography>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                📦 Items Disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h3" textAlign="center" color="primary">
                0
              </Typography>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                👥 Usuarios Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h3" textAlign="center" color="primary">
                0
              </Typography>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                🏢 Locales Registrados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          ✅ FASE 1 y 2 completadas - Layout y autenticación funcionando
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
