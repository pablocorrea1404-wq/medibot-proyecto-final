import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Clock, AlertTriangle, CheckCircle, Users, Calendar, Package } from 'lucide-react';

export default function NotificationCenter({ appointments = [], patients = [], stockItems = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [dismissed, setDismissed] = useState([]);
    const ref = useRef(null);

    useEffect(() => {
        const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Generate notifications dynamically
    const now = new Date();
    const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const notifications = [];

    // Today's appointments
    const todayCitas = appointments.filter(a => a.date === todayStr);
    if (todayCitas.length > 0) {
        notifications.push({
            id: 'today-citas',
            type: 'info',
            icon: <Calendar className="w-4 h-4" />,
            title: `${todayCitas.length} citas hoy`,
            desc: `Próxima: ${todayCitas[0]?.time || ''}`,
            time: 'Ahora',
            color: 'blue'
        });
    }

    // Pending appointments
    const pending = appointments.filter(a => a.status === 'pendiente' || a.status === 'pending');
    if (pending.length > 3) {
        notifications.push({
            id: 'pending-many',
            type: 'warning',
            icon: <Clock className="w-4 h-4" />,
            title: `${pending.length} citas pendientes`,
            desc: 'Revise y confirme las citas pendientes',
            time: 'Importante',
            color: 'amber'
        });
    }

    // Low stock
    const lowStock = stockItems.filter(i => (i.quantity || 0) <= (i.minStock || 5));
    if (lowStock.length > 0) {
        notifications.push({
            id: 'low-stock',
            type: 'danger',
            icon: <Package className="w-4 h-4" />,
            title: `${lowStock.length} artículos con stock bajo`,
            desc: lowStock.slice(0, 2).map(i => i.name).join(', '),
            time: 'Urgente',
            color: 'red'
        });
    }

    // New patients this week
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const newPatients = patients.filter(p => {
        if (!p.createdAt) return false;
        return new Date(p.createdAt) >= weekAgo;
    });
    if (newPatients.length > 0) {
        notifications.push({
            id: 'new-patients',
            type: 'success',
            icon: <Users className="w-4 h-4" />,
            title: `${newPatients.length} pacientes nuevos esta semana`,
            desc: newPatients.slice(0, 2).map(p => p.name).join(', '),
            time: 'Esta semana',
            color: 'green'
        });
    }

    // Welcome message
    notifications.push({
        id: 'welcome',
        type: 'info',
        icon: <CheckCircle className="w-4 h-4" />,
        title: 'Sistema operativo',
        desc: 'MediBot PRO funcionando correctamente',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        color: 'green'
    });

    const activeNotifications = notifications.filter(n => !dismissed.includes(n.id));
    const unreadCount = activeNotifications.length;

    const colorMap = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
        red: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
        green: { bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500' }
    };

    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 hover:bg-slate-800 rounded-xl transition-all group">
                <Bell className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-black text-slate-900 text-sm">Notificaciones</h3>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{unreadCount} activas</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                        {activeNotifications.map(n => {
                            const colors = colorMap[n.color] || colorMap.blue;
                            return (
                                <div key={n.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors flex items-start space-x-3 group">
                                    <div className={`p-2 rounded-xl ${colors.bg} ${colors.text} flex-shrink-0 mt-0.5`}>
                                        {n.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm">{n.title}</p>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{n.desc}</p>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                                        <span className="text-[9px] font-bold text-slate-300">{n.time}</span>
                                        <button onClick={() => setDismissed(p => [...p, n.id])}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-lg transition-all">
                                            <X className="w-3 h-3 text-slate-300 hover:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
                        <button onClick={() => setDismissed(notifications.map(n => n.id))}
                            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors">
                            Marcar todas como leídas
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
