import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, CreditCard, Banknote, Building2,
    ArrowUpRight, Calendar, Download, Filter, Search,
    ChevronLeft, ChevronRight, Printer, BarChart3
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Skeleton, CardSkeleton } from './Skeleton';

const METHODS_MAP = {
    cash: { label: 'Efectivo', icon: <Banknote className="w-4 h-4" />, color: 'green' },
    card: { label: 'Tarjeta', icon: <CreditCard className="w-4 h-4" />, color: 'blue' },
    transfer: { label: 'Transferencia', icon: <ArrowUpRight className="w-4 h-4" />, color: 'purple' },
    insurance: { label: 'Seguro', icon: <Building2 className="w-4 h-4" />, color: 'amber' }
};

export default function BillingDashboard() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState('month');

    useEffect(() => {
        fetchAllPayments();
    }, []);

    const fetchAllPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/payments`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : (data['member'] || data['hydra:member'] || []));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // Filter payments by date range
    const now = new Date();
    const filteredByDate = payments.filter(p => {
        if (!p.paymentDate) return true;
        const pDate = new Date(p.paymentDate);
        if (dateRange === 'today') {
            return pDate.toDateString() === now.toDateString();
        } else if (dateRange === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return pDate >= weekAgo;
        } else if (dateRange === 'month') {
            return pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear();
        }
        return true;
    });

    const filteredByMethod = filter === 'all'
        ? filteredByDate
        : filteredByDate.filter(p => p.method === filter);

    const filteredPayments = searchTerm
        ? filteredByMethod.filter(p => {
            const concept = (p.concept || '').toLowerCase();
            const patientName = (typeof p.patient === 'object' ? p.patient.name : (typeof p.patient === 'string' ? 'Paciente' : '')).toLowerCase();
            return concept.includes(searchTerm.toLowerCase()) || patientName.includes(searchTerm.toLowerCase());
        })
        : filteredByMethod;

    const sortedPayments = [...filteredPayments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    // Stats
    const totalRevenue = filteredByDate.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const cashTotal = filteredByDate.filter(p => p.method === 'cash').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const cardTotal = filteredByDate.filter(p => p.method === 'card').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const transferTotal = filteredByDate.filter(p => p.method === 'transfer').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const insuranceTotal = filteredByDate.filter(p => p.method === 'insurance').reduce((s, p) => s + parseFloat(p.amount || 0), 0);

    // Daily breakdown for the chart
    const dailyData = {};
    filteredByDate.forEach(p => {
        const day = new Date(p.paymentDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        dailyData[day] = (dailyData[day] || 0) + parseFloat(p.amount || 0);
    });
    const dailyEntries = Object.entries(dailyData).slice(-7);
    const maxDaily = Math.max(...dailyEntries.map(([_, v]) => v), 1);

    const dateRangeLabel = {
        today: 'Hoy',
        week: 'Esta Semana',
        month: 'Este Mes',
        all: 'Todo'
    };

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Facturación</h2>
                    <p className="text-[10px] lg:text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">Cobros — {dateRangeLabel[dateRange]}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {['today', 'week', 'month', 'all'].map(range => (
                        <button key={range} onClick={() => setDateRange(range)}
                            className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all
                                ${dateRange === range ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white dark:bg-white/5 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100 dark:border-white/10'}`}>
                            {dateRangeLabel[range]}
                        </button>
                    ))}
                    <a href={`${API_BASE_URL}/api/earnings/export`}
                        className="px-3 py-1.5 lg:px-4 lg:py-2 bg-green-600 text-white rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center space-x-2">
                        <Download className="w-3 h-3" /> <span>Excel</span>
                    </a>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                {loading ? (
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    <>
                        <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-5 lg:p-8 rounded-3xl lg:rounded-[40px] shadow-sm border border-slate-100 dark:border-white/5 col-span-2 lg:col-span-1 group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><TrendingUp className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Período</span>
                            </div>
                            <p className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{totalRevenue.toFixed(2)} €</p>
                            <p className="text-xs text-blue-500 font-black mt-2 uppercase tracking-widest">{filteredByDate.length} Operaciones</p>
                        </div>
                        <div className="bg-white dark:bg-green-900/10 p-5 lg:p-8 rounded-3xl lg:rounded-[40px] shadow-sm border border-green-100 dark:border-green-900/20 group hover:-translate-y-2 transition-all duration-500">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-2xl"><Banknote className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Efectivo</span>
                            </div>
                            <p className="text-xl lg:text-3xl font-black text-green-700 leading-none tracking-tighter">{cashTotal.toFixed(2)} €</p>
                        </div>
                        <div className="bg-white dark:bg-blue-900/10 p-5 lg:p-8 rounded-3xl lg:rounded-[40px] shadow-sm border border-blue-100 dark:border-blue-900/20 group hover:-translate-y-2 transition-all duration-500">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl"><CreditCard className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Tarjeta</span>
                            </div>
                            <p className="text-xl lg:text-3xl font-black text-blue-700 leading-none tracking-tighter">{cardTotal.toFixed(2)} €</p>
                        </div>
                        <div className="bg-white dark:bg-purple-900/10 p-5 lg:p-8 rounded-3xl lg:rounded-[40px] shadow-sm border border-purple-100 dark:border-purple-900/20 group hover:-translate-y-2 transition-all duration-500">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-2xl"><ArrowUpRight className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Transfe</span>
                            </div>
                            <p className="text-xl lg:text-3xl font-black text-purple-700 leading-none tracking-tighter">{transferTotal.toFixed(2)} €</p>
                        </div>
                        <div className="bg-white dark:bg-amber-900/10 p-5 lg:p-8 rounded-3xl lg:rounded-[40px] shadow-sm border border-amber-100 dark:border-amber-900/20 group hover:-translate-y-2 transition-all duration-500">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-2xl"><Building2 className="w-5 h-5" /></div>
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Seguro</span>
                            </div>
                            <p className="text-xl lg:text-3xl font-black text-amber-700 leading-none tracking-tighter">{insuranceTotal.toFixed(2)} €</p>
                        </div>
                    </>
                )}
            </div>

            {/* Chart + Payment List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Daily Chart */}
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" /> Ingresos Diarios
                    </h3>
                    {dailyEntries.length > 0 ? (
                        <div className="flex items-end justify-between space-x-2 h-40">
                            {dailyEntries.map(([day, amount]) => (
                                <div key={day} className="flex flex-col items-center flex-1 h-full justify-end">
                                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 mb-1">{amount.toFixed(0)}€</span>
                                    <div className="w-full bg-green-500 rounded-lg transition-all hover:bg-green-600"
                                        style={{ height: `${(amount / maxDaily) * 100}%`, minHeight: '4px' }}></div>
                                    <span className="text-[9px] mt-2 font-black text-slate-400">{day}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-slate-300 text-sm font-medium">Sin datos</div>
                    )}
                </div>

                {/* Payment List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="p-4 lg:p-5 border-b border-gray-100 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <h3 className="text-[10px] lg:text-sm font-black text-slate-400 uppercase tracking-widest">Últimos Cobros</h3>
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar..."
                                    className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-bold outline-none w-full lg:w-40 focus:lg:w-52 transition-all" />
                            </div>
                            <select value={filter} onChange={e => setFilter(e.target.value)}
                                className="px-2 py-2 bg-slate-50 border border-slate-100 rounded-lg lg:rounded-xl text-[10px] lg:text-xs font-bold outline-none">
                                <option value="all">Filtro</option>
                                <option value="cash">Efectivo</option>
                                <option value="card">Tarjeta</option>
                                <option value="transfer">Transfe</option>
                                <option value="insurance">Seguro</option>
                            </select>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50 dark:divide-white/5 max-h-[400px] overflow-y-auto no-scrollbar">
                        {loading ? (
                            <div className="p-6 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                            </div>
                        ) : sortedPayments.length === 0 ? (
                            <div className="p-10 text-center text-slate-300 dark:text-slate-600 text-sm font-medium">No hay cobros registrados</div>
                        ) : sortedPayments.map(payment => {
                            const method = METHODS_MAP[payment.method] || METHODS_MAP.cash;
                            return (
                                <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${method.color}-50 text-${method.color}-600`}>
                                            {method.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm">{payment.concept || method.label}</p>
                                            <p className="text-xs text-slate-400 font-medium">
                                                {payment.patient?.name || 'Paciente'} — {new Date(payment.paymentDate).toLocaleDateString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-black text-green-600">+{parseFloat(payment.amount).toFixed(2)} €</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
