import React, { useState, useEffect } from 'react';
import {
    Users, Calendar, Activity, Clock,
    ChevronRight, AlertCircle,
    DollarSign, TrendingUp, BarChart3,
    Plus
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Skeleton, CardSkeleton } from './Skeleton';

export default function ClinicDashboard({ onNavigate, patients, appointments, onOpenPatientModal, onOpenAppointmentModal, loading, role }) {
    const [realRevenue, setRealRevenue] = useState(0);

    useEffect(() => {
        if (role === 'admin') {
            // Fetch real payments
            fetch(`${API_BASE_URL}/api/payments`, { headers: { 'Accept': 'application/json' } })
                .then(res => res.json())
                .then(data => {
                    const paymentsList = Array.isArray(data) ? data : (data['member'] || data['hydra:member'] || []);
                    
                    // Filter this month's payments
                    const now = new Date();
                    const thisMonthPayments = paymentsList.filter(p => {
                        if (!p.paymentDate) return false;
                        const pDate = new Date(p.paymentDate);
                        return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
                    });

                    const total = thisMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
                    setRealRevenue(total);
                })
                .catch(err => console.error("Error fetching payments", err));
        }
    }, [role]);

    const stats = {
        totalRevenue: realRevenue,
        totalPatients: patients.length || 0,
        totalAppointments: appointments.length || 0,
        pendingAppointments: appointments.filter(a => a.status === 'pending' || a.status === 'pendiente').length
    };

    if (loading) {
        return (
            <div className="space-y-10 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-14 w-40" />
                        <Skeleton className="h-14 w-40" />
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                    <div className="xl:col-span-2 space-y-8">
                        <Skeleton className="h-12 w-full" />
                        <div className="grid grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64" />)}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-12 w-full" />
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-700">
            {/* TOP BAR / QUICK ACTIONS */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-4">
                <div className="animate-in fade-in slide-in-from-left duration-700">
                    <h2 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                        Panel de <span className="text-blue-600">Control</span>
                    </h2>
                    <p className="text-slate-400 dark:text-slate-500 font-black mt-4 uppercase text-[9px] lg:text-[11px] tracking-[0.5em] flex items-center">
                        <Activity className="w-4 h-4 mr-3 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" /> Métricas en tiempo real
                    </p>
                </div>
                <div className="flex gap-4 w-full lg:w-auto animate-in fade-in slide-in-from-right duration-700">
                    <button onClick={onOpenAppointmentModal} className="flex-1 lg:flex-none px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Agendar
                    </button>
                    <button onClick={onOpenPatientModal} className="flex-1 lg:flex-none px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-white/5 active:scale-95 flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> Pacientes
                    </button>
                </div>
            </div>

            {/* MAIN STATS GRID */}
            <div className={`grid gap-6 lg:gap-10 ${role === 'admin' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                {role === 'admin' && (
                    <StatCard title="Facturación Mes" value={`${stats.totalRevenue.toFixed(2)}€`} icon={<DollarSign />} color="blue" trend="Pagos confirmados" />
                )}
                <StatCard title="Pacientes" value={stats.totalPatients} icon={<Users />} color="blue" trend="Total registrados" />
                <StatCard title="Total Citas" value={stats.totalAppointments} icon={<Clock />} color="blue" trend="En el sistema" />
                <StatCard title="Pendientes" value={stats.pendingAppointments} icon={<AlertCircle />} color="amber" trend="Por confirmar" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl lg:rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800 p-6 lg:p-10">
                    <div className="mb-6 lg:mb-10">
                        <h3 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Próximas Citas</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Siguiente en la lista</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {appointments.length > 0 ? appointments.slice(0, 6).map((app, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] group hover:bg-blue-600 transition-all hover:translate-x-2">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center shadow-sm group-hover:bg-white/10">
                                        <span className="text-[10px] font-black text-blue-600 group-hover:text-white leading-none">{(app.time || app.appointmentDate?.split('T')?.[1] || '00:00').split(':')[0]}</span>
                                        <span className="text-[14px] font-black text-slate-900 dark:text-white group-hover:text-white">{(app.time || app.appointmentDate?.split('T')?.[1] || '00:00').split(':')[1]?.slice(0, 2)}</span>
                                    </div>
                                    <div>
                                        <h5 className="text-sm font-black text-slate-800 dark:text-white group-hover:text-white tracking-tight">
                                            {typeof app.patient === 'object' ? app.patient.name : (app.patient?.split('/').pop() || 'Paciente')}
                                        </h5>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-100">
                                            {typeof app.service === 'object' ? app.service.name : (app.service || 'Consulta')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        const pid = app.patientId || (typeof app.patient === 'object' ? app.patient.id : app.patient?.split('/').pop());
                                        const pName = typeof app.patient === 'object' ? app.patient.name : (app.patient?.split('/').pop() || 'Paciente');
                                        onOpenPatientModal(pid, pName);
                                    }}
                                    className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-all"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )) : (
                            <div className="col-span-2 py-12 text-center opacity-40">
                                <Calendar className="w-12 h-12 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Cero citas pendientes</p>
                            </div>
                        )}
                    </div>
                </div>

            {/* PERFORMANCE CHARTS SUB-TAB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                <div className="bg-white dark:bg-slate-900 p-6 lg:p-10 rounded-3xl lg:rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6 lg:mb-10">
                        <h4 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white">Citas por Día</h4>
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <WeeklyChart />
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 lg:p-10 rounded-3xl lg:rounded-[48px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6 lg:mb-10">
                        <h4 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white">Efectividad</h4>
                        <Activity className="w-5 h-5 text-green-500" />
                    </div>
                    <StatusDistribution />
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, trend }) {
    const colors = {
        blue: "from-blue-600 to-indigo-600 shadow-blue-500/40 text-white",
        green: "from-emerald-500 to-teal-600 shadow-emerald-500/40 text-white",
        purple: "from-purple-600 to-violet-600 shadow-purple-500/40 text-white",
        amber: "from-amber-400 to-orange-500 shadow-amber-500/40 text-white"
    };

    return (
        <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-5 lg:p-10 rounded-3xl lg:rounded-[48px] shadow-sm border border-slate-100 dark:border-white/5 flex flex-col hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2">
            <div className="flex justify-between items-start mb-4 lg:mb-8">
                <div className={`p-4 lg:p-5 rounded-[20px] lg:rounded-[24px] bg-gradient-to-br ${colors[color]} shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    {React.cloneElement(icon, { className: "w-5 h-5 lg:w-7 lg:h-7" })}
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 mb-1">
                        <TrendingUp className="w-3 h-3 text-blue-400" />
                        <span className="text-[9px] lg:text-[10px] font-black text-blue-500 uppercase tracking-widest">{trend}</span>
                    </div>
                    <div className="w-12 h-1 bg-slate-100 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${colors[color]} animate-[pulse_2s_infinite] shadow-[0_0_10px_currentColor]`} style={{ width: '60%' }}></div>
                    </div>
                </div>
            </div>

            {/* Holographic Signal Pulse */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-1000 bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)]"></div>

            <h3 className="text-slate-400 font-black text-[9px] lg:text-[10px] uppercase tracking-[0.3em] relative z-10">{title}</h3>
            <div className="flex items-baseline gap-2 relative z-10 mt-2 lg:mt-3">
                <p className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{value}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
        </div>
    );
}

function WeeklyChart() {
    const counts = [4, 8, 12, 6, 15, 3, 0];
    const max = Math.max(...counts, 1);
    return (
        <div className="flex items-end justify-between space-x-4 h-56">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl shadow-inner h-full flex items-end overflow-hidden group/bar">
                        <div className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-3xl transition-all duration-1000 group-hover/bar:from-blue-500 group-hover/bar:to-indigo-400" style={{ height: `${(counts[i] / max) * 100}%` }}></div>
                    </div>
                    <span className="text-[10px] mt-4 font-black text-slate-400 uppercase tracking-widest">{day}</span>
                </div>
            ))}
        </div>
    );
}

function StatusDistribution() {
    return (
        <div className="space-y-10 py-6">
            <StatusRow label="Confirmadas" pct={65} color="bg-blue-600" />
            <StatusRow label="Pendientes" pct={25} color="bg-amber-400" />
            <StatusRow label="Bajas" pct={10} color="bg-red-500" />
        </div>
    );
}

function StatusRow({ label, pct, color }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{pct}%</span>
            </div>
            <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full rounded-full ${color} transition-all duration-1000 shadow-lg`} style={{ width: `${pct}%` }}></div>
            </div>
        </div>
    );
}
