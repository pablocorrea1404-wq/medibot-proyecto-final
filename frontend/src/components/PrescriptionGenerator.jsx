import React, { useState } from 'react';
import { Pill, Printer, X, FileText, Check, ShieldCheck } from 'lucide-react';

export default function PrescriptionGenerator({ isOpen, onClose, patientName, patientDni }) {
    const [meds, setMeds] = useState([{ name: '', dose: '', duration: '' }]);
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const addMed = () => setMeds([...meds, { name: '', dose: '', duration: '' }]);
    const updateMed = (index, field, value) => {
        const newMeds = [...meds];
        newMeds[index][field] = value;
        setMeds(newMeds);
    };

    const handlePrint = () => {
        const clinicConfig = JSON.parse(localStorage.getItem('medibot_clinic_config') || '{}');
        const clinicName = clinicConfig.clinicName || 'MediBot Dental';

        const html = `
            <!DOCTYPE html><html><head><title>Receta - ${patientName}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; background: white; }
                .header { border-bottom: 4px solid #2563eb; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
                .clinic-name { font-size: 28px; font-weight: 900; color: #2563eb; }
                .patient-box { background: #f8fafc; padding: 25px; border-radius: 20px; border: 1px solid #e2e8f0; margin-bottom: 40px; }
                .med-item { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px dashed #e2e8f0; }
                .med-name { font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 5px; }
                .med-details { font-size: 14px; color: #64748b; font-weight: 600; }
                .footer { margin-top: 100px; display: flex; justify-content: space-between; }
                .signature { border-top: 2px solid #e2e8f0; width: 250px; text-align: center; padding-top: 10px; font-size: 12px; font-weight: 800; color: #94a3b8; }
                @media print { .no-print { display: none; } body { padding: 0; } }
            </style></head>
            <body>
                <div class="header">
                    <div><div class="clinic-name">${clinicName.toUpperCase()}</div><div style="font-size: 12px; font-weight: 800; color: #64748b; tracking-widest; margin-top: 5px;">RECETA MÉDICA OFICIAL</div></div>
                    <div style="text-align: right; font-size: 14px; font-weight: 700;">Fecha: ${new Date().toLocaleDateString()}</div>
                </div>
                <div class="patient-box">
                    <div style="font-size: 10px; font-weight: 900; color: #94a3b8; margin-bottom: 10px; letter-spacing: 1px;">DATOS DEL PACIENTE</div>
                    <div style="font-size: 20px; font-weight: 900;">${patientName}</div>
                    <div style="font-size: 14px; color: #64748b; font-weight: 700; margin-top: 5px;">DNI: ${patientDni}</div>
                </div>
                <div style="font-size: 10px; font-weight: 900; color: #2563eb; margin-bottom: 25px; letter-spacing: 1px;">PRESCRIPCIÓN FARMACOLÓGICA</div>
                ${meds.map(m => `
                    <div class="med-item">
                        <div class="med-name">${m.name || '---'}</div>
                        <div class="med-details">${m.dose} — ${m.duration}</div>
                    </div>
                `).join('')}
                <div style="margin-top: 40px;">
                    <div style="font-size: 10px; font-weight: 900; color: #94a3b8; margin-bottom: 10px;">INDICACIONES ADICIONALES</div>
                    <div style="font-size: 14px; line-height: 1.6;">${notes || 'No se han especificado notas adicionales.'}</div>
                </div>
                <div class="footer">
                    <div class="signature">FIRMA DEL PACIENTE</div>
                    <div class="signature" style="border-top-color: #2563eb; color: #2563eb;">FIRMA Y SELLO MÉDICO</div>
                </div>
                <div style="margin-top: 60px; text-align: center; font-size: 10px; color: #cbd5e1; font-weight: 800;">
                    MediBot PRO — Sistema de Prescripción Digital Seguro — ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
                <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
            </body></html>
        `;

        const win = window.open('', '_blank');
        win.document.write(html);
        win.document.close();
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/70 backdrop-blur-xl p-0 md:p-4 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-[#020617] w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] md:rounded-[48px] shadow-[0_32px_128px_rgba(0,0,0,0.4)] border border-white/20 dark:border-white/5 overflow-hidden flex flex-col">
                <div className="px-6 lg:px-8 py-4 lg:py-6 border-b border-slate-100 flex items-center justify-between bg-white relative">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                            <Pill className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg lg:text-2xl font-black text-slate-800 dark:text-white tracking-tight">Receta Digital</h2>
                            <p className="text-[10px] lg:text-sm text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">{patientName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 lg:p-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl lg:rounded-2xl transition-all">
                        <X className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-10 space-y-6 lg:space-y-8 bg-slate-50 dark:bg-[#020617]/10">
                    <div className="space-y-3 lg:space-y-4">
                        <div className="flex justify-between items-center px-2 lg:px-4">
                            <h3 className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest">Medicamentos</h3>
                            <button onClick={addMed} className="text-[10px] lg:text-xs font-black text-blue-600 hover:underline">+ AÑADIR</button>
                        </div>
                        {meds.map((med, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-4 lg:p-6 rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 animate-in slide-in-from-left-4 duration-300">
                                <div className="space-y-1 lg:space-y-2">
                                    <label className="text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase ml-2">Nombre</label>
                                    <input
                                        type="text"
                                        placeholder="Medicamento..."
                                        className="w-full bg-slate-50 dark:bg-white/5 p-2.5 lg:p-3 rounded-lg lg:rounded-xl border border-transparent dark:border-white/5 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm font-bold dark:text-white"
                                        value={med.name}
                                        onChange={(e) => updateMed(i, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1 lg:space-y-2">
                                    <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase ml-2">Dosis</label>
                                    <input
                                        type="text"
                                        placeholder="1 cada 8h..."
                                        className="w-full bg-slate-50 p-2.5 lg:p-3 rounded-lg lg:rounded-xl border border-transparent focus:border-blue-500 focus:bg-white transition-all text-sm font-bold"
                                        value={med.dose}
                                        onChange={(e) => updateMed(i, 'dose', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1 lg:space-y-2">
                                    <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase ml-2">Duración</label>
                                    <input
                                        type="text"
                                        placeholder="7 días..."
                                        className="w-full bg-slate-50 p-2.5 lg:p-3 rounded-lg lg:rounded-xl border border-transparent focus:border-blue-500 focus:bg-white transition-all text-sm font-bold"
                                        value={med.duration}
                                        onChange={(e) => updateMed(i, 'duration', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest px-2 lg:px-4">Indicaciones</label>
                        <textarea
                            className="w-full bg-white dark:bg-slate-900/50 p-4 lg:p-6 rounded-2xl lg:rounded-[32px] border border-slate-100 dark:border-white/5 shadow-sm min-h-[80px] lg:min-h-[120px] focus:border-blue-500 outline-none text-sm font-medium dark:text-white transition-all"
                            placeholder="Ej: Tomar con las comidas..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-4 lg:p-8 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-[#020617] flex flex-col sm:flex-row gap-3 lg:gap-4">
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-4 lg:py-5 bg-blue-600 text-white rounded-xl lg:rounded-[24px] font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                    >
                        <Printer className="w-5 h-5" /> Imprimir Receta
                    </button>
                    <div className="p-3 lg:p-4 bg-green-50 rounded-xl lg:rounded-2xl border border-green-100 flex items-center justify-center gap-3 shrink-0">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Validado</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
