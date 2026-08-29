import React, { useState, useEffect } from 'react';
import {
    X, Calendar, FileText, CheckCircle, Clock,
    Image as ImageIcon, User, Phone, Mail,
    ChevronRight, Plus, Info, Activity,
    Eye, Download, Trash2, Camera, ShieldAlert, DollarSign, Pill, Mic, TrendingUp, Split
} from 'lucide-react';
import Odontogram from './Odontogram';
import PrescriptionGenerator from './PrescriptionGenerator';
import BeforeAfterComparator from './BeforeAfterComparator';
import TreatmentPlans from './TreatmentPlans';
import ConsentForms from './ConsentForms';
import PaymentManager from './PaymentManager';
import { API_BASE_URL } from '../config';
import { Skeleton, CardSkeleton } from './Skeleton';

export default function PatientHistoryModal({ isOpen, onClose, patient, notify }) {
    if (!isOpen || !patient) return null;

    const [activeTab, setActiveTab] = useState('summary');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newRecord, setNewRecord] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showAllergyAlert, setShowAllergyAlert] = useState(false);
    const [showOdontogram, setShowOdontogram] = useState(false);
    const [showPlans, setShowPlans] = useState(false);
    const [showConsents, setShowConsents] = useState(false);
    const [showPayments, setShowPayments] = useState(false);
    const [showPrescription, setShowPrescription] = useState(false);
    const [showComparator, setShowComparator] = useState(false);

    const fetchAllData = async () => {
        let id = patient.patientId || patient.id;
        if (typeof id === 'string' && id.includes('/')) id = id.split('/').pop();
        if (!id) return;
        setLoading(true);
        try {
            // Cargar Citas
            const aptRes = await fetch(`${API_BASE_URL}/api/appointments?patient=/api/patients/${id}`, {
                headers: { 'Accept': 'application/json' }
            });
            const aptData = await aptRes.json();

            // Cargar Historial (MedicalRecords)
            const recRes = await fetch(`${API_BASE_URL}/api/medical_records?patient=/api/patients/${id}`, {
                headers: { 'Accept': 'application/json' }
            });
            const recData = await recRes.json();

            // Mapear y combinar con protección de fechas
            const appointments = (Array.isArray(aptData) ? aptData : (aptData['member'] || aptData['hydra:member'] || [])).map(apt => {
                const dateObj = new Date(apt.appointmentDate);
                const isValid = !isNaN(dateObj.getTime());
                return {
                    id: `apt-${apt.id || Math.random()}`,
                    date: isValid ? dateObj : new Date(),
                    dateStr: isValid ? dateObj.toLocaleDateString() : 'Fecha pendiente',
                    type: 'Cita',
                    doctor: apt.staff ? apt.staff.name : 'Personal de Clínica',
                    content: apt.notesIa || apt.notes || 'Revisión general de seguimiento',
                    status: apt.status,
                    isNote: false
                };
            });

            const notes = (Array.isArray(recData) ? recData : (recData['member'] || recData['hydra:member'] || [])).map(rec => {
                const dateObj = new Date(rec.createdAt);
                const isValid = !isNaN(dateObj.getTime());
                return {
                    id: `rec-${rec.id || Math.random()}`,
                    date: isValid ? dateObj : new Date(),
                    dateStr: isValid ? dateObj.toLocaleDateString() : 'Registro reciente',
                    type: 'Tratamiento',
                    doctor: 'Dr. Principal',
                    content: rec.content,
                    imageUrl: rec.imageUrl,
                    status: 'completado',
                    isNote: true
                };
            });

            const combined = [...appointments, ...notes].sort((a, b) => b.date.getTime() - a.date.getTime());
            setHistory(combined);
        } catch (err) {
            console.error("Error cargando historial clínico:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAllData();
            setActiveTab('timeline');
        }
    }, [isOpen, patient]);

    const handleAddNote = async (e) => {
        e.preventDefault();
        if (!newRecord.trim()) return;

        setIsSaving(true);
        try {
            let id = patient.patientId || patient.id;
            if (typeof id === 'string' && id.includes('/')) id = id.split('/').pop();
            const response = await fetch(`${API_BASE_URL}/api/medical_records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    patient: `/api/patients/${id}`,
                    content: newRecord,
                    imageUrl: imageUrl
                })
            });
            if (response.ok) {
                setNewRecord('');
                setImageUrl('');
                fetchAllData();
                setActiveTab('timeline');
            }
        } catch (err) {
            console.error("Error al guardar nota clínica:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Filtrar imágenes para la galería
    const images = history.filter(h => h.imageUrl).map(h => ({
        url: h.imageUrl,
        date: h.date,
        content: h.content
    }));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-500 p-0 md:p-6 overflow-hidden">
            <div className="bg-white dark:bg-[#020617] flex flex-col md:flex-row w-full max-w-7xl h-full md:max-h-[92vh] md:rounded-[48px] shadow-[0_32px_128px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20 dark:border-white/5 scale-100 transform transition-all duration-500">

                {/* SIDEBAR: PATIENT INFO */}
                <div className="w-full md:w-85 bg-slate-50 dark:bg-slate-900/50 border-r border-gray-100 dark:border-white/5 flex flex-col flex-shrink-0 max-h-[40vh] md:max-h-none overflow-y-auto no-scrollbar">
                    {/* BACK BUTTON - always visible */}
                    <div className="px-4 lg:px-6 pt-4 lg:pt-6 shrink-0">
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 w-full justify-center"
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Volver
                        </button>
                    </div>

                    <div className="p-4 lg:p-8 pb-2 lg:pb-4 text-center relative">
                        <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl bg-blue-600 mx-auto mb-3 lg:mb-6 flex items-center justify-center text-white text-2xl lg:text-3xl font-black shadow-xl shadow-blue-200 ring-4 lg:ring-8 ring-blue-50">
                            {(patient.patient || patient.name || '?').charAt(0)}
                        </div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                            {patient.patient || patient.name}
                        </h2>
                        <span className="inline-block mt-1 lg:mt-2 px-3 py-1 bg-slate-100 text-slate-500 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            ID #{(patient.id || patient.patientId || '000').toString().padStart(4, '0')}
                        </span>
                    </div>

                    <div className="px-4 lg:px-8 mt-2 lg:mt-6 grid grid-cols-2 md:grid-cols-1 gap-2 lg:gap-4">
                        <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-white dark:bg-white/5 rounded-xl lg:rounded-2xl border border-slate-100 dark:border-white/5 group shadow-sm">
                            <Phone className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400" />
                            <div className="flex flex-col">
                                <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Tel</span>
                                <span className="text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{patient.phone || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 lg:space-x-4 p-3 lg:p-4 bg-white dark:bg-white/5 rounded-xl lg:rounded-2xl border border-slate-100 dark:border-white/5 group overflow-hidden shadow-sm">
                            <Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-slate-400" />
                            <div className="flex flex-col">
                                <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                                <span className="text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{patient.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div
                            className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl border transition-all cursor-pointer flex items-center justify-between col-span-2 md:col-span-1 ${showAllergyAlert ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
                            onClick={() => setShowAllergyAlert(!showAllergyAlert)}
                        >
                            <div className="flex items-center space-x-3">
                                <ShieldAlert className={`w-4 h-4 lg:w-5 lg:h-5 ${showAllergyAlert ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
                                <span className={`text-[9px] lg:text-xs font-black uppercase tracking-widest ${showAllergyAlert ? 'text-red-700' : 'text-green-700'}`}>
                                    {showAllergyAlert ? 'Alergias Detectadas' : 'Sin Alergias'}
                                </span>
                            </div>
                            <Activity className={`w-3 h-3 lg:w-4 lg:h-4 ${showAllergyAlert ? 'text-red-400' : 'text-green-400'}`} />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 lg:px-8 mt-4 grid grid-cols-2 md:grid-cols-1 gap-2">
                        <button onClick={() => setShowOdontogram(true)}
                            className="w-full py-2.5 lg:py-3 px-3 bg-blue-600 text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center space-x-2">
                            <span>🦷</span> <span>Odonto</span>
                        </button>
                        <button onClick={() => setShowPlans(true)}
                            className="w-full py-2.5 lg:py-3 px-3 bg-slate-900 text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center space-x-2">
                            <DollarSign className="w-3 h-3" /> <span>Presup</span>
                        </button>
                        <button onClick={() => setShowConsents(true)}
                            className="w-full py-2.5 lg:py-3 px-3 bg-amber-500 text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2">
                            <FileText className="w-3 h-3" /> <span>Consent</span>
                        </button>
                        <button onClick={() => setShowPayments(true)}
                            className="w-full py-2.5 lg:py-3 px-3 bg-green-600 text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2">
                            <DollarSign className="w-3 h-3" /> <span>Cobros</span>
                        </button>
                        <button onClick={() => setShowPrescription(true)}
                            className="w-full py-2.5 lg:py-3 px-3 bg-purple-600 text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2">
                            <Pill className="w-3 h-3 lg:w-4 lg:h-4" /> <span>Receta</span>
                        </button>
                        <button onClick={() => setShowComparator(true)}
                            className="w-full py-2.5 lg:py-3 px-3 bg-indigo-600 text-white rounded-xl lg:rounded-2xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2">
                            <Split className="w-3 h-3 lg:w-4 lg:h-4" /> <span>Compa</span>
                        </button>
                    </div>

                    <div className="mt-auto p-8 border-t border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Documentos Recientes</span>
                            <span className="text-[10px] text-blue-500 font-bold">{images.length} archivos</span>
                        </div>
                        <div className="flex -space-x-2">
                            {images.slice(0, 4).map((img, i) => (
                                <div key={i} className="w-10 h-10 rounded-xl border-2 border-white overflow-hidden shadow-sm hover:-translate-y-2 transition-all cursor-pointer">
                                    <img src={img.url} className="w-full h-full object-cover" alt="prev" />
                                </div>
                            ))}
                            {images.length > 4 && (
                                <div className="w-10 h-10 rounded-xl border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                                    +{images.length - 4}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#020617] overflow-hidden">
                    {/* Tabs Header */}
                    <div className="px-4 lg:px-8 pt-4 lg:pt-8 flex justify-between items-end border-b border-gray-100 dark:border-white/5 flex-shrink-0">
                        <div className="flex space-x-4 lg:space-x-8 overflow-x-auto no-scrollbar">
                            <TabButton active={activeTab === 'timeline'} label="Historial" icon={<Clock />} onClick={() => setActiveTab('timeline')} />
                            <TabButton active={activeTab === 'gallery'} label="RX" icon={<Camera />} onClick={() => setActiveTab('gallery')} />
                            <TabButton active={activeTab === 'roadmap'} label="Ruta" icon={<TrendingUp />} onClick={() => setActiveTab('roadmap')} />
                            <TabButton active={activeTab === 'new'} label="Nota" icon={<Plus />} onClick={() => setActiveTab('new')} />
                        </div>
                        <div className="pb-4 hidden md:block">
                            <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 rounded-2xl transition-all active:scale-90">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50 dark:bg-[#020617] transition-all duration-500">
                        {loading ? (
                            <div className="space-y-10">
                                <div className="flex items-center space-x-6">
                                    <Skeleton className="w-16 h-16 rounded-2xl" />
                                    <div className="flex-1 space-y-3">
                                        <Skeleton className="h-6 w-1/3" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Skeleton className="h-64 w-full" />
                                    <Skeleton className="h-64 w-full" />
                                </div>
                                <div className="space-y-6">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
                                </div>
                            </div>
                        ) : activeTab === 'timeline' ? (
                            <div className="max-w-3xl mx-auto space-y-10 py-4">
                                {history.length > 0 ? history.map((record, idx) => (
                                    <div key={record.id} className="relative pl-12">
                                        {/* Connector Line */}
                                        {idx !== history.length - 1 && (
                                            <div className="absolute left-[19px] top-6 bottom-0 w-0.5 bg-slate-100 shadow-inner"></div>
                                        )}
                                        {/* Marker */}
                                        <div className={`absolute left-0 top-0 w-10 h-10 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center transition-all group-hover:scale-110 ${record.isNote ? 'bg-purple-600' : 'bg-blue-600'}`}>
                                            {record.isNote ? <FileText className="w-4 h-4 text-white" /> : <Calendar className="w-4 h-4 text-white" />}
                                        </div>

                                        <div className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-4 lg:p-6 rounded-2xl lg:rounded-[32px] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-white/5 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
                                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2 mb-3 lg:mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <span className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest px-2 lg:px-3 py-1 rounded-full ${record.isNote ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                        {record.type}
                                                    </span>
                                                    <span className="text-[10px] lg:text-xs font-bold text-slate-400 flex items-center">
                                                        <Calendar className="w-3 h-3 mr-1" /> {record.dateStr}
                                                    </span>
                                                </div>
                                                <div className="text-[8px] lg:text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                    Atendido por: {record.doctor}
                                                </div>
                                            </div>

                                            <p className="text-slate-600 leading-relaxed text-sm font-medium whitespace-pre-wrap">
                                                {record.content}
                                            </p>

                                            {record.imageUrl && (
                                                <div className="mt-6 rounded-3xl overflow-hidden border border-slate-100 relative group/img">
                                                    <img src={record.imageUrl} alt="Med" className="w-full h-auto max-h-[300px] object-cover group-hover/img:scale-105 transition-all duration-500" />
                                                    <div className="absolute inset-0 bg-slate-900/0 group-hover/img:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                                        <button
                                                            onClick={() => window.open(record.imageUrl, '_blank')}
                                                            className="bg-white/90 backdrop-blur-sm p-4 rounded-full text-slate-900 shadow-2xl scale-75 group-hover/img:scale-100 transition-all"
                                                        >
                                                            <Eye className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-20 bg-white dark:bg-slate-900/30 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
                                        <Info className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                                        <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-widest">El paciente no tiene registros clínicos previos</p>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'gallery' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {images.length > 0 ? images.map((img, i) => (
                                    <GalleryImage key={i} img={img} />
                                )) : (
                                    <div className="col-span-full py-20 text-center">
                                        <Camera className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                        <h4 className="text-slate-800 font-black tracking-tight text-xl mb-2">Galería Vacía</h4>
                                        <p className="text-slate-400 text-sm font-medium">No se han encontrado archivos multimedia asociados a este paciente.</p>
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'roadmap' ? (
                            <div className="max-w-4xl mx-auto py-10">
                                <TreatmentRoadmap patientName={patient.patient || patient.name} />
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto py-4 lg:py-10">
                                <form onSubmit={handleAddNote} className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl p-6 lg:p-10 rounded-2xl lg:rounded-[48px] shadow-2xl shadow-blue-900/5 border border-white dark:border-white/5 space-y-6 lg:space-y-8">
                                    <div className="space-y-1 text-center mb-2 lg:mb-4">
                                        <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Nueva Nota</h3>
                                        <p className="text-slate-400 dark:text-slate-500 text-[10px] lg:text-sm font-medium">Añada un registro clínico al historial</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col space-y-2 relative">
                                            <div className="flex justify-between items-center px-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalles del Tratamiento</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                                        if (!Recognition) return alert("Tu navegador no soporta dictado por voz.");
                                                        const recognition = new Recognition();
                                                        recognition.lang = 'es-ES';
                                                        recognition.onstart = () => notify("🎙️ Escuchando dictado médico...");
                                                        recognition.onresult = (event) => {
                                                            const transcript = event.results[0][0].transcript;
                                                            setNewRecord(prev => prev + (prev ? ' ' : '') + transcript);
                                                        };
                                                        recognition.start();
                                                    }}
                                                    className="flex items-center gap-2 text-[9px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-all"
                                                >
                                                    <Mic className="w-3 h-3" /> DICTADO POR VOZ
                                                </button>
                                            </div>
                                            <textarea
                                                value={newRecord}
                                                onChange={(e) => setNewRecord(e.target.value)}
                                                placeholder="Describa el diagnóstico, procedimiento o notas de seguimiento..."
                                                className="w-full p-6 text-sm font-medium border border-slate-100 dark:border-white/5 rounded-[32px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none h-40 resize-none bg-slate-50 dark:bg-white/5 dark:text-white transition-all shadow-inner"
                                            />
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Pruebas Diagnósticas / Imagen (URL)</label>
                                            <div className="flex items-center space-x-4 bg-slate-50 dark:bg-white/5 p-4 rounded-[24px] border border-slate-100 dark:border-white/5 group-within:border-blue-200 transition-all shadow-inner">
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-blue-500 shadow-sm">
                                                    <Camera className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={imageUrl}
                                                    onChange={(e) => setImageUrl(e.target.value)}
                                                    placeholder="URL de la imagen, Rx o documento"
                                                    className="flex-1 bg-transparent text-sm font-bold outline-none text-slate-700 dark:text-slate-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            disabled={isSaving || !newRecord.trim()}
                                            className="w-full py-5 bg-blue-600 text-white rounded-[24px] text-sm font-black uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none flex items-center justify-center space-x-3"
                                        >
                                            {isSaving ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <Plus className="w-5 h-5" />
                                                    <span>Guardar en Historial</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Odontogram
                patientId={patient.patientId || patient.id}
                isOpen={showOdontogram}
                onClose={() => setShowOdontogram(false)}
            />

            <TreatmentPlans
                patientId={patient.patientId || patient.id}
                patientName={patient.patient || patient.name}
                isOpen={showPlans}
                onClose={() => setShowPlans(false)}
            />

            <ConsentForms
                patientId={patient.patientId || patient.id}
                patientName={patient.patient || patient.name}
                isOpen={showConsents}
                onClose={() => setShowConsents(false)}
            />

            <PaymentManager
                patientId={patient.patientId || patient.id}
                patientName={patient.patient || patient.name}
                isOpen={showPayments}
                onClose={() => setShowPayments(false)}
            />

            <PrescriptionGenerator
                isOpen={showPrescription}
                onClose={() => setShowPrescription(false)}
                patientName={patient.patient || patient.name}
                patientDni={patient.dni || '---'}
            />

            <BeforeAfterComparator
                isOpen={showComparator}
                onClose={() => setShowComparator(false)}
                patientName={patient.patient || patient.name}
            />
        </div>
    );
}

function TabButton({ active, label, icon, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 pb-4 lg:pb-6 border-b-[3px] lg:border-b-4 px-1 lg:px-2 transition-all group shrink-0 ${active ? 'border-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
            <div className={`p-1.5 lg:p-2 rounded-lg lg:rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg lg:shadow-blue-200' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                {React.cloneElement(icon, { className: "w-3.5 h-3.5 lg:w-4 lg:h-4" })}
            </div>
            <span className={`text-[9px] lg:text-xs font-black uppercase tracking-widest ${active ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>{label}</span>
        </button>
    );
}


function TreatmentRoadmap({ patientName }) {
    const steps = [
        { id: 1, title: 'Diagnóstico Inicial', date: '12 Ene', status: 'completed', desc: 'Escaneo 3D y presupuesto aprobado.' },
        { id: 2, title: 'Saneamiento Oral', date: '20 Ene', status: 'completed', desc: 'Limpieza profunda y obturaciones.' },
        { id: 3, title: 'Fase Quirúrgica', date: 'Hoy', status: 'active', desc: 'Colocación de implantes zona 36, 37.' },
        { id: 4, title: 'Osteointegración', date: 'Marzo', status: 'pending', desc: 'Periodo de espera y cicatrización.' },
        { id: 5, title: 'Carga Protésica', date: 'Abril', status: 'pending', desc: 'Colocación de coronas definitivas.' },
        { id: 6, title: 'Sonrisa Perfecta', date: 'Mayo', status: 'pending', desc: 'Revisión final y alta del tratamiento.' }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-12 shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
                <TrendingUp className="w-48 h-48" />
            </div>
            <div className="relative z-10">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 italic">Ruta del Éxito</h3>
                <p className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-12">Plan Personalizado para {patientName}</p>

                <div className="space-y-12 relative">
                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

                    {steps.map((step, i) => (
                        <div key={step.id} className={`flex items-start gap-8 transition-all ${step.status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-lg ${step.status === 'completed' ? 'bg-green-500 text-white' :
                                step.status === 'active' ? 'bg-blue-600 text-white animate-pulse' :
                                    'bg-white dark:bg-slate-800 text-slate-300 border-2 border-slate-100 dark:border-slate-700'
                                }`}>
                                {step.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <span className="text-xs font-black">{i + 1}</span>}
                            </div>
                            <div className="flex-1 pt-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className={`font-black text-lg ${step.status === 'active' ? 'text-blue-600' : 'text-slate-800 dark:text-white'}`}>{step.title}</h4>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{step.date}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                {step.status === 'active' && (
                                    <div className="mt-4 flex gap-2">
                                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full text-[9px] font-black uppercase">En progreso</span>
                                        <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-full text-[9px] font-black uppercase">Prioridad Alta</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function GalleryImage({ img }) {
    const [filter, setFilter] = useState('none');

    return (
        <div className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 group hover:shadow-xl transition-all h-fit">
            <div className="relative rounded-[24px] overflow-hidden aspect-[4/3] mb-5 bg-slate-900 shadow-inner group-hover:scale-[1.02] transition-all duration-500">
                <img
                    src={img.url}
                    style={{
                        filter: filter === 'invert' ? 'invert(1) grayscale(1) contrast(1.5)' :
                            filter === 'contrast' ? 'contrast(2) brightness(1.2)' :
                                filter === 'grayscale' ? 'grayscale(1)' : 'none'
                    }}
                    className="w-full h-full object-contain transition-all duration-500" alt="rx"
                />

                {/* Lightroom Controls Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex flex-wrap gap-2 justify-center">
                        <FilterButton label="Normal" active={filter === 'none'} onClick={() => setFilter('none')} />
                        <FilterButton label="Rayos X" active={filter === 'invert'} onClick={() => setFilter('invert')} />
                        <FilterButton label="Contraste" active={filter === 'contrast'} onClick={() => setFilter('contrast')} />
                        <FilterButton label="B/N" active={filter === 'grayscale'} onClick={() => setFilter('grayscale')} />
                    </div>
                </div>

                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => window.open(img.url, '_blank')} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white shadow-2xl hover:scale-110 active:scale-95 transition-all">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="px-2">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{img.date instanceof Date && !isNaN(img.date.getTime()) ? img.date.toLocaleDateString() : 'Registro Reciente'}</span>
                    <ImageIcon className="w-3.5 h-3.5 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">{img.content}</p>
            </div>
        </div>
    );
}

function FilterButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md'}`}
        >
            {label}
        </button>
    );
}
