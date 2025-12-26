import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

const Usuarios = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Usuarios
        </Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />}>
          Invitar Usuario
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
            🚧 Página en desarrollo - FASE 5
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Aquí se mostrará la gestión de usuarios
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Usuarios;