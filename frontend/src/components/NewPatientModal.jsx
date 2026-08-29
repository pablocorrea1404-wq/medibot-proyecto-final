import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, FileText, UserPlus, Heart, Shield, Calendar, MapPin, Droplets, AlertTriangle, Pill, Building } from 'lucide-react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function NewPatientModal({ isOpen, onClose, onSave, initialData }) {
    const [formData, setFormData] = useState({
        name: '', dni: '', email: '', phone: '',
        birthDate: '', address: '', allergies: '',
        medicalConditions: '', medications: '',
        bloodType: '', insuranceCompany: '',
        insuranceNumber: '', clinicalNotes: ''
    });
    const [activeSection, setActiveSection] = useState('basic');

    useEffect(() => {
        if (initialData && isOpen) {
            setFormData({
                name: initialData.name || '',
                dni: initialData.dni || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                birthDate: initialData.birthDate ? initialData.birthDate.split('T')[0] : '',
                address: initialData.address || '',
                allergies: initialData.allergies || '',
                medicalConditions: initialData.medicalConditions || '',
                medications: initialData.medications || '',
                bloodType: initialData.bloodType || '',
                insuranceCompany: initialData.insuranceCompany || '',
                insuranceNumber: initialData.insuranceNumber || '',
                clinicalNotes: initialData.clinicalNotes || ''
            });
        } else if (isOpen && !initialData) {
            setFormData({
                name: '', dni: '', email: '', phone: '',
                birthDate: '', address: '', allergies: '',
                medicalConditions: '', medications: '',
                bloodType: '', insuranceCompany: '',
                insuranceNumber: '', clinicalNotes: ''
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };
        if (dataToSave.birthDate) dataToSave.birthDate = dataToSave.birthDate + 'T00:00:00+00:00';
        else delete dataToSave.birthDate;
        // Limpiar campos vacíos opcionales
        Object.keys(dataToSave).forEach(k => { if (dataToSave[k] === '') dataToSave[k] = null; });
        if (!dataToSave.name) dataToSave.name = '';
        onSave(dataToSave);
    };

    const sections = [
        { id: 'basic', label: 'Datos', icon: <User className="w-4 h-4" /> },
        { id: 'medical', label: 'Médico', icon: <Heart className="w-4 h-4" /> },
        { id: 'insurance', label: 'Seguro', icon: <Shield className="w-4 h-4" /> }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className="bg-white rounded-2xl lg:rounded-[32px] w-full max-w-2xl max-h-[90vh] shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 px-6 lg:px-8 py-4 lg:py-5 flex justify-between items-center text-white flex-shrink-0">
                    <h3 className="text-lg lg:text-xl font-black uppercase tracking-widest flex items-center">
                        <UserPlus className="w-5 h-5 mr-3 text-blue-500" />
                        {initialData ? 'Editar Paciente' : 'Nuevo Paciente'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
                </div>

                {/* Section Tabs */}
                <div className="px-4 lg:px-8 pt-4 lg:pt-6 flex space-x-2 flex-shrink-0 overflow-x-auto no-scrollbar">
                    {sections.map(s => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)}
                            className={`flex items-center space-x-2 px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
                                ${activeSection === s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                            {s.icon} <span>{s.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4 lg:space-y-5">
                    {activeSection === 'basic' && (
                        <>
                            <div className="space-y-1 lg:space-y-2">
                                <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nombre *</label>
                                <input required name="name" value={formData.name} onChange={handleChange} placeholder="Ej. Juan Pérez"
                                    className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                <div className="space-y-1 lg:space-y-2">
                                    <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">DNI / NIE *</label>
                                    <input required name="dni" value={formData.dni} onChange={handleChange} placeholder="12345678X"
                                        className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1 lg:space-y-2">
                                    <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Nacimiento</label>
                                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange}
                                        className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                <div className="space-y-1 lg:space-y-2">
                                    <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Email</label>
                                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="juan@email.com"
                                        className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                                <div className="space-y-1 lg:space-y-2">
                                    <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Teléfono</label>
                                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder="600000000"
                                        className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>
                            <div className="space-y-1 lg:space-y-2">
                                <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Dirección</label>
                                <input name="address" value={formData.address} onChange={handleChange} placeholder="Dirección..."
                                    className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                        </>
                    )}

                    {activeSection === 'medical' && (
                        <>
                            <div className="p-3 lg:p-4 bg-red-50 border border-red-100 rounded-xl lg:rounded-2xl flex items-start space-x-3">
                                <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] lg:text-xs text-red-700 font-bold">Información médica protegida por RGPD.</p>
                            </div>

                            <div className="space-y-1 lg:space-y-2">
                                <label className="text-[8px] lg:text-[10px] font-black text-red-500 uppercase tracking-widest pl-2 flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" /> Alergias
                                </label>
                                <textarea name="allergies" value={formData.allergies} onChange={handleChange}
                                    placeholder="Ej: Penicilina..." rows={2}
                                    className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-red-50/50 border border-red-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold resize-none outline-none focus:ring-2 focus:ring-red-500/20" />
                            </div>

                            <div className="space-y-1 lg:space-y-2">
                                <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center">
                                    <Heart className="w-3 h-3 mr-1" /> Enfermedades
                                </label>
                                <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange}
                                    placeholder="Ej: Diabetes..." rows={2}
                                    className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold resize-none outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            <div className="space-y-1 lg:space-y-2">
                                <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center">
                                    <Pill className="w-3 h-3 mr-1" /> Medicación
                                </label>
                                <textarea name="medications" value={formData.medications} onChange={handleChange}
                                    placeholder="Ej: Metformina..." rows={2}
                                    className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold resize-none outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center">
                                        <Droplets className="w-3 h-3 mr-1" /> Grupo Sanguíneo
                                    </label>
                                    <select name="bloodType" value={formData.bloodType} onChange={handleChange}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20">
                                        <option value="">No especificado</option>
                                        {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Notas Clínicas</label>
                                <textarea name="clinicalNotes" value={formData.clinicalNotes} onChange={handleChange}
                                    placeholder="Observaciones generales del paciente..." rows={3}
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold resize-none outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                        </>
                    )}

                    {activeSection === 'insurance' && (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center">
                                    <Building className="w-3 h-3 mr-1" /> Compañía Aseguradora
                                </label>
                                <input name="insuranceCompany" value={formData.insuranceCompany} onChange={handleChange}
                                    placeholder="Ej: Sanitas, Adeslas, Mapfre..."
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 flex items-center">
                                    <Shield className="w-3 h-3 mr-1" /> Número de Póliza
                                </label>
                                <input name="insuranceNumber" value={formData.insuranceNumber} onChange={handleChange}
                                    placeholder="Ej: POL-2024-12345"
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl text-center mt-6">
                                <Shield className="w-10 h-10 text-blue-300 mx-auto mb-3" />
                                <p className="text-xs text-blue-600 font-bold">La información del seguro se usa para gestión de cobros y facturación</p>
                            </div>
                        </>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                        <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95">
                            {initialData ? 'Guardar Cambios' : 'Registrar Paciente'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
