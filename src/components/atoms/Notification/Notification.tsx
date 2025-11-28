import { useEffect } from 'react';
import { CheckIcon } from '../../Icons';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Notification({ message, type = 'success', onClose }: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#10b981' : '#ef4444';

  return (
    <div 
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div 
        style={{ 
          backgroundColor: bgColor,
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: '300px',
          maxWidth: '500px'
        }}
      >
        <CheckIcon />
        <span style={{ fontWeight: 500, flex: 1 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            marginLeft: '0.5rem',
            color: 'white',
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            padding: '0 0.25rem'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
