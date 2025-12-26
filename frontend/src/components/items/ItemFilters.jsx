import { Box, TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const ItemFilters = ({ filters, onFilterChange }) => {
  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        mb: 3,
        alignItems: 'center',
      }}
    >
      {/* Búsqueda */}
      <TextField
        placeholder="Buscar por descripción..."
        value={filters.search || ''}
        onChange={handleSearchChange}
        size="small"
        sx={{ flexGrow: 1, minWidth: 250 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default ItemFilters;
