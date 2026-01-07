const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  rows = 4, // Para textarea
  options = [], // Para select
  ...props
}) => {
  const baseInputStyles = 'w-full px-3 py-2 border border-border rounded-lg bg-card-bg text-text-primary placeholder-text-muted transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed';

  const errorStyles = error ? 'border-error focus:ring-error' : '';

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={`${baseInputStyles} ${errorStyles} ${className} resize-none`}
          {...props}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`${baseInputStyles} ${errorStyles} ${className}`}
          {...props}
        >
          <option value="">{placeholder || 'Selecciona una opción'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`${baseInputStyles} ${errorStyles} ${className}`}
        {...props}
      />
    );
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {renderInput()}

      {error && (
        <p className="mt-1.5 text-sm text-error">{error}</p>
      )}
    </div>
  );
};

export default Input;