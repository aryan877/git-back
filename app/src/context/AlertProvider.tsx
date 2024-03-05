'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

export type AlertType = 'info' | 'error' | 'success' | 'warning';

type Alert = {
  message: string;
  type: AlertType;
};

export type AlertContextType = {
  showAlert: (message: string, type: AlertType) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert = useCallback((message: string, type: AlertType) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div
          className={`fixed bottom-4 right-4 z-50 alert alert-${alert.type} max-w-xs w-full`}
        >
          <div className="flex-1">
            <label className="text-sm">{alert.message}</label>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
