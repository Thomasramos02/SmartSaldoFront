import { useEffect, useState } from 'react';
import { Bell, Check, X as XIcon } from 'lucide-react';
import alertService from '../services/alertService';
import type { Alert } from '../types/alert';
import { PageTransition } from '../components/PageTransition';

interface AlertasProps {
  unreadCount: number;
  onReadAll: () => void;
}

export function Alertas({ unreadCount, onReadAll }: AlertasProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    const load = async () => {
      const data = await alertService.getAll();
      setAlerts(data);
    };
    void load();
  }, []);

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.isRead;
    if (filter === 'read') return a.isRead;
    return true;
  });

  const markAsRead = (id: number) => {
    alertService.markAsRead(id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const dismissAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="text-slate-800">Alertas e Notificações</div>
          <div className="text-slate-500">
            {unreadCount > 0 ? `${unreadCount} não lidos` : 'Nenhum alerta novo'}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onReadAll}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            <Check className="w-5 h-5" />
            Marcar todos como lidos
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-1 inline-flex gap-1">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'}`}>
          Todos ({alerts.length})
        </button>
        <button onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg ${filter === 'unread' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'}`}>
          Não Lidos ({alerts.filter(a => !a.isRead).length})
        </button>
        <button onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg ${filter === 'read' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'}`}>
          Lidos ({alerts.filter(a => a.isRead).length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <Bell className="w-8 h-8 text-slate-400 mx-auto mb-4" />
            <div className="text-slate-800 mb-2">Nenhum alerta encontrado</div>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-4 transition-all ${
                alert.isRead ? 'border-slate-200' : 'border-emerald-200 bg-emerald-50/30'
              }`}
            >
              <div className="flex justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-800">{alert.message}</span>
                  <span className="text-slate-500 text-sm">
                    {new Date(alert.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-emerald-600 hover:bg-emerald-50 rounded-lg px-2 py-1"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-slate-600 hover:bg-slate-100 rounded-lg px-2 py-1"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </PageTransition>
  );
}
