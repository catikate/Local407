import { useState } from 'react';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format, isSameDay } from 'date-fns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';

const CalendarView = ({ eventos, onEventClick, onMonthChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getEventsForDay = (day) => {
    return eventos.filter(evento =>
      isSameDay(new Date(evento.start), day)
    );
  };

  const CustomDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const dayEvents = getEventsForDay(day);

    return (
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <PickersDay
          {...other}
          day={day}
          outsideCurrentMonth={outsideCurrentMonth}
          sx={{
            fontWeight: dayEvents.length > 0 ? 'bold' : 'normal',
          }}
        />
        {dayEvents.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 2,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 0.3,
            }}
          >
            {dayEvents.slice(0, 3).map((evento, idx) => (
              <Box
                key={idx}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: evento.color,
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  const selectedDayEvents = getEventsForDay(selectedDate);

  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'ENSAYO': return 'Ensayo';
      case 'SHOW': return 'Show';
      case 'SHOW_PERSONAL': return 'Show Personal';
      default: return tipo;
    }
  };

  const handleMonthChange = (newDate) => {
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      {/* Calendar */}
      <Paper sx={{ p: 2, flex: 1, minWidth: 320 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <DateCalendar
            value={selectedDate}
            onChange={setSelectedDate}
            onMonthChange={handleMonthChange}
            slots={{ day: CustomDay }}
          />
        </LocalizationProvider>
      </Paper>

      {/* Events list for selected day */}
      <Paper sx={{ p: 2, flex: 1, minWidth: 320 }}>
        <Typography variant="h6" gutterBottom>
          {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
        </Typography>

        {selectedDayEvents.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay eventos para este día
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={1}>
            {selectedDayEvents.map(evento => (
              <Paper
                key={evento.id}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderLeft: `4px solid ${evento.color}`,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
                onClick={() => onEventClick(evento)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {evento.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(evento.start), 'HH:mm')} -{' '}
                      {format(new Date(evento.end), 'HH:mm')}
                    </Typography>
                  </Box>
                  <Chip
                    label={getTipoLabel(evento.tipo)}
                    size="small"
                    sx={{ bgcolor: evento.color, color: 'white' }}
                  />
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CalendarView;
