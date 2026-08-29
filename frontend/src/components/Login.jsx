import React, { useState, useEffect } from 'react';
import { Zap, Mail, Lock, LogIn, ShieldCheck, Activity, Users, Calendar, Heart, ShieldAlert, Cpu } from 'lucide-react';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [animStep, setAnimStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setAnimStep(s => (s + 1) % 4), 4000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        { icon: <Cpu className="w-5 h-5" />, title: 'Inteligencia Predictiva', desc: 'Análisis de flujo de pacientes y stock crítico' },
        { icon: <Activity className="w-5 h-5" />, title: 'Mapa Clínico Quantum', desc: 'Odontograma dinámico con renderizado de alta precisión' },
        { icon: <ShieldCheck className="w-5 h-5" />, title: 'Seguridad de Grado Militar', desc: 'Encriptación AES-256 para todo el historial médico' },
        { icon: <Calendar className="w-5 h-5" />, title: 'Ecosistema Conectado', desc: 'Sincronización total entre equipo y dispositivos' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        setTimeout(() => {
            if (email === 'admin@medibot.com' && password === 'admin123') {
                localStorage.setItem('medibot_token', 'mock_token');
                localStorage.setItem('medibot_role', 'admin');
                onLogin();
            } else if (email === 'dentista@medibot.com' && password === 'dentista123') {
                localStorage.setItem('medibot_token', 'mock_token');
                localStorage.setItem('medibot_role', 'dentist');
                onLogin();
            } else {
                setError('Acceso Denegado. Verifique sus credenciales.');
            }
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#020617] flex font-outfit relative overflow-hidden">

            {/* Quantum Background Engine */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[160px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                {/* Dynamic Particles simulation using CSS */}
                <div className="absolute inset-0 opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#020617_80%)]"></div>
            </div>

            {/* LEFT — Brand & Showcase */}
            <div className="hidden lg:flex flex-1 flex-col justify-center px-20 xl:px-32 relative z-10">
                <div className="max-w-xl">
                    <div className="flex items-center space-x-5 mb-12 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[24px] flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)] group-hover:rotate-12 transition-all duration-700">
                            <Zap className="w-9 h-9 text-white fill-white/20" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-white leading-none">MEDI<span className="text-blue-500">BOT</span></h1>
                            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em] mt-2">Quantum Elite Edition</p>
                        </div>
                    </div>

                    <h2 className="text-5xl xl:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-8">
                        Elevando la <br />
                        <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            Gestión Dental.
                        </span>
                    </h2>

                    <p className="text-slate-400 text-xl font-medium leading-relaxed mb-16 max-w-lg">
                        Experimente el futuro del software clínico. Una suite diseñada para la perfección operativa, estética y funcional.
                    </p>

                    {/* Features Liquid List */}
                    <div className="space-y-6">
                        {features.map((f, i) => (
                            <div key={i}
                                className={`flex items-center space-x-6 p-6 rounded-[32px] transition-all duration-1000 ${i === animStep
                                    ? 'bg-white/5 border border-white/10 scale-105 shadow-2xl'
                                    : 'opacity-40 grayscale blur-[1px]'
                                    }`}>
                                <div className={`p-4 rounded-2xl transition-all duration-1000 ${i === animStep ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                                    {f.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-black text-sm uppercase tracking-widest transition-colors duration-1000 ${i === animStep ? 'text-white' : 'text-slate-500'}`}>{f.title}</h3>
                                    <p className={`text-xs font-bold mt-1 transition-colors duration-1000 ${i === animStep ? 'text-blue-400' : 'text-slate-700'}`}>{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 pt-16 border-t border-white/5 flex items-center space-x-8">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} className="w-12 h-12 rounded-full border-4 border-[#020617] bg-slate-800" alt="user" />
                            ))}
                        </div>
                        <p className="text-slate-500 text-sm font-black uppercase tracking-widest leading-snug">
                            Liderando la transformación <br />
                            en <span className="text-white">500+ Clínicas Elite</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* RIGHT — Quantum Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-24 relative z-10">
                <div className="w-full max-w-lg animate-in fade-in slide-in-from-right-12 duration-1000">
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[56px] overflow-hidden shadow-[0_64px_128px_rgba(0,0,0,0.6)] relative">
                        {/* Decorative scan line */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 animate-[scan_3s_linear_infinite]"></div>

                        <div className="p-12 lg:p-16">
                            <div className="mb-12">
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-4">Acceso Seguro</h2>
                                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">Identificación Biométrica Digital</p>
                            </div>

                            {error && (
                                <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-xs font-black uppercase tracking-widest flex items-center animate-in zoom-in-95 duration-500">
                                    <ShieldAlert className="w-5 h-5 mr-4 flex-shrink-0" /> {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Email del Profesional</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-all" />
                                        <input
                                            required type="email" placeholder="admin@medibot.com"
                                            value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Código de Acceso</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-blue-500 transition-all" />
                                        <input
                                            required type="password" placeholder="••••••••"
                                            value={password} onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white placeholder:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/40 transition-all text-sm font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <label className="flex items-center space-x-3 cursor-pointer group">
                                        <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                                            <div className="w-2 h-2 rounded bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <span className="group-hover:text-slate-300">Mantener sesión</span>
                                    </label>
                                    <button type="button" className="text-blue-500 hover:text-white transition-colors">Recuperar Acceso</button>
                                </div>

                                <button
                                    disabled={loading}
                                    className="group relative w-full py-6 bg-white text-slate-950 font-black rounded-3xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] text-xs uppercase tracking-[0.3em] disabled:opacity-70 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative flex items-center justify-center space-x-3 group-hover:text-white transition-colors font-black">
                                        {loading ? (
                                            <div className="w-5 h-5 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <LogIn className="w-5 h-5" />
                                                <span>Iniciar Sincronización</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            </form>
                        </div>

                        <div className="p-10 bg-black/40 border-t border-white/5 text-center">
                            <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-blue-900" /> Quantum Verified System · SSL Core · AES 256
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-12 animate-pulse">
                        <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.6em]">
                            System Status: Optimal · Engine 2.0.6
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { transform: scaleX(0); opacity: 0; }
                    50% { transform: scaleX(1); opacity: 1; }
                    100% { transform: scaleX(0); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
