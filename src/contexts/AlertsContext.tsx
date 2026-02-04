import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import alertService from '../services/alertService';
import type { Alert as AlertType } from '../types/alert';

interface AlertsContextType {
  alerts: AlertType[];
  unreadCount: number;
  handleAlertClick: (alert: AlertType) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markOneAsRead: (id: number) => Promise<void>;
  isLoading: boolean;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

export const AlertsProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedAlerts = await alertService.getAll();
      setAlerts(fetchedAlerts);
      setUnreadCount(fetchedAlerts.filter(a => !a.isRead).length);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const markOneAsRead = useCallback(async (id: number) => {
    const alert = alerts.find(a => a.id === id);
    if (alert && !alert.isRead) {
        try {
            await alertService.markAsRead(id);
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
            setUnreadCount(prev => prev - 1);
          } catch (error) {
            console.error("Failed to mark alert as read:", error);
          }
    }
  }, [alerts]);

  const handleAlertClick = useCallback(async (alert: AlertType) => {
    await markOneAsRead(alert.id);

    if (alert.type === 'GOAL_EXCEED') {
      navigate('/dashboard/metas');
    } else if (alert.type === 'excessed_spending') {
      navigate('/dashboard/gastos');
    } else {
      navigate('/dashboard/alertas');
    }
  }, [navigate, markOneAsRead]);

  const markAllAsRead = useCallback(async () => {
    try {
      await alertService.markAllAsRead();
      setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all alerts as read:", error);
    }
  }, []);

  return (
    <AlertsContext.Provider value={{ alerts, unreadCount, handleAlertClick, markAllAsRead, markOneAsRead, isLoading }}>
      {children}
    </AlertsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};
