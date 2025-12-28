import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2025 NICHO - Plataforma de gestion para musiques y artistas
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href="#" variant="body2" color="text.secondary" underline="hover">
              Ayuda
            </Link>
            <Link href="#" variant="body2" color="text.secondary" underline="hover">
              Contacto
            </Link>
            <Link href="#" variant="body2" color="text.secondary" underline="hover">
              Términos
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;