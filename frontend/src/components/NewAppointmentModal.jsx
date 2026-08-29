import React, { useState, useEffect } from 'react';
import { X, Calendar, User, FileText, Stethoscope, Clock, Check, Plus } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function NewAppointmentModal({ isOpen, onClose, onSave, patients = [], onAddPatient, initialData }) {
    const [mode, setMode] = useState('existing'); // 'existing' or 'new'
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState([]);
    const [newPatientData, setNewPatientData] = useState({ name: '', dni: '', email: '', phone: '' });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '',
        type: 'General',
        doctor: 'Dr. Doe',
        notes: '',
        serviceId: ''
    });

    useEffect(() => {
        if (!isOpen) return;
        fetch(`${API_BASE_URL}/api/medical_services`)
            .then(res => res.json())
            .then(data => setServices(Array.isArray(data) ? data : (data['member'] || data['hydra:member'] || [])))
            .catch(err => console.error("Error loading services:", err));
    }, [isOpen]);

    useEffect(() => {
        if (initialData && isOpen) {
            const [day, month, year] = initialData.date.split('/');
            const isoDate = `${year}-${month}-${day}`;
            setFormData({
                date: isoDate,
                time: initialData.time || '',
                type: initialData.type || 'General',
                doctor: initialData.doctor || 'Dr. Doe',
                notes: initialData.notes || '',
                serviceId: initialData.service?.id || initialData.service?.['@id']?.split('/').pop() || ''
            });
            if (initialData.patientId) setSelectedPatientId(initialData.patientId.toString());
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const isValid = mode === 'existing'
        ? selectedPatientId !== ''
        : (newPatientData.name && newPatientData.dni);

    const handleNewPatientChange = (e) => {
        const { name, value } = e.target;
        setNewPatientData(prev => ({ ...prev, [name]: value }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dni.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        let finalPatientId = '';

        if (mode === 'new') {
            const newPatient = await onAddPatient(newPatientData);
            if (!newPatient) return;
            finalPatientId = newPatient.id || newPatient['@id']?.split('/').pop();
        } else {
            finalPatientId = selectedPatientId;
        }

        await onSave({
            ...formData,
            patientId: finalPatientId,
            serviceId: formData.serviceId
        });

        onClose();
        // Reset
        setMode('existing');
        setSelectedPatientId('');
        setNewPatientData({ name: '', dni: '', email: '', phone: '' });
        setFormData({
            date: new Date().toISOString().split('T')[0],
            time: '', type: 'General', doctor: 'Dr. Doe', notes: '', serviceId: ''
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 p-4">
            <div className="bg-white rounded-2xl lg:rounded-[32px] w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-slate-900 px-6 lg:px-8 py-4 lg:py-6 flex justify-between items-center text-white shrink-0">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-widest flex items-center">
                            <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                            {initialData ? 'Editar Cita' : 'Nueva Cita'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X className="w-6 h-6" /></button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 lg:p-8 space-y-4 lg:space-y-6 overflow-y-auto">
                    {/* Segmento Paciente */}
                    <div className="bg-slate-50 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-slate-100">
                        <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 lg:mb-4 block">Paciente</span>
                        {!initialData && (
                            <div className="flex bg-slate-200 p-1.5 rounded-2xl mb-4">
                                <button type="button" onClick={() => setMode('existing')} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${mode === 'existing' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Existente</button>
                                <button type="button" onClick={() => setMode('new')} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all ${mode === 'new' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>+ Nuevo</button>
                            </div>
                        )}

                        {mode === 'existing' ? (
                            <div className="space-y-4 relative">
                                <div className="relative flex gap-2">
                                    <div className="relative flex-1 group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="text"
                                            placeholder="Buscar paciente..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setIsDropdownOpen(true);
                                            }}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 bg-white border border-slate-200 rounded-xl lg:rounded-2xl text-[10px] lg:text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className={`px-4 bg-slate-100 border border-slate-200 rounded-xl lg:rounded-2xl transition-all hover:bg-slate-200 flex items-center justify-center ${isDropdownOpen ? 'rotate-180 bg-blue-50 border-blue-200 text-blue-600' : 'text-slate-500'}`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                    </button>
                                </div>

                                {/* Desplegable de Resultados */}
                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                                        <div className="absolute top-full left-0 right-0 mt-3 max-h-64 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 space-y-1 z-20 animate-in fade-in zoom-in-95 duration-300">
                                            {filteredPatients.length > 0 ? filteredPatients.map(p => (
                                                <button
                                                    key={p.id || p['@id']}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedPatientId(p.id || p['@id']?.split('/').pop());
                                                        setSearchTerm(p.name);
                                                        setIsDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-5 py-3 rounded-xl text-[10px] lg:text-sm font-black transition-all flex items-center justify-between group/item ${selectedPatientId === (p.id || p['@id']?.split('/').pop()) ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-blue-50 text-slate-700'}`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span>{p.name}</span>
                                                        <span className={`text-[8px] uppercase tracking-widest ${selectedPatientId === (p.id || p['@id']?.split('/').pop()) ? 'text-blue-200' : 'text-slate-400'}`}>{p.dni}</span>
                                                    </div>
                                                    {selectedPatientId === (p.id || p['@id']?.split('/').pop()) && <Check className="w-4 h-4" />}
                                                </button>
                                            )) : (
                                                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sin coincidencias</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {selectedPatientId && !isDropdownOpen && !searchTerm.includes(patients.find(p => (p.id || p['@id']?.split('/').pop()) === selectedPatientId)?.name) && (
                                    <div className="p-4 bg-blue-600 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-blue-200 animate-in slide-in-from-top-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-black">
                                                {patients.find(p => (p.id || p['@id']?.split('/').pop()) === selectedPatientId)?.name[0]}
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest">{patients.find(p => (p.id || p['@id']?.split('/').pop()) === selectedPatientId)?.name}</span>
                                        </div>
                                        <button type="button" onClick={() => { setSelectedPatientId(''); setSearchTerm(''); }} className="p-1 hover:bg-white/20 rounded-lg transition-all"><X className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2 lg:space-y-3">
                                <input required type="text" name="name" placeholder="Nombre Completo" value={newPatientData.name} onChange={handleNewPatientChange} className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-white border border-slate-200 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold" />
                                <input required type="text" name="dni" placeholder="DNI / NIE" value={newPatientData.dni} onChange={handleNewPatientChange} className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-white border border-slate-200 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold font-mono" />
                            </div>
                        )}
                    </div>

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                        <div className="space-y-1 lg:space-y-2">
                            <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Fecha</label>
                            <input required type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold" />
                        </div>
                        <div className="space-y-1 lg:space-y-2">
                            <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Hora</label>
                            <input required type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold" />
                        </div>
                    </div>

                    {/* Servicio */}
                    <div className="space-y-1 lg:space-y-2">
                        <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Servicio</label>
                        <select name="serviceId" value={formData.serviceId} onChange={handleChange} className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold appearance-none">
                            <option value="">Selecciona un servicio...</option>
                            {services.map(s => <option key={s.id || s['@id']} value={s.id || s['@id']?.split('/').pop()}>{s.name} - {parseFloat(s.price).toFixed(0)}€</option>)}
                        </select>
                    </div>

                    <div className="space-y-1 lg:space-y-2">
                        <label className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Notas</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Detalles..." className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold h-20 lg:h-24 resize-none" />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
                        <button type="submit" disabled={!isValid} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isValid ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 hover:bg-blue-700' : 'bg-slate-100 text-slate-300'}`}>
                            {initialData ? 'Guardar Cambios' : 'Agendar Cita'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
