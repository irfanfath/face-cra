import React from 'react';

const LoadingSpinner = ({ 
  size = 48, 
  color = '#3498db', 
  message = 'Loading...', 
  className = '',
  messageClassName = ''
}) => {
  const containerStyle = {
    position: 'fixed', // Changed to fixed to center on screen
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };


  const spinnerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    border: '4px solid #f3f3f3',
    borderTop: `4px solid ${color}`,
    animation: 'spin 1s linear infinite',
  };

  const messageStyle = {
    marginTop: '10px',
    fontSize: '16px',
    color: color,
  };

  const keyframesStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframesStyle}</style>
      <div style={containerStyle} className={className}>
        <div style={spinnerStyle}></div>
        {message && (
          <p style={messageStyle} className={messageClassName}>
            {message}
          </p>
        )}
      </div>
    </>
  );
};

const LoadingOverlay = ({ 
  isLoading, 
  children, 
  overlayClassName = '', 
  spinnerProps = {} 
}) => {
  const overlayStyle = {
    position: 'relative',
  };

  const overlayContentStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  };

  const backgroundContentStyle = {
    opacity: 0.3,
    pointerEvents: 'none',
  };

  if (!isLoading) return children;

  return (
    <div style={overlayStyle} className={overlayClassName}>
      <div style={overlayContentStyle}>
        <LoadingSpinner {...spinnerProps} />
      </div>
      <div style={backgroundContentStyle}>
        {children}
      </div>
    </div>
  );
};

export { LoadingSpinner, LoadingOverlay };

export default LoadingSpinner;