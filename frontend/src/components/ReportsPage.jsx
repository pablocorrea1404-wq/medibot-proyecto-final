import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, Users, Calendar,
    DollarSign, ArrowUpRight, ArrowDownRight,
    Download, Printer
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function ReportsPage() {
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [pRes, aRes, payRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/patients`, { headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}/api/appointments`, { headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}/api/payments`, { headers: { 'Accept': 'application/json' } })
                ]);
                const p = await pRes.json(); const a = await aRes.json(); const pay = await payRes.json();
                setPatients(Array.isArray(p) ? p : (p['member'] || p['hydra:member'] || []));
                setAppointments(Array.isArray(a) ? a : (a['member'] || a['hydra:member'] || []));
                setPayments(Array.isArray(pay) ? pay : (pay['member'] || pay['hydra:member'] || []));
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchAll();
    }, []);

    // Stats calculations
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthlyPayments = payments.filter(p => {
        const d = new Date(p.paymentDate);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const lastMonthPayments = payments.filter(p => {
        const d = new Date(p.paymentDate);
        const lm = thisMonth === 0 ? 11 : thisMonth - 1;
        const ly = thisMonth === 0 ? thisYear - 1 : thisYear;
        return d.getMonth() === lm && d.getFullYear() === ly;
    });

    const thisMonthRevenue = monthlyPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const lastMonthRevenue = lastMonthPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const revenueChange = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : 0;

    const monthlyAppts = appointments.filter(a => {
        if (!a.appointmentDate) return false;
        const d = new Date(a.appointmentDate);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    // Appointment status breakdown
    const statusCounts = {};
    appointments.forEach(a => {
        const s = a.status || 'desconocido';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const totalAppts = appointments.length || 1;

    // Monthly revenue chart data (last 6 months)
    const monthlyRevData = [];
    for (let i = 5; i >= 0; i--) {
        const m = new Date(thisYear, thisMonth - i, 1);
        const monthPayments = payments.filter(p => {
            const d = new Date(p.paymentDate);
            return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
        });
        const total = monthPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
        monthlyRevData.push({
            label: m.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
            value: total
        });
    }
    const maxRev = Math.max(...monthlyRevData.map(d => d.value), 1);

    // Weekday distribution
    const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
    appointments.forEach(a => {
        if (!a.appointmentDate) return;
        const d = new Date(a.appointmentDate);
        if (!isNaN(d.getDay())) weekdayCounts[d.getDay()]++;
    });
    const maxWeekday = Math.max(...weekdayCounts, 1);

    // Payment methods pie
    const methodCounts = { cash: 0, card: 0, transfer: 0, insurance: 0 };
    payments.forEach(p => { if (methodCounts[p.method] !== undefined) methodCounts[p.method]++; });
    const totalPay = Object.values(methodCounts).reduce((s, v) => s + v, 0) || 1;

    const methodColors = { cash: '#22c55e', card: '#3b82f6', transfer: '#a855f7', insurance: '#f59e0b' };
    const methodLabels = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', insurance: 'Seguro' };

    // Top services (from appointments)
    const serviceCounts = {};
    appointments.forEach(a => {
        const proc = a.procedure || a.notes || 'Sin especificar';
        serviceCounts[proc] = (serviceCounts[proc] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxService = topServices[0]?.[1] || 1;

    const printReport = () => {
        const clinicConfig = JSON.parse(localStorage.getItem('medibot_clinic_config') || '{}');
        const clinic = {
            name: clinicConfig.clinicName || 'MediBot Dental',
            subtitle: clinicConfig.subtitle || 'Clínica Dental Profesional',
            color: clinicConfig.primaryColor || '#2563eb'
        };

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Informe Mensual - ${clinic.name}</title>
        <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif}
        body{background:#fff;padding:40px;color:#0f172a}
        .header{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:3px solid ${clinic.color};margin-bottom:30px}
        .title{font-size:24px;font-weight:900;color:${clinic.color}}
        .logo{height:50px;margin-bottom:10px;object-fit:contain}
        .subtitle{font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:1px}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:30px}
        .card{padding:20px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0}
        .card-label{font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;margin-bottom:8px}
        .card-value{font-size:20px;font-weight:900;color:#0f172a}
        .section-title{font-size:16px;font-weight:900;margin:30px 0 15px;color:#0f172a;text-transform:uppercase;letter-spacing:1px}
        table{width:100%;border-collapse:collapse;margin-bottom:20px}
        th{text-align:left;padding:12px;font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;background:#f1f5f9}
        td{padding:12px;font-size:13px;border-bottom:1px solid #f1f5f9;font-weight:600}
        .bar-container{display:flex;align-items:flex-end;height:150px;gap:10px;padding:20px;background:#f8fafc;border-radius:20px}
        .bar{flex:1;background:${clinic.color};border-radius:8px 8px 0 0}
        .bar-label{font-size:9px;font-weight:800;text-align:center;margin-top:10px;color:#94a3b8}
        </style></head><body>
        <div class="header">
            <div>
                ${clinicConfig.logoUrl ? `<img src="${clinicConfig.logoUrl}" class="logo" />` : ''}
                <h1 class="title">${clinic.name}</h1>
                <p class="subtitle">Informe de Gestión Clínica</p>
            </div>
            <div style="text-align:right"><p style="font-size:14px;font-weight:800">${now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}</p></div>
        </div>
        
        <div class="grid">
            <div class="card"><p class="card-label">Ingresos Mensuales</p><p class="card-value">${thisMonthRevenue.toFixed(2)} €</p></div>
            <div class="card"><p class="card-label">Citas Atendidas</p><p class="card-value">${monthlyAppts.length}</p></div>
            <div class="card"><p class="card-label">Nuevos Pacientes</p><p class="card-value">${patients.filter(p => new Date(p.createdAt).getMonth() === thisMonth).length}</p></div>
            <div class="card"><p class="card-label">Ticket Medio</p><p class="card-value">${(thisMonthRevenue / (monthlyPayments.length || 1)).toFixed(2)} €</p></div>
        </div>

        <h2 class="section-title">Evolución de Ingresos</h2>
        <div class="bar-container">
            ${monthlyRevData.map(d => `<div style="flex:1;display:flex;flex-direction:column;height:100%;justify-content:flex-end">
                <div class="bar" style="height:${(d.value / maxRev) * 100}%"></div>
                <p class="bar-label">${d.label}</p>
            </div>`).join('')}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
            <div>
                <h2 class="section-title">Distribución por Día</h2>
                <table><thead><tr><th>Día</th><th>Citas</th></tr></thead>
                <tbody>${weekdayNames.map((n, i) => `<tr><td>${n}</td><td>${weekdayCounts[i]}</td></tr>`).join('')}</tbody></table>
            </div>
            <div>
                <h2 class="section-title">Servicios más Demandados</h2>
                <table><thead><tr><th>Servicio</th><th>Cantidad</th></tr></thead>
                <tbody>${topServices.map(([s, c]) => `<tr><td>${s}</td><td>${c}</td></tr>`).join('')}</tbody></table>
            </div>
        </div>

        <div style="margin-top:50px;text-align:center;color:#cbd5e1;font-size:10px;font-weight:600">
            MediBot PRO — Sistema de Gestión Dental Inteligente — Generado el ${new Date().toLocaleString()}
        </div>
        <script>setTimeout(()=>window.print(),500)</script>
        </body></html>`;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    };

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500" id="reports-area">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Informes & Analytics</h2>
                    <p className="text-sm text-slate-400 font-bold mt-1">Vista general del rendimiento de tu clínica</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            const headers = ['Fecha', 'Monto', 'Metodo', 'Paciente'];
                            const csv = [
                                headers.join(','),
                                ...payments.map(p => `${new Date(p.paymentDate).toLocaleDateString()},${p.amount},${p.method},${p.patient?.name || 'Anon'}`)
                            ].join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `MediBot_CierreCaja_${new Date().toLocaleDateString()}.csv`;
                            a.click();
                        }}
                        className="px-5 py-3 bg-white border-2 border-slate-100 text-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center space-x-2 shadow-sm"
                    >
                        <Download className="w-4 h-4" /> <span>Exportar Excel</span>
                    </button>
                    <button onClick={printReport}
                        className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all flex items-center space-x-2 shadow-xl shadow-slate-200">
                        <Printer className="w-4 h-4" /> <span>Imprimir PDF</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard
                    label="Ingresos del Mes"
                    value={`${thisMonthRevenue.toFixed(0)} €`}
                    change={revenueChange}
                    icon={<DollarSign className="w-5 h-5" />}
                    color="green"
                />
                <KpiCard
                    label="Citas del Mes"
                    value={monthlyAppts.length}
                    change={null}
                    icon={<Calendar className="w-5 h-5" />}
                    color="blue"
                />
                <KpiCard
                    label="Total Pacientes"
                    value={patients.length}
                    change={null}
                    icon={<Users className="w-5 h-5" />}
                    color="purple"
                />
                <KpiCard
                    label="Ticket Medio"
                    value={`${(thisMonthRevenue / (monthlyPayments.length || 1)).toFixed(0)} €`}
                    change={null}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="amber"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Revenue Chart */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" /> Ingresos Mensuales
                    </h3>
                    <div className="flex items-end justify-between space-x-3 h-48 px-2">
                        {monthlyRevData.map((d, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                                <span className="text-[9px] font-black text-slate-400 mb-2">{d.value > 0 ? `${d.value.toFixed(0)}€` : ''}</span>
                                <div className="w-full rounded-xl transition-all duration-500 hover:opacity-80"
                                    style={{
                                        height: `${Math.max((d.value / maxRev) * 100, 4)}%`,
                                        background: i === monthlyRevData.length - 1
                                            ? 'linear-gradient(180deg, #3b82f6, #2563eb)'
                                            : 'linear-gradient(180deg, #e2e8f0, #cbd5e1)'
                                    }}></div>
                                <span className="text-[10px] mt-2 font-black text-slate-400">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekday Distribution */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" /> Citas por Día de la Semana
                    </h3>
                    <div className="flex items-end justify-between space-x-3 h-48 px-2">
                        {weekdayNames.map((name, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                                <span className="text-[9px] font-black text-slate-400 mb-2">{weekdayCounts[i] > 0 ? weekdayCounts[i] : ''}</span>
                                <div className="w-full rounded-xl transition-all"
                                    style={{
                                        height: `${Math.max((weekdayCounts[i] / maxWeekday) * 100, 4)}%`,
                                        background: i === 0 || i === 6
                                            ? 'linear-gradient(180deg, #fca5a5, #ef4444)'
                                            : 'linear-gradient(180deg, #93c5fd, #3b82f6)'
                                    }}></div>
                                <span className={`text-[10px] mt-2 font-black ${i === 0 || i === 6 ? 'text-red-400' : 'text-slate-400'}`}>{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appointment Status */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Estado de Citas</h3>
                    <div className="space-y-3">
                        {Object.entries(statusCounts).map(([status, count]) => {
                            const pct = (count / totalAppts * 100).toFixed(0);
                            const colorMap = {
                                completada: 'bg-green-500', completed: 'bg-green-500',
                                pendiente: 'bg-amber-500', pending: 'bg-amber-500',
                                cancelada: 'bg-red-500', cancelled: 'bg-red-500',
                                confirmada: 'bg-blue-500', confirmed: 'bg-blue-500'
                            };
                            return (
                                <div key={status}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-600 capitalize">{status}</span>
                                        <span className="text-xs font-black text-slate-400">{count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${colorMap[status] || 'bg-slate-400'}`}
                                            style={{ width: `${pct}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Métodos de Pago</h3>
                    <div className="space-y-4">
                        {Object.entries(methodCounts).map(([method, count]) => {
                            const pct = (count / totalPay * 100).toFixed(0);
                            return (
                                <div key={method} className="flex items-center space-x-3">
                                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: methodColors[method] }}></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-slate-600">{methodLabels[method]}</span>
                                            <span className="text-xs font-black text-slate-400">{pct}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${pct}%`, backgroundColor: methodColors[method] }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Services */}
                <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Top Tratamientos</h3>
                    {topServices.length === 0 ? (
                        <p className="text-slate-300 text-sm font-medium text-center py-8">Sin datos</p>
                    ) : (
                        <div className="space-y-3">
                            {topServices.map(([service, count], i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-600 truncate max-w-[180px]">{service}</span>
                                        <span className="text-xs font-black text-slate-400">{count}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000"
                                            style={{ width: `${(count / maxService) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KpiCard({ label, value, change, icon, color }) {
    const colorMap = {
        green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' }
    };
    const c = colorMap[color] || colorMap.blue;
    const isPositive = change > 0;

    return (
        <div className={`bg-white p-6 rounded-[24px] shadow-sm border ${c.border} hover:shadow-md transition-all`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${c.bg} ${c.text}`}>{icon}</div>
                {change !== null && (
                    <span className={`flex items-center text-xs font-black ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {Math.abs(change)}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
        </div>
    );
}
