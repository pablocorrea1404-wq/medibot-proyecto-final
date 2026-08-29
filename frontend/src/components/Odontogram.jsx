import React, { useState, useEffect } from 'react';
import { Shield, Activity, Info, X, Check, AlertCircle } from 'lucide-react';

const TOOTH_TYPES = [
    { id: 'healthy', label: 'Sano', color: 'bg-white', dot: 'bg-slate-200', text: 'text-slate-400', pulse: '' },
    { id: 'cavity', label: 'Caries', color: 'bg-red-50', dot: 'bg-red-500', text: 'text-red-600', pulse: 'animate-pulse' },
    { id: 'filling', label: 'Obturación', color: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-600', pulse: '' },
    { id: 'missing', label: 'Ausente', color: 'bg-slate-100', dot: 'bg-slate-400', text: 'text-slate-500', pulse: '' },
    { id: 'implant', label: 'Implante', color: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-600', pulse: 'animate-bounce duration-1000' }
];

export default function Odontogram({ patientId, isOpen, onClose }) {
    const [teethStatus, setTeethStatus] = useState({});
    const [selectedTooth, setSelectedTooth] = useState(null);

    useEffect(() => {
        if (isOpen && patientId) {
            const key = `odontogram_${patientId}`;
            const saved = localStorage.getItem(key);
            if (saved) setTeethStatus(JSON.parse(saved));
            else setTeethStatus({});
        }
    }, [isOpen, patientId]);

    if (!isOpen) return null;

    const handleToothClick = (toothId) => {
        setSelectedTooth(toothId);
    };

    const updateTooth = (status) => {
        const newStatus = { ...teethStatus, [selectedTooth]: status };
        setTeethStatus(newStatus);
        localStorage.setItem(`odontogram_${patientId}`, JSON.stringify(newStatus));
        setSelectedTooth(null);
    };

    const renderTooth = (id, label) => {
        const status = teethStatus[id] || 'healthy';
        const config = TOOTH_TYPES.find(t => t.id === status);
        const isSelected = selectedTooth === id;

        return (
            <div
                key={id}
                onClick={() => handleToothClick(id)}
                className={`relative flex flex-col items-center p-1.5 rounded-2xl transition-all cursor-pointer group ${isSelected ? 'bg-blue-600 scale-110 z-10 shadow-xl' : 'hover:bg-slate-50'}`}
            >
                <div className={`w-9 h-12 ${isSelected ? 'bg-white' : config.color} border-2 ${isSelected ? 'border-white' : 'border-slate-200'} rounded-xl flex items-center justify-center transition-all shadow-sm`}>
                    <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-blue-600' : `${config.dot} ${config.pulse}`}`}></div>
                </div>
                <span className={`text-[10px] font-black mt-2 ${isSelected ? 'text-white' : 'text-slate-400'}`}>{label}</span>
                {!isSelected && status !== 'healthy' && (
                    <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
                    </div>
                )}
            </div>
        );
    };

    const renderQuadrant = (teeth, title) => (
        <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center">{title}</h4>
            <div className="flex justify-center gap-1.5">
                {teeth.map(num => renderTooth(`t${num}`, num))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-[0_40px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-20">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Odontograma Digital</h2>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5">Mapa dental interactivo para diagnóstico</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
                    <div className="max-w-4xl mx-auto space-y-16">

                        {/* Upper Arch */}
                        <div className="space-y-8 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative">
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-50 rounded-full">
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Arcada Superior</span>
                            </div>
                            <div className="grid grid-cols-2 gap-8 pt-4">
                                {renderQuadrant([18, 17, 16, 15, 14, 13, 12, 11], "Cuadrante 1 (Der)")}
                                {renderQuadrant([21, 22, 23, 24, 25, 26, 27, 28], "Cuadrante 2 (Izq)")}
                            </div>
                        </div>

                        {/* Middle Divider */}
                        <div className="flex items-center space-x-4">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <div className="w-4 h-4 rounded-full border-4 border-slate-200"></div>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        {/* Lower Arch */}
                        <div className="space-y-8 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm relative">
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-50 rounded-full">
                                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Arcada Inferior</span>
                            </div>
                            <div className="grid grid-cols-2 gap-8 pb-4">
                                {renderQuadrant([48, 47, 46, 45, 44, 43, 42, 41], "Cuadrante 4 (Der)")}
                                {renderQuadrant([31, 32, 33, 34, 35, 36, 37, 38], "Cuadrante 3 (Izq)")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend & Help Footer */}
                <div className="p-8 border-t border-slate-100 bg-white grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-wrap gap-3">
                        {TOOTH_TYPES.map(t => (
                            <div key={t.id} className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                <div className={`w-3 h-3 rounded-full ${t.dot} shadow-sm`}></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-blue-700 font-bold leading-relaxed">
                            Haz clic sobre un diente para marcar hallazgos clínicos. Cada cambio queda registrado en la ficha digital del paciente de forma permanente.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tooth Action Picker Overlay */}
            {selectedTooth && (
                <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in zoom-in-95" onClick={() => setSelectedTooth(null)}>
                    <div className="bg-white rounded-[40px] shadow-2xl p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight">Diente #{selectedTooth.replace('t', '')}</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Seleccionar estado clínico</p>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {TOOTH_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => updateTooth(type.id)}
                                    className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 hover:bg-slate-50 hover:border-blue-200 transition-all text-left group"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-5 h-5 rounded-full ${type.dot} shadow-md`}></div>
                                        <span className="font-black text-slate-700 text-sm tracking-tight">{type.label}</span>
                                    </div>
                                    <Check className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
