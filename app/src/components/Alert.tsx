'use client';

import React, { useState, useEffect } from 'react';

export type AlertProps = {
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
};

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timeoutId = setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [message]);

  if (!isVisible) return null;

  const alertClasses = {
    info: 'alert alert-info',
    error: 'alert alert-error',
    success: 'alert alert-success',
    warning: 'alert alert-warning',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${alertClasses[type]}`}>
      <div className="flex-1">
        <label>{message}</label>
      </div>
    </div>
  );
};

export default Alert;
