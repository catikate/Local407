import { X } from 'lucide-react';
import { Badge, Button } from '../ui';

const Fila = ({ etiqueta, children }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-border last:border-0">
    <dt className="text-sm text-text-secondary">{etiqueta}</dt>
    <dd className="text-sm font-medium text-text-primary text-right">{children}</dd>
  </div>
);

const ItemDetailModal = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detalle del item"
          className="relative w-full max-w-md bg-card-bg rounded-xl shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-xl font-semibold text-text-primary">Detalle del item</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <dl className="p-6">
            <Fila etiqueta="Descripción">{item.descripcion || 'Sin descripción'}</Fila>
            <Fila etiqueta="Cantidad">{item.cantidad}</Fila>
            <Fila etiqueta="Propietario">{item.propietarioNombre || 'Sin propietario'}</Fila>
            <Fila etiqueta="Local de origen">{item.localOriginal?.nombre || '-'}</Fila>
            <Fila etiqueta="Ubicación actual">{item.localActual?.nombre || '-'}</Fila>
            <Fila etiqueta="Estado">
              <Badge variant={item.prestado ? 'warning' : 'success'}>
                {item.prestado ? 'Prestado' : 'Disponible'}
              </Badge>
            </Fila>
          </dl>

          <div className="p-6 pt-0">
            <Button variant="secondary" fullWidth onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
