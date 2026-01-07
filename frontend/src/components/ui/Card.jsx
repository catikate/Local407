const Card = ({
  children,
  hover = false,
  onClick,
  className = '',
}) => {
  const baseStyles = 'bg-card-bg border border-border rounded-lg p-4 transition-all';
  const hoverStyles = hover ? 'cursor-pointer hover:shadow-notion-md' : '';
  const clickStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`
        ${baseStyles}
        ${hoverStyles}
        ${clickStyles}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;