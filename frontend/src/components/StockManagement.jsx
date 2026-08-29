import React, { useState, useEffect } from 'react';
import {
    Package, Plus, Search, AlertTriangle, Edit3, Trash2,
    X, Save, RotateCw, Filter, ArrowDown, ArrowUp, Box
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { Skeleton, CardSkeleton } from './Skeleton';

const CATEGORIES = [
    { value: 'consumible', label: 'Consumible', emoji: '🧴' },
    { value: 'material', label: 'Material', emoji: '🦷' },
    { value: 'instrumento', label: 'Instrumento', emoji: '🔧' },
    { value: 'medicamento', label: 'Medicamento', emoji: '💊' },
    { value: 'proteccion', label: 'Protección', emoji: '🧤' }
];

export default function StockManagement() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCat, setFilterCat] = useState('all');
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', category: 'consumible', quantity: '0', minStock: '5',
        unit: 'unidades', unitPrice: '', supplier: '', notes: ''
    });

    useEffect(() => { fetchItems(); }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/stock_items`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            setItems(Array.isArray(data) ? data : (data['member'] || data['hydra:member'] || []));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!form.name) return;
        setSaving(true);
        try {
            const url = editingId
                ? `${API_BASE_URL}/api/stock_items/${editingId}`
                : `${API_BASE_URL}/api/stock_items`;
            const method = editingId ? 'PATCH' : 'POST';
            const headers = editingId
                ? { 'Content-Type': 'application/merge-patch+json', 'Accept': 'application/json' }
                : { 'Content-Type': 'application/json', 'Accept': 'application/json' };

            const body = {
                name: form.name,
                category: form.category,
                quantity: parseInt(form.quantity) || 0,
                minStock: parseInt(form.minStock) || 5,
                unit: form.unit,
                unitPrice: form.unitPrice || null,
                supplier: form.supplier || null,
                notes: form.notes || null
            };

            const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
            if (res.ok) {
                setIsCreating(false);
                setEditingId(null);
                resetForm();
                fetchItems();
            }
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const handleDelete = async (rawId) => {
        if (!window.confirm('¿Eliminar este artículo del inventario?')) return;
        const id = typeof rawId === 'string' && rawId.includes('/') ? rawId.split('/').pop() : rawId;
        try {
            await fetch(`${API_BASE_URL}/api/stock_items/${id}`, { method: 'DELETE' });
            fetchItems();
        } catch (err) { console.error(err); }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name || '', category: item.category || 'consumible',
            quantity: (item.quantity || 0).toString(), minStock: (item.minStock || 5).toString(),
            unit: item.unit || 'unidades', unitPrice: item.unitPrice || '',
            supplier: item.supplier || '', notes: item.notes || ''
        });
        setIsCreating(true);
    };

    const handleQuickUpdate = async (rawId, delta) => {
        const id = typeof rawId === 'string' && rawId.includes('/') ? rawId.split('/').pop() : rawId;
        const item = items.find(i => (i.id || i['@id']) === rawId);
        if (!item) return;
        const newQty = Math.max(0, (item.quantity || 0) + delta);
        try {
            await fetch(`${API_BASE_URL}/api/stock_items/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/merge-patch+json', 'Accept': 'application/json' },
                body: JSON.stringify({ quantity: newQty })
            });
            setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
        } catch (err) { console.error(err); }
    };

    const resetForm = () => setForm({
        name: '', category: 'consumible', quantity: '0', minStock: '5',
        unit: 'unidades', unitPrice: '', supplier: '', notes: ''
    });

    const filtered = items
        .filter(i => filterCat === 'all' || i.category === filterCat)
        .filter(i => !searchTerm || (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const lowStockCount = items.filter(i => (i.quantity || 0) <= (i.minStock || 5)).length;
    const totalValue = items.reduce((s, i) => s + (parseFloat(i.unitPrice || 0) * (i.quantity || 0)), 0);

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Inventario</h2>
                    <p className="text-[10px] lg:text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">Material y stock</p>
                </div>
                <button onClick={() => { setIsCreating(true); setEditingId(null); resetForm(); }}
                    className="px-4 py-2 lg:px-6 lg:py-3 bg-blue-600 text-white rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-lg shadow-blue-100">
                    <Plus className="w-4 h-4" /> <span>Añadir</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-4 lg:p-5 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <p className="text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Artículos</p>
                    <p className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-1">{items.length}</p>
                </div>
                <div className={`p-4 lg:p-5 rounded-xl lg:rounded-2xl shadow-sm border ${lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                    <p className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest ${lowStockCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {lowStockCount > 0 ? '⚠️ Stock Bajo' : '✅ Stock OK'}
                    </p>
                    <p className={`text-lg lg:text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{lowStockCount}</p>
                </div>
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-4 lg:p-5 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <p className="text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Valor Total</p>
                    <p className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-1">{totalValue.toFixed(0)} €</p>
                </div>
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-4 lg:p-5 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <p className="text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Categorías</p>
                    <p className="text-lg lg:text-2xl font-black text-slate-900 dark:text-white mt-1">{new Set(items.map(i => i.category)).size}</p>
                </div>
            </div>

            {/* Create/Edit Form */}
            {isCreating && (
                <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl rounded-[28px] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                    <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                        <Package className="w-5 h-5 mr-3 text-blue-600" />
                        {editingId ? 'Editar Artículo' : 'Nuevo Artículo'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre *</label>
                            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="Ej: Guantes de nitrilo talla M"
                                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</label>
                            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none">
                                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cantidad</label>
                            <input type="number" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Mín.</label>
                            <input type="number" value={form.minStock} onChange={e => setForm(p => ({ ...p, minStock: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidad</label>
                            <input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}
                                placeholder="unidades, cajas..."
                                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Precio/U (€)</label>
                            <input type="number" step="0.01" value={form.unitPrice} onChange={e => setForm(p => ({ ...p, unitPrice: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proveedor</label>
                            <input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))}
                                className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6">
                        <button onClick={() => { setIsCreating(false); setEditingId(null); }}
                            className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancelar</button>
                        <button onClick={handleSave} disabled={saving || !form.name}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                            {saving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>{saving ? 'Guardando...' : 'Guardar'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                <div className="relative flex-1 lg:max-w-xs">
                    <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Buscar artículo..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl lg:rounded-2xl text-[10px] lg:text-sm dark:text-white font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['all', ...CATEGORIES.map(c => c.value)].map(cat => (
                        <button key={cat} onClick={() => setFilterCat(cat)}
                            className={`px-3 py-1.5 rounded-xl text-[8px] lg:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                                ${filterCat === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'}`}>
                            {cat === 'all' ? 'Todos' : CATEGORIES.find(c => c.value === cat)?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Item List */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[28px] border-2 border-dashed border-slate-200">
                    <div className="text-5xl mb-4">📦</div>
                    <h4 className="font-black text-slate-400 uppercase tracking-widest text-sm">Sin artículos</h4>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    {filtered.map(item => {
                        const isLow = (item.quantity || 0) <= (item.minStock || 5);
                        const cat = CATEGORIES.find(c => c.value === item.category);
                        return (
                            <div key={item.id}
                                className={`bg-white dark:bg-slate-900 rounded-3xl lg:rounded-[32px] p-6 lg:p-8 shadow-sm border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group ${isLow ? 'border-red-200 bg-red-50/30 dark:border-red-900/40 dark:bg-red-900/10' : 'border-slate-100 dark:border-white/5'}`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{cat?.emoji || '📦'}</span>
                                        <div>
                                            <h4 className="font-black text-slate-800 dark:text-white text-sm">{item.name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat?.label || item.category}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                                            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id || item['@id'])} className="p-1.5 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleQuickUpdate(item.id || item['@id'], -1)}
                                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-100 flex items-center justify-center text-slate-500 hover:text-red-600 transition-all">
                                            <ArrowDown className="w-3 h-3" />
                                        </button>
                                        <div className={`px-4 py-2 rounded-xl text-center min-w-[80px] ${isLow ? 'bg-red-100' : 'bg-green-50'}`}>
                                            <span className={`text-lg font-black ${isLow ? 'text-red-600' : 'text-green-700'}`}>{item.quantity}</span>
                                            <span className="text-[9px] font-bold text-slate-400 block">{item.unit}</span>
                                        </div>
                                        <button onClick={() => handleQuickUpdate(item.id || item['@id'], 1)}
                                            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-green-100 flex items-center justify-center text-slate-500 hover:text-green-600 transition-all">
                                            <ArrowUp className="w-3 h-3" />
                                        </button>
                                    </div>
                                    {isLow && (
                                        <div className="flex items-center space-x-1 text-red-500">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-[9px] font-black uppercase">Bajo</span>
                                        </div>
                                    )}
                                </div>

                                {item.supplier && (
                                    <p className="text-[10px] text-slate-400 font-bold mt-3 truncate">📍 {item.supplier}</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
