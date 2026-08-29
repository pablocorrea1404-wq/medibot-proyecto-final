import React, { useState, useEffect } from 'react';
import {
    X, Plus, DollarSign, CreditCard, Banknote, Building2,
    ArrowUpRight, ArrowDownRight, RotateCw, Calendar,
    TrendingUp, Filter, Search, Printer, FileText, Download
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const METHODS = [
    { value: 'cash', label: 'Efectivo', icon: <Banknote className="w-4 h-4" />, color: 'green' },
    { value: 'card', label: 'Tarjeta', icon: <CreditCard className="w-4 h-4" />, color: 'blue' },
    { value: 'transfer', label: 'Transferencia', icon: <ArrowUpRight className="w-4 h-4" />, color: 'purple' },
    { value: 'insurance', label: 'Seguro', icon: <Building2 className="w-4 h-4" />, color: 'amber' }
];

export default function PaymentManager({ patientId, patientName, isOpen, onClose }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [plans, setPlans] = useState([]);
    const [newPayment, setNewPayment] = useState({
        amount: '', method: 'cash', concept: '', treatmentPlan: '', paymentDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (isOpen && patientId) {
            fetchPayments();
            fetchPlans();
        }
    }, [isOpen, patientId]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/payments?patient=/api/patients/${patientId}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            setPayments(Array.isArray(data) ? data : (data['member'] || data['hydra:member'] || []));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchPlans = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/treatment_plans?patient=/api/patients/${patientId}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            setPlans(Array.isArray(data) ? data : (data['member'] || data['hydra:member'] || []));
        } catch (err) { console.error(err); }
    };

    const handleSave = async () => {
        const parsedAmount = parseFloat(String(newPayment.amount).replace(',', '.'));
        if (!parsedAmount || parsedAmount <= 0) return;
        setSaving(true);
        try {
            const body = {
                patient: `/api/patients/${patientId}`,
                amount: String(parsedAmount),
                method: newPayment.method,
                concept: newPayment.concept || null,
                paymentDate: newPayment.paymentDate + 'T00:00:00+00:00'
            };
            if (newPayment.treatmentPlan) {
                body.treatmentPlan = `/api/treatment_plans/${newPayment.treatmentPlan}`;
            }
            const res = await fetch(`${API_BASE_URL}/api/payments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setIsCreating(false);
                setNewPayment({ amount: '', method: 'cash', concept: '', treatmentPlan: '', paymentDate: new Date().toISOString().split('T')[0] });
                fetchPayments();
            } else {
                const errData = await res.json();
                alert('Error al guardar: ' + (errData['hydra:description'] || errData.detail || 'Revise los datos.'));
            }
        } catch (err) { 
            console.error(err); 
            alert('Error de conexión.');
        }
        finally { setSaving(false); }
    };

    if (!isOpen) return null;

    const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
    const totalBudget = plans.filter(p => p.status === 'accepted' || p.status === 'in_progress').reduce((s, p) => s + parseFloat(p.finalAmount || 0), 0);
    const balance = totalBudget - totalPaid;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 px-8 py-5 flex justify-between items-center text-white flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black tracking-tight">💳 Facturación y Cobros</h2>
                        <p className="text-slate-400 text-xs font-bold mt-1">{patientName}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => { setIsCreating(true); }}
                            className="px-5 py-2.5 bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-500 transition-all flex items-center space-x-2">
                            <Plus className="w-4 h-4" /> <span>Cobro</span>
                        </button>
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presupuestado</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{totalBudget.toFixed(2)} €</p>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-sm">
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Cobrado</p>
                        <p className="text-2xl font-black text-green-600 mt-1">{totalPaid.toFixed(2)} €</p>
                    </div>
                    <div className={`p-5 rounded-2xl border shadow-sm ${balance > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${balance > 0 ? 'text-red-500' : 'text-green-500'}`}>Pendiente</p>
                        <p className={`text-2xl font-black mt-1 ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>{balance.toFixed(2)} €</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    {isCreating ? (
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                                <DollarSign className="w-5 h-5 mr-3 text-green-600" /> Registrar Cobro
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Importe (€) *</label>
                                    <input type="number" step="0.01" value={newPayment.amount}
                                        onChange={e => setNewPayment(p => ({ ...p, amount: e.target.value }))}
                                        placeholder="0.00"
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black outline-none focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</label>
                                    <input type="date" value={newPayment.paymentDate}
                                        onChange={e => setNewPayment(p => ({ ...p, paymentDate: e.target.value }))}
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mb-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Método de Pago</label>
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {METHODS.map(m => (
                                        <button key={m.value} onClick={() => setNewPayment(p => ({ ...p, method: m.value }))}
                                            className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${newPayment.method === m.value
                                                ? `border-${m.color}-500 bg-${m.color}-50 text-${m.color}-700`
                                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                                            {m.icon}
                                            <span className="text-[10px] font-black mt-2 uppercase tracking-wider">{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {plans.length > 0 && (
                                <div className="mb-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asociar a Presupuesto</label>
                                    <select value={newPayment.treatmentPlan}
                                        onChange={e => setNewPayment(p => ({ ...p, treatmentPlan: e.target.value }))}
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none">
                                        <option value="">Sin presupuesto asociado</option>
                                        {plans.map(plan => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.title} — {parseFloat(plan.finalAmount).toFixed(2)}€
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Concepto</label>
                                <input value={newPayment.concept}
                                    onChange={e => setNewPayment(p => ({ ...p, concept: e.target.value }))}
                                    placeholder="Ej: Pago parcial empaste, limpieza dental..."
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setIsCreating(false)}
                                    className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancelar</button>
                                <button onClick={handleSave} disabled={saving || !newPayment.amount}
                                    className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                                    {saving ? <RotateCw className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                                    <span>{saving ? 'Guardando...' : 'Registrar Cobro'}</span>
                                </button>
                            </div>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                            <div className="text-5xl mb-4">💳</div>
                            <h4 className="font-black text-slate-400 uppercase tracking-widest text-sm">Sin cobros registrados</h4>
                            <p className="text-slate-300 text-sm mt-2 font-medium">Registra el primer cobro del paciente</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)).map(payment => {
                                const method = METHODS.find(m => m.value === payment.method) || METHODS[0];
                                return (
                                    <div key={payment.id}
                                        className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${method.color}-50 text-${method.color}-600`}>
                                                {method.icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800">{payment.concept || method.label}</p>
                                                <p className="text-xs text-slate-400 font-bold mt-0.5">
                                                    {new Date(payment.paymentDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                                                    {payment.treatmentPlan && ' — Vinculado a presupuesto'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-xl text-green-600">+{parseFloat(payment.amount).toFixed(2)} €</p>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-${method.color}-50 text-${method.color}-600`}>
                                                {method.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
