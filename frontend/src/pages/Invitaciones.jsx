import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Invitaciones = () => {
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight={600}>
          Invitaciones
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nueva Invitación
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
            🚧 Página en desarrollo - FASE 6
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Aquí se mostrará la gestión de invitaciones
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Invitaciones;