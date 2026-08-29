import React, { useState } from 'react';
import { Search, MoreVertical, FileText, UserPlus, Edit, Trash2, HeartPulse } from 'lucide-react';
import PatientHistoryModal from './PatientHistoryModal';
import NewPatientModal from './NewPatientModal';

export default function PatientTable({ patients = [], onAddPatient, onDeletePatient, onEditPatient, isNewPatientOpen, setIsNewPatientOpen, notify }) {
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleViewHistory = (patient) => {
        setSelectedPatient({ ...patient, patient: patient.name });
        setIsHistoryOpen(true);
    };

    const handleEditClick = (patient) => {
        setEditingPatient(patient);
        setIsNewPatientOpen(true);
    };

    const handleSavePatient = async (data) => {
        if (editingPatient) {
            await onEditPatient(editingPatient.id || editingPatient['@id']?.split('/').pop(), data);
        } else {
            await onAddPatient(data);
        }
        setEditingPatient(null);
        setIsNewPatientOpen(false);
    };

    const handleDelete = async (id) => {
        if (onDeletePatient) {
            await onDeletePatient(id);
        }
    };

    const filteredPatients = Array.isArray(patients) ? patients.filter(patient =>
        (patient.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (patient.dni?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-4 lg:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Actions */}
            <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-6 lg:p-8 rounded-2xl lg:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center">
                        <HeartPulse className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-blue-500" />
                        Base de Datos de Pacientes
                    </h3>
                    <p className="text-[10px] lg:text-sm text-slate-400 font-bold mt-1 uppercase tracking-widest">{filteredPatients.length} pacientes registrados actualmente</p>
                </div>

                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-blue-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o DNI..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3 lg:py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl lg:rounded-2xl text-sm dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all w-full lg:w-80 font-medium"
                        />
                    </div>
                    <button
                        onClick={() => setIsNewPatientOpen(true)}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-[10px] lg:text-xs font-black px-6 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl transition-all shadow-xl shadow-blue-100 uppercase tracking-widest active:scale-95"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Añadir Paciente
                    </button>
                </div>
            </div>

            {/* Patients Grid/Table */}
            <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl rounded-2xl lg:rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
                                <th className="px-4 lg:px-8 py-4 lg:py-6 text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Paciente / DNI</th>
                                <th className="hidden lg:table-cell px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Contacto</th>
                                <th className="hidden lg:table-cell px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Última Visita</th>
                                <th className="px-4 lg:px-8 py-4 lg:py-6 text-[8px] lg:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                            {filteredPatients.length > 0 ? (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id || patient['@id']} className="group transition-all duration-500 hover:bg-white/5 dark:hover:bg-white/[0.03]">
                                        <td className="px-4 lg:px-8 py-4 lg:py-6 relative overflow-hidden">
                                            {/* Row Iridescent Highlight */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                                            <div className="flex items-center relative z-10">
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/10 flex items-center justify-center text-slate-700 dark:text-blue-400 font-black mr-3 lg:mr-4 border border-white/20 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden relative">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} alt="avatar" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-800 dark:text-white text-sm lg:text-lg tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{patient.name}</div>
                                                    <div className="text-[9px] lg:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mt-0.5">{patient.dni}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-slate-700 dark:text-slate-300 font-black text-xs uppercase tracking-wider">{patient.email}</span>
                                                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold mt-1.5 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    {patient.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="hidden lg:table-cell px-8 py-6">
                                            <div className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest inline-block group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all">
                                                {patient.lastVisit || 'Sincronizado'}
                                            </div>
                                        </td>
                                        <td className="px-4 lg:px-8 py-4 lg:py-6 h-full">
                                            <div className="flex items-center justify-end space-x-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                                <button
                                                    onClick={() => handleViewHistory(patient)}
                                                    className="p-3 bg-white dark:bg-slate-800 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-premium-sm active:scale-90"
                                                    title="Expediente Clínico"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditClick(patient)}
                                                    className="p-3 bg-white dark:bg-slate-800 text-amber-500 hover:bg-amber-500 hover:text-white rounded-2xl transition-all shadow-premium-sm active:scale-90"
                                                    title="Modificar Registro"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(patient.id || patient['@id']?.split('/').pop())}
                                                    className="p-3 bg-white dark:bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-premium-sm active:scale-90"
                                                    title="Eliminar del Sistema"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 text-slate-200 dark:text-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <h4 className="text-lg font-black text-slate-400 uppercase tracking-widest">Sin resultados</h4>
                                            <p className="text-sm text-slate-300 mt-2 font-medium">No se han encontrado pacientes que coincidan con "{searchTerm}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PatientHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                patient={selectedPatient}
                notify={notify}
            />

            <NewPatientModal
                isOpen={isNewPatientOpen}
                onClose={() => { setIsNewPatientOpen(false); setEditingPatient(null); }}
                onSave={handleSavePatient}
                initialData={editingPatient}
            />
        </div>
    );
}
