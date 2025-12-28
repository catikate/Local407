import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const mockUser = {
  id: 1,
  nombre: 'Test',
  apellido: 'User',
  email: 'test@example.com',
  role: 'USER'
};

const AllProviders = ({ children }) => {
  return (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        {children}
      </LocalizationProvider>
    </BrowserRouter>
  );
};

const customRender = (ui, options = {}) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

export * from '@testing-library/react';
export { customRender as render, mockUser };
