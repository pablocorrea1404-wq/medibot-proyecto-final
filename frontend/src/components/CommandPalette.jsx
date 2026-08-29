import React, { useState, useEffect, useRef } from 'react';
import {
    Search, Users, Calendar, FileText, DollarSign,
    Package, Settings, LayoutDashboard, Briefcase,
    ArrowRight, Command, X, Plus, Printer, Moon, Sun, UserPlus
} from 'lucide-react';

const SECTIONS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, keywords: 'inicio panel principal estadísticas' },
    { id: 'calendar', label: 'Agenda', icon: <Calendar className="w-4 h-4" />, keywords: 'citas agenda calendario horario' },
    { id: 'patients', label: 'Pacientes', icon: <Users className="w-4 h-4" />, keywords: 'pacientes nombres listado' },
    { id: 'team', label: 'Equipo', icon: <Briefcase className="w-4 h-4" />, keywords: 'equipo doctores profesionales staff' },
    { id: 'billing', label: 'Facturación', icon: <DollarSign className="w-4 h-4" />, keywords: 'facturación cobros pagos ingresos dinero' },
    { id: 'stock', label: 'Inventario', icon: <Package className="w-4 h-4" />, keywords: 'inventario stock materiales guantes' },
    { id: 'settings', label: 'Configuración', icon: <Settings className="w-4 h-4" />, keywords: 'configuración ajustes clínica logo nombre' }
];

const ACTIONS = [
    { id: 'new-patient', label: 'Registrar Nuevo Paciente', icon: <UserPlus className="w-4 h-4" />, keywords: 'añadir crear nuevo paciente alta' },
    { id: 'new-apt', label: 'Agendar Nueva Cita', icon: <Plus className="w-4 h-4" />, keywords: 'cita turno agendar programar' },
    { id: 'print-prices', label: 'Lista de Precios (PDF)', icon: <Printer className="w-4 h-4" />, keywords: 'precios servicios imprimir pdf' },
    { id: 'toggle-dark', label: 'Cambiar Modo Visual', icon: <Moon className="w-4 h-4" />, keywords: 'color oscuro claro vista tema' }
];

export default function CommandPalette({ isOpen, onClose, onNavigate, onAction, patients = [] }) {
    const [query, setQuery] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIdx(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const q = query.toLowerCase().trim();

    // Filter logic
    const matchedActions = q ? ACTIONS.filter(a => a.label.toLowerCase().includes(q) || a.keywords.toLowerCase().includes(q)) : ACTIONS;
    const matchedSections = q ? SECTIONS.filter(s => s.label.toLowerCase().includes(q) || s.keywords.toLowerCase().includes(q)) : SECTIONS;
    const matchedPatients = q && q.length >= 2
        ? patients.filter(p => (p.name || '').toLowerCase().includes(q) || (p.dni || '').toLowerCase().includes(q)).slice(0, 5)
        : [];

    const allResults = [
        ...matchedActions.map(a => ({ type: 'action', ...a })),
        ...matchedSections.map(s => ({ type: 'section', ...s })),
        ...matchedPatients.map(p => ({ type: 'patient', id: p.id, label: p.name, sub: p.dni || '', icon: <Users className="w-4 h-4" /> }))
    ];

    const handleSelect = (result) => {
        if (result.type === 'action') {
            onAction(result.id);
        } else if (result.type === 'section') {
            onNavigate(result.id);
        } else if (result.type === 'patient') {
            onNavigate('patients', result.id);
        }
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx(i => Math.min(i + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && allResults[selectedIdx]) {
            handleSelect(allResults[selectedIdx]);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh]" onClick={onClose}>
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
            <div className="relative w-full max-w-xl mx-4 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
                    {/* Search Input */}
                    <div className="flex items-center border-b border-gray-100 dark:border-slate-800 px-8 py-2">
                        <Search className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
                            onKeyDown={handleKeyDown}
                            placeholder="¿Qué quieres hacer hoy? Escribe aquí..."
                            className="flex-1 px-5 py-6 text-lg font-bold outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent dark:text-white"
                        />
                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black">ESC</kbd>
                    </div>

                    <div className="max-h-[450px] overflow-y-auto py-4">
                        {allResults.length === 0 ? (
                            <div className="px-8 py-16 text-center">
                                <Search className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                                <p className="text-slate-400 text-sm font-bold">Sin resultados para "{query}"</p>
                            </div>
                        ) : (
                            <div className="px-4 space-y-6">
                                {matchedActions.length > 0 && (
                                    <div>
                                        <p className="px-4 text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-3">Acciones Rápidas</p>
                                        <div className="space-y-1">
                                            {matchedActions.map((a, i) => (
                                                <ResultButton key={a.id} active={selectedIdx === i} result={a} onClick={() => handleSelect({ type: 'action', ...a })} onHover={() => setSelectedIdx(i)} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {matchedSections.length > 0 && (
                                    <div>
                                        <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Navegación</p>
                                        <div className="space-y-1">
                                            {matchedSections.map((s, i) => {
                                                const idx = matchedActions.length + i;
                                                return <ResultButton key={s.id} active={selectedIdx === idx} result={s} onClick={() => handleSelect({ type: 'section', ...s })} onHover={() => setSelectedIdx(idx)} />;
                                            })}
                                        </div>
                                    </div>
                                )}

                                {matchedPatients.length > 0 && (
                                    <div>
                                        <p className="px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Pacientes</p>
                                        <div className="space-y-1">
                                            {matchedPatients.map((p, i) => {
                                                const idx = matchedActions.length + matchedSections.length + i;
                                                return <ResultButton key={p.id} active={selectedIdx === idx} result={{ ...p, label: p.name, sub: p.dni, icon: <Users className="w-4 h-4" /> }} onClick={() => handleSelect({ type: 'patient', ...p })} onHover={() => setSelectedIdx(idx)} />;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 px-8 py-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-center space-x-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded shadow-sm">↑↓</kbd> Mover</span>
                            <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded shadow-sm">Enter</kbd> Ejecutar</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 opacity-50">
                            <Command className="w-3 h-3" />
                            <span className="text-[10px] font-black tracking-widest uppercase">MediBot Core</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ResultButton({ active, result, onClick, onHover }) {
    return (
        <button
            onClick={onClick}
            onMouseEnter={onHover}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 -translate-y-0.5' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
            <div className={`p-2.5 rounded-xl transition-all ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                {result.icon}
            </div>
            <div className="flex-1">
                <p className="font-bold text-sm tracking-tight">{result.label || result.name}</p>
                {result.sub && <p className={`text-[10px] font-bold mt-0.5 uppercase tracking-widest ${active ? 'text-blue-100 opacity-80' : 'text-slate-400'}`}>{result.sub}</p>}
            </div>
            {active && <ArrowRight className="w-4 h-4 animate-in slide-in-from-left-2 duration-300" />}
        </button>
    );
}
