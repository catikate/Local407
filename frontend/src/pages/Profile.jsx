import { Box, Typography, Card, CardContent, Avatar, Button, Grid } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const Profile = () => {
  const { user } = useAuth();

  // Obtener iniciales del usuario
  const getInitials = () => {
    if (!user) return '?';
    const nombre = user.nombre || '';
    const apellido = user.apellido || '';
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Mi Perfil
        </Typography>
        <Button variant="contained" startIcon={<EditIcon />}>
          Editar Perfil
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: 48,
                  bgcolor: 'primary.main',
                  margin: '0 auto',
                  mb: 2,
                }}
              >
                {getInitials()}
              </Avatar>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                {user?.nombre} {user?.apellido}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Información Personal
              </Typography>
              <Box mt={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nombre
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.nombre || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Apellido
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.apellido || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.email || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Teléfono
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user?.telefono || 'No especificado'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="body1" color="text.secondary" textAlign="center" py={2}>
                🚧 Edición de perfil en desarrollo - FASE 7
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;