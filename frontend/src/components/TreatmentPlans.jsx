import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, FileText, Check, Clock, AlertCircle, RotateCw, Download, Printer } from 'lucide-react';
import { API_BASE_URL } from '../config';

const PLAN_STATUSES = {
    draft: { label: 'Borrador', color: 'slate', icon: '📝' },
    presented: { label: 'Presentado', color: 'blue', icon: '📋' },
    accepted: { label: 'Aceptado', color: 'green', icon: '✅' },
    in_progress: { label: 'En Curso', color: 'amber', icon: '🔧' },
    completed: { label: 'Completado', color: 'emerald', icon: '🏆' },
    rejected: { label: 'Rechazado', color: 'red', icon: '❌' }
};

export default function TreatmentPlans({ patientId, patientName, isOpen, onClose }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [services, setServices] = useState([]);

    const [newPlan, setNewPlan] = useState({
        title: '', notes: '', discountPercent: '0', items: []
    });

    useEffect(() => {
        if (isOpen && patientId) {
            fetchPlans();
            fetchServices();
        }
    }, [isOpen, patientId]);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/treatment_plans?patient=/api/patients/${patientId}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            setPlans(Array.isArray(data) ? data : (data['member'] || data['hydra:member'] || []));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchServices = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/medical_services`, { headers: { 'Accept': 'application/json' } });
            const data = await res.json();
            setServices(Array.isArray(data) ? data : (data['member'] || data['hydra:member'] || []));
        } catch (err) { console.error(err); }
    };

    const addItem = () => {
        setNewPlan(p => ({
            ...p,
            items: [...p.items, { service: '', toothNumber: '', description: '', price: '0', status: 'pending' }]
        }));
    };

    const updateItem = (idx, field, value) => {
        setNewPlan(p => {
            const items = [...p.items];
            items[idx] = { ...items[idx], [field]: value };
            // Auto-fill price from service
            if (field === 'service' && value) {
                const svc = services.find(s => s.name === value);
                if (svc) {
                    items[idx].price = svc.price;
                    items[idx].description = svc.name;
                }
            }
            return { ...p, items };
        });
    };

    const removeItem = (idx) => {
        setNewPlan(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
    };

    const calculateTotals = (items, discount) => {
        const total = items.reduce((s, it) => s + parseFloat(it.price || 0), 0);
        const disc = parseFloat(discount || 0);
        const final_ = total - (total * disc / 100);
        return { total: total.toFixed(2), final: final_.toFixed(2) };
    };

    const handleSavePlan = async () => {
        if (!newPlan.title || newPlan.items.length === 0) return;
        setSaving(true);
        try {
            const totals = calculateTotals(newPlan.items, newPlan.discountPercent);
            const body = {
                patient: `/api/patients/${patientId}`,
                title: newPlan.title,
                status: 'draft',
                items: newPlan.items,
                totalAmount: totals.total,
                discountPercent: newPlan.discountPercent || '0',
                finalAmount: totals.final,
                notes: newPlan.notes
            };
            const res = await fetch(`${API_BASE_URL}/api/treatment_plans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setIsCreating(false);
                setNewPlan({ title: '', notes: '', discountPercent: '0', items: [] });
                fetchPlans();
            }
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const updatePlanStatus = async (planId, newStatus) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/treatment_plans/${planId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/merge-patch+json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    ...(newStatus === 'accepted' ? { acceptedAt: new Date().toISOString() } : {})
                })
            });
            if (res.ok) fetchPlans();
        } catch (err) { console.error(err); }
    };

    const printPlan = (plan) => {
        const clinicConfig = JSON.parse(localStorage.getItem('medibot_clinic_config') || '{}');
        const clinic = {
            name: clinicConfig.clinicName || 'MediBot Dental',
            subtitle: clinicConfig.subtitle || 'Clínica Dental Profesional',
            address: clinicConfig.address || '',
            phone: clinicConfig.phone || '',
            email: clinicConfig.email || '',
            cif: clinicConfig.cif || '',
            footer: clinicConfig.footerText || 'Gracias por confiar en nosotros.',
            notes: clinicConfig.invoiceNotes || 'IVA incluido.',
            color: clinicConfig.primaryColor || '#2563eb'
        };

        const itemsHtml = (plan.items || []).map((item, i) => `
            <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155">${i + 1}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#0f172a">${item.description || item.service}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#64748b;text-align:center">${item.toothNumber || '-'}</td>
                <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#0f172a;text-align:right">${parseFloat(item.price).toFixed(2)} €</td>
            </tr>
        `).join('');

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Presupuesto - ${plan.title}</title>
        <style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;font-family:'Inter',sans-serif}
        body{background:#fff;padding:40px 60px;color:#0f172a}
        @media print{body{padding:20px 40px}}
        </style></head><body>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:3px solid ${clinic.color}">
            <div>
                <h1 style="font-size:28px;font-weight:900;color:${clinic.color};letter-spacing:-0.5px">${clinic.name}</h1>
                <p style="font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-top:4px">${clinic.subtitle}</p>
            </div>
            <div style="text-align:right;font-size:12px;color:#64748b;line-height:1.8">
                ${clinic.address ? `<div>${clinic.address}</div>` : ''}
                ${clinic.phone ? `<div>Tel: ${clinic.phone}</div>` : ''}
                ${clinic.email ? `<div>${clinic.email}</div>` : ''}
                ${clinic.cif ? `<div>CIF: ${clinic.cif}</div>` : ''}
            </div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:32px">
            <div>
                <p style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#94a3b8;margin-bottom:8px">Presupuesto Para</p>
                <p style="font-size:20px;font-weight:800">${patientName}</p>
            </div>
            <div style="text-align:right">
                <p style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#94a3b8;margin-bottom:8px">Fecha</p>
                <p style="font-size:16px;font-weight:700">${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
        </div>
        <h2 style="font-size:18px;font-weight:800;margin-bottom:20px;color:#0f172a">${plan.title}</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
            <thead><tr style="background:#f8fafc">
                <th style="padding:12px 16px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;border-bottom:2px solid #e2e8f0">#</th>
                <th style="padding:12px 16px;text-align:left;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;border-bottom:2px solid #e2e8f0">Tratamiento</th>
                <th style="padding:12px 16px;text-align:center;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;border-bottom:2px solid #e2e8f0">Pieza</th>
                <th style="padding:12px 16px;text-align:right;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#94a3b8;border-bottom:2px solid #e2e8f0">Importe</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
        </table>
        <div style="margin-left:auto;width:300px;background:#f8fafc;border-radius:16px;padding:20px;border:1px solid #e2e8f0">
            <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px"><span style="color:#64748b">Subtotal</span><span style="font-weight:700">${parseFloat(plan.totalAmount).toFixed(2)} €</span></div>
            ${parseFloat(plan.discountPercent) > 0 ? `<div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px;color:#ef4444"><span>Descuento (${plan.discountPercent}%)</span><span style="font-weight:700">-${(parseFloat(plan.totalAmount) - parseFloat(plan.finalAmount)).toFixed(2)} €</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;font-size:20px;padding-top:12px;border-top:2px solid #e2e8f0;margin-top:8px"><span style="font-weight:900">TOTAL</span><span style="font-weight:900;color:${clinic.color}">${parseFloat(plan.finalAmount).toFixed(2)} €</span></div>
        </div>
        ${plan.notes ? `<div style="margin-top:24px;padding:16px;background:#fffbeb;border-radius:12px;font-size:13px;color:#92400e;border:1px solid #fde68a"><strong>Nota:</strong> ${plan.notes}</div>` : ''}
        <div style="margin-top:60px;padding-top:20px;border-top:1px solid #e2e8f0;text-align:center">
            <p style="font-size:12px;color:#94a3b8;font-weight:500">${clinic.footer}</p>
            <p style="font-size:10px;color:#cbd5e1;margin-top:8px">${clinic.notes}</p>
            <p style="font-size:10px;color:#cbd5e1;margin-top:16px">Presupuesto válido durante 30 días. Este documento no constituye factura.</p>
        </div>
        <script>setTimeout(()=>window.print(),500)</script>
        </body></html>`;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 px-8 py-5 flex justify-between items-center text-white flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-black tracking-tight">💰 Presupuestos y Planes</h2>
                        <p className="text-slate-400 text-xs font-bold mt-1">{patientName}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button onClick={() => { setIsCreating(true); setSelectedPlan(null); }}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center space-x-2">
                            <Plus className="w-4 h-4" /> <span>Nuevo</span>
                        </button>
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    {isCreating ? (
                        /* CREATE FORM */
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center"><FileText className="w-5 h-5 mr-3 text-blue-600" /> Nuevo Presupuesto</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título del Plan</label>
                                    <input value={newPlan.title} onChange={e => setNewPlan(p => ({ ...p, title: e.target.value }))}
                                        placeholder="Ej: Rehabilitación completa cuadrante 3"
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descuento (%)</label>
                                    <input type="number" value={newPlan.discountPercent} onChange={e => setNewPlan(p => ({ ...p, discountPercent: e.target.value }))}
                                        className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>

                            {/* Items */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tratamientos</label>
                                    <button onClick={addItem} className="text-xs font-black text-blue-600 flex items-center space-x-1 hover:text-blue-700">
                                        <Plus className="w-3 h-3" /> <span>Añadir</span>
                                    </button>
                                </div>

                                {newPlan.items.length === 0 ? (
                                    <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400 text-sm font-medium">Añade tratamientos al presupuesto</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {newPlan.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <select value={item.service} onChange={e => updateItem(idx, 'service', e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none">
                                                    <option value="">Seleccionar servicio...</option>
                                                    {services.map(s => <option key={s.id} value={s.name}>{s.name} — {s.price}€</option>)}
                                                </select>
                                                <input type="text" value={item.toothNumber} onChange={e => updateItem(idx, 'toothNumber', e.target.value)}
                                                    placeholder="Pieza" className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-center outline-none" />
                                                <input type="number" step="0.01" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)}
                                                    className="w-24 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-right outline-none" />
                                                <span className="text-xs font-black text-slate-400">€</span>
                                                <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            {newPlan.items.length > 0 && (
                                <div className="bg-slate-900 text-white p-6 rounded-2xl mb-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-slate-400 font-bold">Subtotal</span>
                                        <span className="font-black">{calculateTotals(newPlan.items, newPlan.discountPercent).total} €</span>
                                    </div>
                                    {parseFloat(newPlan.discountPercent) > 0 && (
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-red-400 font-bold">Descuento ({newPlan.discountPercent}%)</span>
                                            <span className="text-red-400 font-black">
                                                -{(parseFloat(calculateTotals(newPlan.items, '0').total) - parseFloat(calculateTotals(newPlan.items, newPlan.discountPercent).final)).toFixed(2)} €
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg mt-3 pt-3 border-t border-white/10">
                                        <span className="font-black">TOTAL</span>
                                        <span className="font-black text-green-400">{calculateTotals(newPlan.items, newPlan.discountPercent).final} €</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas</label>
                                <textarea value={newPlan.notes} onChange={e => setNewPlan(p => ({ ...p, notes: e.target.value }))}
                                    placeholder="Observaciones adicionales..." rows={3}
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold resize-none outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button onClick={() => setIsCreating(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                                <button onClick={handleSavePlan} disabled={saving || !newPlan.title || newPlan.items.length === 0}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                                    {saving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    <span>{saving ? 'Guardando...' : 'Guardar Presupuesto'}</span>
                                </button>
                            </div>
                        </div>
                    ) : selectedPlan ? (
                        /* PLAN DETAIL */
                        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                            <button onClick={() => setSelectedPlan(null)} className="text-xs font-black text-blue-600 mb-6 hover:text-blue-700">← Volver a lista</button>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{selectedPlan.title}</h3>
                                    <p className="text-sm text-slate-400 font-bold mt-1">
                                        Creado: {new Date(selectedPlan.createdAt).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                                <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest 
                                    ${selectedPlan.status === 'accepted' ? 'bg-green-50 text-green-700' : selectedPlan.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {PLAN_STATUSES[selectedPlan.status]?.icon} {PLAN_STATUSES[selectedPlan.status]?.label}
                                </span>
                            </div>

                            <div className="space-y-2 mb-6">
                                {(selectedPlan.items || []).map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                        <div>
                                            <p className="font-bold text-slate-800">{item.description || item.service}</p>
                                            {item.toothNumber && <p className="text-xs text-slate-400 font-bold">Pieza: {item.toothNumber}</p>}
                                        </div>
                                        <span className="font-black text-slate-900">{parseFloat(item.price).toFixed(2)} €</span>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-slate-900 text-white p-6 rounded-2xl mb-6">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span className="font-black">{parseFloat(selectedPlan.totalAmount).toFixed(2)} €</span>
                                </div>
                                {parseFloat(selectedPlan.discountPercent) > 0 && (
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-red-400">Descuento ({selectedPlan.discountPercent}%)</span>
                                        <span className="text-red-400 font-black">-{(parseFloat(selectedPlan.totalAmount) - parseFloat(selectedPlan.finalAmount)).toFixed(2)} €</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl mt-3 pt-3 border-t border-white/10">
                                    <span className="font-black">TOTAL</span>
                                    <span className="font-black text-green-400">{parseFloat(selectedPlan.finalAmount).toFixed(2)} €</span>
                                </div>
                            </div>

                            {selectedPlan.notes && <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-2xl mb-6">{selectedPlan.notes}</p>}

                            <div className="flex gap-3">
                                {selectedPlan.status === 'draft' && (
                                    <button onClick={() => updatePlanStatus(selectedPlan.id, 'presented')}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all">
                                        Presentar al Paciente
                                    </button>
                                )}
                                {selectedPlan.status === 'presented' && (
                                    <>
                                        <button onClick={() => updatePlanStatus(selectedPlan.id, 'accepted')}
                                            className="flex-1 py-3 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all">
                                            ✅ Aceptado
                                        </button>
                                        <button onClick={() => updatePlanStatus(selectedPlan.id, 'rejected')}
                                            className="flex-1 py-3 bg-red-100 text-red-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-200 transition-all">
                                            ❌ Rechazado
                                        </button>
                                    </>
                                )}
                                {selectedPlan.status === 'accepted' && (
                                    <button onClick={() => updatePlanStatus(selectedPlan.id, 'in_progress')}
                                        className="flex-1 py-3 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all">
                                        🔧 Iniciar Tratamiento
                                    </button>
                                )}
                                {selectedPlan.status === 'in_progress' && (
                                    <button onClick={() => updatePlanStatus(selectedPlan.id, 'completed')}
                                        className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all">
                                        🏆 Completar
                                    </button>
                                )}
                                <button onClick={() => printPlan(selectedPlan)}
                                    className="py-3 px-6 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center space-x-2">
                                    <Printer className="w-4 h-4" /> <span>Imprimir</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* PLAN LIST */
                        <div>
                            {loading ? (
                                <div className="flex items-center justify-center h-40"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
                            ) : plans.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                                    <div className="text-5xl mb-4">💰</div>
                                    <h4 className="font-black text-slate-400 uppercase tracking-widest text-sm">Sin presupuestos</h4>
                                    <p className="text-slate-300 text-sm mt-2 font-medium">Crea el primer plan de tratamiento</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {plans.map(plan => (
                                        <div key={plan.id} onClick={() => setSelectedPlan(plan)}
                                            className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-lg group-hover:text-blue-700 transition-colors">{plan.title}</h4>
                                                    <p className="text-xs text-slate-400 font-bold mt-1">
                                                        {(plan.items || []).length} tratamientos — {new Date(plan.createdAt).toLocaleDateString('es-ES')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-xl text-slate-900">{parseFloat(plan.finalAmount).toFixed(2)} €</p>
                                                    <span className={`inline-block mt-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest
                                                        ${plan.status === 'accepted' || plan.status === 'completed' ? 'bg-green-50 text-green-700' :
                                                            plan.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                                                plan.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                                                                    'bg-blue-50 text-blue-700'}`}>
                                                        {PLAN_STATUSES[plan.status]?.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
