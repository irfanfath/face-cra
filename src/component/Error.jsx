import React from 'react';

const ErrorDisplay = ({ 
  error, 
  maxLength = 100, 
  variant = 'default',
  className = ''
}) => {
  // Truncate error message if it exceeds maxLength
  const truncateMessage = (message) => {
    if (!message) return '';
    return message.length > maxLength 
      ? `${message.slice(0, maxLength)}...` 
      : message;
  };

  // Determine error styles based on variant
  const getStyles = () => {
    const baseStyles = {
      padding: '10px',
      borderRadius: '4px',
      margin: '10px 0',
      display: 'block',
      width: '100%',
      boxSizing: 'border-box',
    };

    const variantStyles = {
      default: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
      },
      warning: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeeba',
      },
      info: {
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
        border: '1px solid #bee5eb',
      }
    };

    return {
      ...baseStyles,
      ...(variantStyles[variant] || variantStyles.default)
    };
  };

  // If no error, return null
  if (!error) return null;

  return (
    <div 
      style={getStyles()} 
      className={className}
    >
      {truncateMessage(error.message || error)}
    </div>
  );
};

export default ErrorDisplay;