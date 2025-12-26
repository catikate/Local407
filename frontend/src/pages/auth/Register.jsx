import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Container,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// Schema de validación con Yup
const registerSchema = yup.object({
  nombre: yup
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .required('El nombre es obligatorio'),
  apellido: yup
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .required('El apellido es obligatorio'),
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es obligatorio'),
  telefono: yup
    .string()
    .matches(/^[0-9+\-\s()]*$/, 'Formato de teléfono inválido')
    .nullable(),
  contrasenia: yup
    .string()
    .min(6, 'Mínimo 6 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[a-z]/, 'Debe contener al menos una minúscula')
    .matches(/[0-9]/, 'Debe contener al menos un número')
    .required('La contraseña es obligatoria'),
  confirmarContrasenia: yup
    .string()
    .oneOf([yup.ref('contrasenia'), null], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    // Eliminar confirmación de contraseña antes de enviar
    const { confirmarContrasenia, ...userData } = data;

    const result = await registerUser(userData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight={600}>
            🏢 LOCAL407
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Sistema de Gestión de Locales
          </Typography>
        </Box>

        <Card elevation={3}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom textAlign="center">
              Crear Cuenta
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                {...register('nombre')}
                label="Nombre"
                fullWidth
                margin="normal"
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
                autoComplete="given-name"
                autoFocus
              />

              <TextField
                {...register('apellido')}
                label="Apellido"
                fullWidth
                margin="normal"
                error={!!errors.apellido}
                helperText={errors.apellido?.message}
                autoComplete="family-name"
              />

              <TextField
                {...register('email')}
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                autoComplete="email"
              />

              <TextField
                {...register('telefono')}
                label="Teléfono (opcional)"
                fullWidth
                margin="normal"
                error={!!errors.telefono}
                helperText={errors.telefono?.message}
                autoComplete="tel"
              />

              <TextField
                {...register('contrasenia')}
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                error={!!errors.contrasenia}
                helperText={errors.contrasenia?.message}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                {...register('confirmarContrasenia')}
                label="Confirmar Contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                error={!!errors.confirmarContrasenia}
                helperText={errors.confirmarContrasenia?.message}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Registrarse'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="text.secondary">
            ¿Ya tienes cuenta?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Inicia sesión
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;
