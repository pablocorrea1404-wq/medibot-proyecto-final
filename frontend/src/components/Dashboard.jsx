/**
 * COMPONENTE DASHBOARD (Panel Principal) - QUANTUM ELITE EDITION
 * Totalmente optimizado para máxima experiencia visual (Tesla/Apple Style).
 */

import React, { useState, useEffect } from 'react';
import {
    Calendar, Users, Activity, Settings, Zap, Briefcase,
    LayoutDashboard, Tag, DollarSign, Package, BarChart3,
    Search, Menu, X, Moon, Sun, HardDrive, Download, Shield, Split, UserCheck, Heart
} from 'lucide-react';
import { API_BASE_URL } from '../config';

// Optimización con Lazy Loading
const AppointmentCalendar = React.lazy(() => import('./AppointmentCalendar'));
const PatientTable = React.lazy(() => import('./PatientTable'));
const TeamSchedule = React.lazy(() => import('./TeamSchedule'));
const ClinicDashboard = React.lazy(() => import('./ClinicDashboard'));
const ServiceManagement = React.lazy(() => import('./ServiceManagement'));
const BillingDashboard = React.lazy(() => import('./BillingDashboard'));
const StockManagement = React.lazy(() => import('./StockManagement'));
const ClinicSettings = React.lazy(() => import('./ClinicSettings'));
const ReportsPage = React.lazy(() => import('./ReportsPage'));
const PatientHistoryModal = React.lazy(() => import('./PatientHistoryModal'));

import CommandPalette from './CommandPalette';
import NotificationCenter from './NotificationCenter';

const MENU_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { id: 'calendar', label: 'Agenda', icon: <Calendar /> },
    { id: 'patients', label: 'Pacientes', icon: <Users /> },
    { id: 'team', label: 'Equipo', icon: <Briefcase /> },
    { id: 'billing', label: 'Facturación', icon: <DollarSign /> },
    { id: 'stock', label: 'Almacén', icon: <Package /> },
    { id: 'reports', label: 'Informes', icon: <BarChart3 /> },
    { id: 'settings', label: 'Clínica', icon: <Settings /> }
];

const TAB_LABELS = {
    dashboard: 'Monitor de Control',
    calendar: 'Gestión de Tiempos',
    patients: 'Base Biométrica',
    team: 'Recursos Humanos',
    billing: 'Flujo de Caja',
    stock: 'Inventario Crítico',
    reports: 'Analítica de Datos',
    settings: 'Configuración de Núcleo'
};

export default function Dashboard({ onLogout }) {
    const [activeTab, setActiveTabState] = useState(() => localStorage.getItem('medibot_tab') || 'dashboard');
    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        localStorage.setItem('medibot_tab', tab);
    };
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('medibot_dark_mode') === 'true');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    
    // CONTROL DE ACCESO
    const role = localStorage.getItem('medibot_role') || 'admin';

    // ESTADO GLOBAL
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isBooting, setIsBooting] = useState(true);
    const [notification, setNotification] = useState(null);
    const [aiInsight, setAiInsight] = useState("Sincronización cuántica establecida.");

    // MODAL/UI STATES
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [historyPatient, setHistoryPatient] = useState(null);
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

    useEffect(() => {
        // Reducido el tiempo de espera artificial de 2400ms a 800ms
        const timer = setTimeout(() => setIsBooting(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const notify = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchData = async () => {
        try {
            const [pRes, aRes, sRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/patients`, { headers: { 'Accept': 'application/json' } }),
                fetch(`${API_BASE_URL}/api/appointments`, { headers: { 'Accept': 'application/json' } }),
                fetch(`${API_BASE_URL}/api/stock_items`, { headers: { 'Accept': 'application/json' } }).catch(() => ({ json: () => [] }))
            ]);

            const pData = await pRes.json();
            const aData = await aRes.json();
            const sData = await sRes.json();

            setPatients(Array.isArray(pData) ? pData : (pData['member'] || pData['hydra:member'] || []));
            setAppointments(Array.isArray(aData) ? aData : (aData['member'] || aData['hydra:member'] || []));
            setStockItems(Array.isArray(sData) ? sData : (sData['member'] || sData['hydra:member'] || []));
        } catch (err) {
            console.error("Error cargando datos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('medibot_dark_mode', darkMode);
    }, [darkMode]);

    const handleSaveAppointment = (savedApt) => {
        // La cita ya fue guardada por AppointmentCalendar, solo refrescar y notificar
        const patientName = savedApt?.patient?.name || 'el paciente';
        notify(`✅ Cita creada para ${patientName} correctamente.`);
        fetchData();
    };

    const handleAddPatient = async (patientData) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(patientData)
            });
            if (res.ok) {
                const newPatient = await res.json();
                notify("👤 Paciente registrado en el Quantum Grid.");
                fetchData();
                return newPatient;
            }
        } catch (err) {
            notify("❌ Error en el registro biométrico.");
        }
        return null;
    };

    const handleEditPatient = async (id, data) => {
        let cleanId = typeof id === 'string' ? id.split('/').pop() : id;
        try {
            const res = await fetch(`${API_BASE_URL}/api/patients/${cleanId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/merge-patch+json', 'Accept': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                notify("✅ Perfil actualizado correctamente.");
                fetchData();
            }
        } catch (err) {
            notify("❌ Error en la actualización.");
        }
    };

    const handleDeletePatient = async (id) => {
        let cleanId = typeof id === 'string' ? id.split('/').pop() : id;
        if (!window.confirm("¿Seguro que desea eliminar este registro? La acción es irreversible.")) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/patients/${cleanId}`, { method: 'DELETE' });
            if (res.ok) {
                notify("🗑️ Registro purgado del sistema.");
                fetchData();
            } else {
                alert("No se puede eliminar el paciente porque tiene citas, historiales o registros médicos asociados. Debes eliminar sus citas primero para poder borrarlo.");
            }
        } catch (err) {
            alert("❌ Error de conexión al intentar eliminar el paciente.");
        }
    };

    const handleDeleteAppointment = async (id) => {
        let cleanId = typeof id === 'string' ? id.split('/').pop() : id;
        if (!window.confirm("¿Seguro que desea eliminar esta cita?")) return;
        
        // Actualización optimista: lo ocultamos de la vista inmediatamente
        setAppointments(prev => prev.filter(apt => {
            const aptId = typeof apt.id !== 'undefined' ? apt.id : (apt['@id'] ? apt['@id'].split('/').pop() : null);
            return aptId != cleanId;
        }));

        try {
            const res = await fetch(`${API_BASE_URL}/api/appointments/${cleanId}`, { method: 'DELETE' });
            if (res.ok) {
                notify("🗑️ Cita eliminada correctamente.");
                fetchData(); // Sincroniza el resto de datos por debajo
            } else {
                alert("No se pudo eliminar la cita.");
                fetchData(); // Revierte si falló
            }
        } catch (err) {
            alert("❌ Error de conexión al intentar eliminar la cita.");
            fetchData(); // Revierte si falló
        }
    };

    const renderContent = () => {
        const props = {
            patients,
            appointments,
            loading,
            notify,
            onNavigate: setActiveTab,
            onOpenPatientModal: (pid, pName) => {
                setHistoryPatient({ id: pid, name: pName, patient: pName });
                setIsHistoryOpen(true);
            },
            onOpenAppointmentModal: () => { setActiveTab('calendar'); setIsNewAppointmentModalOpen(true); },
            role: role
        };

        return (
            <React.Suspense fallback={
                <div className="flex items-center justify-center p-20 animate-pulse text-blue-500 font-bold uppercase tracking-widest text-[10px]">
                    Sincronizando Módulo...
                </div>
            }>
                {(() => {
                    switch (activeTab) {
                        case 'dashboard': return <ClinicDashboard {...props} />;
                        case 'calendar': return (
                            <AppointmentCalendar
                                {...props}
                                sharedAppointments={appointments}
                                onSaveAppointment={handleSaveAppointment}
                                onAddPatient={handleAddPatient}
                                onDeleteAppointment={handleDeleteAppointment}
                                isNewAptOpen={isNewAppointmentModalOpen}
                                setIsNewAptOpen={setIsNewAppointmentModalOpen}
                            />
                        );
                        case 'patients': return (
                            <PatientTable
                                {...props}
                                onAddPatient={handleAddPatient}
                                onEditPatient={handleEditPatient}
                                onDeletePatient={handleDeletePatient}
                                isNewPatientOpen={isNewPatientModalOpen}
                                setIsNewPatientOpen={setIsNewPatientModalOpen}
                            />
                        );
                        case 'team': return <TeamSchedule notify={notify} />;
                        case 'billing': return <BillingDashboard />;
                        case 'stock': return <StockManagement />;
                        case 'reports': return <ReportsPage />;
                        case 'settings': return <ClinicSettings />;
                        default: return <ClinicDashboard {...props} />;
                    }
                })()}
            </React.Suspense>
        );
    };

    if (isBooting) return <BootLoader />;

    return (
        <div className={`min-h-screen flex transition-all duration-700 ease-in-out font-outfit relative overflow-hidden ${darkMode ? 'dark-mode dark bg-[#020617]' : 'bg-slate-50'}`}>

            {/* Mesh Background Blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[160px] bg-blue-600/20 dark:bg-blue-600/10"></div>
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full blur-[140px] bg-indigo-600/20 dark:bg-indigo-600/10"></div>
                <div className="absolute -bottom-[10%] right-[10%] w-[35%] h-[35%] rounded-full blur-[120px] bg-teal-500/10"></div>
            </div>

            {/* SIDEBAR: NAV CONTROL */}
            <aside className={`fixed h-screen transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)] z-[60] flex flex-col items-center py-8 
                ${isSidebarOpen ? 'w-72' : 'w-20'} 
                ${darkMode ? 'bg-[#020617]/80 backdrop-blur-3xl border-r border-white/5' : 'bg-white/90 backdrop-blur-xl border-r border-slate-100 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.03)]'}`}>

                {/* Logo Section */}
                <div className="mb-14 flex items-center justify-center relative group">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 group-hover:rotate-12 transition-all duration-500 relative z-10">
                        <Zap className="w-7 h-7 text-white fill-white/20" />
                    </div>
                    {isSidebarOpen && (
                        <div className="ml-5 flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
                            <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                                MEDI<span className="text-blue-600 font-black">BOT</span>
                            </h1>
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-1.5 ml-0.5">Quantum Elite</span>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <div className="flex-1 w-full px-4 space-y-3">
                    {MENU_ITEMS.filter(item => {
                        if (role === 'dentist' && (item.id === 'billing' || item.id === 'reports' || item.id === 'settings')) return false;
                        return true;
                    }).map((item) => {
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`relative w-full flex items-center group transition-all duration-500 h-14 rounded-2xl overflow-hidden
                                    ${active
                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl dark:shadow-white/5'
                                        : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    } ${isSidebarOpen ? 'px-6' : 'justify-center'}`}
                            >
                                <div className={`relative z-10 transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {React.cloneElement(item.icon, {
                                        className: `w-5 h-5 ${active ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`
                                    })}
                                </div>

                                {isSidebarOpen && (
                                    <span className="ml-5 text-[11px] font-black uppercase tracking-widest relative z-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                        {item.label}
                                    </span>
                                )}

                                {active && (
                                    <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-500 rounded-full animate-pulse"></div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Theme Toggle & User Info */}
                <div className="mt-auto w-full px-4 pt-10 border-t border-slate-100 dark:border-white/5 flex flex-col items-center">
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`mb-10 p-4 rounded-2xl transition-all duration-500 hover:rotate-12 
                            ${darkMode ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30' : 'bg-slate-900 text-white shadow-xl shadow-slate-900/30'}`}
                    >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <div className={`flex items-center group cursor-pointer transition-all duration-500 p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 mb-4 ${isSidebarOpen ? 'w-full' : ''}`}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center border-2 border-white dark:border-white/10 shadow-lg relative overflow-hidden group-hover:scale-105 transition-all">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-full h-full object-cover" />
                        </div>
                        {isSidebarOpen && (
                            <div className="ml-4 flex-1 animate-in fade-in slide-in-from-left-4 duration-500">
                                <p className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-none">Dr. Correa</p>
                                <div className="flex items-center space-x-1.5 mt-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                                    <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Quantum Pro</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-500 relative z-10 
                ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>

                {/* Global Status Bar */}
                <header className="h-20 px-8 lg:px-12 flex items-center justify-between z-50 sticky top-0 bg-transparent">
                    <div className="flex items-center space-x-8">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl hover:scale-110 active:scale-95 transition-all duration-500 text-slate-500 dark:text-slate-400 border border-white dark:border-white/5 shadow-premium-sm"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden lg:flex flex-col">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">
                                {MENU_ITEMS.find(i => i.id === activeTab)?.label || 'Escritorio'}
                            </h2>
                            <div className="flex items-center mt-1.5 space-x-2">
                                <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">{TAB_LABELS[activeTab]}</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.1em]">Clínica Dental Correa</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-5 lg:space-x-8">
                        <div className="hidden md:flex items-center space-x-6 pr-8 border-r border-slate-200 dark:border-white/5">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase leading-none">{patients.length}</span>
                                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Pacientes</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-blue-600 uppercase leading-none">{appointments.length}</span>
                                <span className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Citas</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <NotificationCenter />
                            <CommandPalette onSelectTab={setActiveTab} />
                            <button
                                onClick={onLogout}
                                className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl border border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-500 shadow-sm"
                            >
                                <Download className="w-5 h-5 rotate-180" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 lg:px-16 py-6 no-scrollbar scroll-smooth">
                    <div className="max-w-[1600px] mx-auto pb-32 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {renderContent()}
                    </div>
                </div>

                {/* Quantum Status Footer */}
                <footer className="fixed bottom-0 left-0 right-0 h-10 z-[100] flex items-center justify-between px-10 pointer-events-none transition-all duration-500">
                    <div className={`${isSidebarOpen ? 'ml-72' : 'ml-20'} flex-1 flex items-center justify-between bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl border-t border-slate-100 dark:border-white/5 px-8 rounded-t-[32px] pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.05)]`}>
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></div>
                                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Sincronización Activa</span>
                            </div>
                            <div className="hidden lg:flex items-center space-x-2 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                <HardDrive className="w-3 h-3" />
                                <span>DB: Docker MariaDB Elite</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em]">Quantum Engine v2.0.4 - 2026</span>
                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                            <div className="flex items-center space-x-2">
                                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase">DR. CORREA - ADMINISTRADOR</span>
                            </div>
                        </div>
                    </div>
                </footer>

            </main>

            {/* MODALS */}
            <ServiceManagement isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} />
            <PatientHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                patient={historyPatient}
                notify={notify}
            />

            {/* Global Notification Toast */}
            {notification && (
                <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl border border-white/10 dark:border-black/5 animate-in slide-in-from-top-12 duration-500 flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification}</span>
                </div>
            )}
        </div>
    );
}

function BootLoader() {
    return (
        <div className="fixed inset-0 bg-[#020617] z-[9999] flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.2)_0%,transparent_70%)] animate-pulse"></div>

            <div className="relative mb-12 group">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-700 to-indigo-700 rounded-[32px] flex items-center justify-center shadow-[0_0_60px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-1000 relative z-10">
                    <Zap className="w-12 h-12 text-white fill-white/20" />
                </div>
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 scale-150 animate-pulse"></div>
            </div>

            <div className="text-center space-y-4 mb-16 relative z-10">
                <h1 className="text-3xl font-black text-white tracking-[0.3em] uppercase leading-none">Medi<span className="text-blue-500">Bot</span></h1>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Quantum Elite Edition 2.1.2</p>
            </div>

            <div className="w-64 space-y-6 relative z-10">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 w-full animate-[boot-progress_2.4s_ease-out_forwards] shadow-[0_0_15px_rgba(37,99,235,1)]"></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Iniciando protocolo de seguridad...</div>
                    <div className="text-[8px] font-black text-blue-900 uppercase tracking-widest animate-[fade-in_0.5s_0.8s_both]">Verificando núcleos de datos biométricos</div>
                    <div className="text-[8px] font-black text-blue-900 uppercase tracking-widest animate-[fade-in_0.5s_1.6s_both]">Sincronizando con MariaDB Elite Stack</div>
                </div>
            </div>

            <style>{`
                @keyframes boot-progress {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(0%); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
