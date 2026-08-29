import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, UserPlus, Info, X, Activity, Phone, MessageSquare, Tag } from 'lucide-react';
import NewStaffModal from './NewStaffModal';
import PatientHistoryModal from './PatientHistoryModal';
import { API_BASE_URL } from '../config';

export default function TeamSchedule({ notify }) {
    const [staff, setStaff] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [isNewStaffOpen, setIsNewStaffOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyPatient, setHistoryPatient] = useState(null);

    const formatDate = (date) => {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const fechaSeleccionadaStr = formatDate(selectedDate);
    const fechaHoyStr = formatDate(new Date());

    const goToPrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const goToNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const getDoctorColor = (docName) => {
        if (!docName) return 'blue';
        if (docName.includes('Smith') || docName.includes('Sarah')) return 'indigo';
        if (docName.includes('Doe') || docName.includes('Mike')) return 'teal';
        return 'blue';
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [staffRes, appRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/staff`, { headers: { 'Accept': 'application/json' } }),
                    fetch(`${API_BASE_URL}/api/appointments`, { headers: { 'Accept': 'application/json' } })
                ]);

                let staffData = await staffRes.json();
                staffData = staffData['hydra:member'] || staffData['member'] || staffData;

                setStaff((Array.isArray(staffData) ? staffData : []).map(s => ({
                    id: s.id,
                    name: s.name,
                    specialty: s.specialty,
                    color: getDoctorColor(s.name)
                })));

                let appData = await appRes.json();
                appData = appData['hydra:member'] || appData['member'] || appData;

                setAppointments((Array.isArray(appData) ? appData : []).map(apt => {
                    let dateStr = "N/A";
                    let timeStr = "--:--";
                    if (apt.appointmentDate) {
                        const dateObj = new Date(apt.appointmentDate);
                        dateStr = formatDate(dateObj);
                        timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
                    }
                    return {
                        id: apt.id,
                        staffId: apt.staff ? parseInt(typeof apt.staff === 'object' ? apt.staff.id : apt.staff.split('/').pop()) : null,
                        patientName: apt.patient ? (typeof apt.patient === 'object' ? apt.patient.name : 'Paciente') : 'Desconocido',
                        patientId: apt.patient ? (typeof apt.patient === 'object' ? apt.patient.id : apt.patient.split('/').pop()) : null,
                        patient: apt.patient,
                        time: timeStr,
                        date: dateStr,
                        procedure: apt.notes || 'Consulta General',
                        status: apt.status === 'confirmed' ? 'Completed' : (apt.status === 'cancelled' ? 'Cancelled' : 'Pending')
                    };
                }));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTasks = appointments.filter(apt => {
        const matchesDate = apt.date === fechaSeleccionadaStr;
        const matchesStaff = selectedStaff === 'all' || apt.staffId === parseInt(selectedStaff);
        return matchesDate && matchesStaff;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Control Panel */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-6 lg:p-8 rounded-[40px] shadow-premium-sm border border-slate-100 dark:border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none uppercase">Horarios de Equipo</h2>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Quantum Scheduler</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-2 rounded-3xl border border-slate-100 dark:border-white/5">
                    <button onClick={goToPrevDay} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-blue-600 shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                    <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-6 py-2 text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest hover:text-blue-600 transition-colors"
                    >
                        {fechaSeleccionadaStr === fechaHoyStr ? 'Hoy' : fechaSeleccionadaStr}
                    </button>
                    <button onClick={goToNextDay} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-blue-600 shadow-sm"><ChevronRight className="w-5 h-5" /></button>
                </div>

                <button
                    onClick={() => setIsNewStaffOpen(true)}
                    className="flex items-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                    <UserPlus className="w-4 h-4 mr-3" /> Registrar Profesional
                </button>
            </div>

            {/* Staff Navigation Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <button
                    onClick={() => setSelectedStaff('all')}
                    className={`p-6 rounded-[32px] border transition-all duration-500 flex items-center space-x-4 ${selectedStaff === 'all'
                        ? 'bg-blue-600 border-transparent text-white shadow-2xl shadow-blue-500/30 -translate-y-1'
                        : 'bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-100 dark:border-white/5 text-slate-800 dark:text-white hover:border-blue-300'
                        }`}
                >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${selectedStaff === 'all' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        ALL
                    </div>
                    <div className="text-left">
                        <h3 className="font-black text-xs uppercase tracking-widest leading-none">Equipo</h3>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${selectedStaff === 'all' ? 'text-blue-100' : 'text-slate-400'}`}>Vista Global</p>
                    </div>
                </button>

                {staff.map((member) => (
                    <button
                        key={member.id}
                        onClick={() => setSelectedStaff(member.id)}
                        className={`p-6 rounded-[32px] border transition-all duration-500 flex items-center space-x-4 ${selectedStaff === member.id
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-2xl -translate-y-1'
                            : 'bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-100 dark:border-white/5 text-slate-400 hover:border-blue-300'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase ${selectedStaff === member.id ? (selectedStaff === member.id && !document.documentElement.classList.contains('dark') ? 'bg-white/20' : 'bg-blue-600 text-white') : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="text-left overflow-hidden">
                            <h3 className={`font-black text-xs uppercase tracking-widest leading-none truncate ${selectedStaff === member.id ? 'text-white dark:text-slate-900' : 'text-slate-800 dark:text-white'}`}>{member.name}</h3>
                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1.5 truncate">{member.specialty}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Schedule Board */}
            <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[48px] shadow-premium-lg border border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-center mb-10 pb-10 border-b border-slate-100 dark:border-white/5">
                    <div>
                        <h3 className="text-lg lg:text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                            {selectedStaff === 'all' ? "Agenda General" : `Agenda: ${staff.find(s => s.id === selectedStaff)?.name}`}
                        </h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Lista de Procedimientos</p>
                    </div>
                    <div className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-500/10 px-5 py-2.5 rounded-2xl">
                        <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{filteredTasks.length} Operaciones</span>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center"><div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                ) : filteredTasks.length === 0 ? (
                    <div className="py-32 text-center opacity-20">
                        <Clock className="w-20 h-20 mx-auto mb-6" />
                        <p className="font-black text-xl uppercase tracking-widest">Sin actividad programada</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTasks.map((task) => {
                            const staffMember = staff.find(s => s.id === task.staffId);
                            return (
                                <div
                                    key={task.id}
                                    onClick={() => setSelectedAppointment(task)}
                                    className="group flex flex-col md:flex-row items-center justify-between p-6 lg:p-8 bg-slate-50 dark:bg-white/5 rounded-[40px] hover:bg-slate-900 dark:hover:bg-white hover:translate-x-4 transition-all duration-700 cursor-pointer border border-transparent hover:shadow-2xl"
                                >
                                    <div className="flex items-center space-x-8">
                                        <div className="px-6 py-4 bg-white dark:bg-slate-800 rounded-[28px] shadow-sm group-hover:bg-blue-600 transition-colors">
                                            <span className="text-xl font-black text-blue-600 group-hover:text-white tabular-nums">{task.time}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-slate-800 dark:text-white group-hover:text-white tracking-tight leading-none mb-2">{task.patientName}</h4>
                                            <div className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-100/60">
                                                <Tag className="w-3.5 h-3.5" />
                                                <span>{task.procedure}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-12 mt-6 md:mt-0">
                                        <div className="flex items-center space-x-4 opacity-100 group-hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-slate-800 group-hover:bg-white/20 flex items-center justify-center">
                                                <User className="w-5 h-5 text-blue-600 group-hover:text-white" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white/40">Dr Responsable</span>
                                                <span className="text-xs font-black text-slate-700 dark:text-slate-300 group-hover:text-white uppercase">{staffMember?.name || '---'}</span>
                                            </div>
                                        </div>
                                        <div className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${task.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-green-500/20 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/40' : 'bg-blue-500/10 text-blue-500 border-blue-500/20 group-hover:bg-white/20 group-hover:text-white group-hover:border-white/40'}`}>
                                            {task.status === 'Completed' ? 'Terminado' : 'Pendiente'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Appointment Detail Modal (Visual Overhaul) */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/60 backdrop-blur-2xl p-4 animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-[#020617] rounded-[56px] w-full max-w-2xl shadow-premium-xl border border-white/20 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 lg:p-14">
                            <div className="flex justify-between items-start mb-12">
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl">
                                        {selectedAppointment.patientName[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-3">{selectedAppointment.patientName}</h3>
                                        <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[9px] font-black uppercase tracking-[0.3em] rounded-full border border-blue-100 dark:border-blue-500/20">Registro ID: #{selectedAppointment.id}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedAppointment(null)} className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl hover:rotate-90 transition-all duration-500"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Detalles de Operación</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center text-slate-900 dark:text-white font-bold"><Clock className="w-5 h-5 mr-4 text-blue-600" /> {selectedAppointment.time} - {selectedAppointment.date}</div>
                                        <div className="flex items-center text-slate-900 dark:text-white font-bold"><Activity className="w-5 h-5 mr-4 text-green-500" /> {selectedAppointment.procedure}</div>
                                    </div>
                                </div>
                                <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[40px] border border-slate-100 dark:border-white/5 flex flex-col justify-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Acciones Críticas</p>
                                    <div className="flex items-center space-x-4">
                                        <button onClick={() => window.open(`tel:${selectedAppointment.patient?.phone || ''}`)} className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-all"><Phone className="w-5 h-5" /></button>
                                        <button onClick={() => window.open(`https://wa.me/${selectedAppointment.patient?.phone?.replace(/\D/g, '') || ''}`)} className="p-4 bg-green-500 text-white rounded-2xl shadow-lg hover:scale-110 transition-all"><MessageSquare className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setHistoryPatient({ id: selectedAppointment.patientId, name: selectedAppointment.patientName, patient: selectedAppointment.patientName });
                                        setSelectedAppointment(null);
                                        setIsHistoryOpen(true);
                                    }}
                                    className="flex-1 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
                                >
                                    <Activity className="w-5 h-5" /> Abrir Historial Clínico
                                </button>
                                <button
                                    onClick={() => setSelectedAppointment(null)}
                                    className="px-10 py-6 bg-slate-100 dark:bg-white/5 text-slate-500 font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-slate-200"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <NewStaffModal isOpen={isNewStaffOpen} onClose={() => setIsNewStaffOpen(false)} onSave={async (data) => fetchData()} />
            <PatientHistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} patient={historyPatient} notify={notify} />
        </div>
    );
}
