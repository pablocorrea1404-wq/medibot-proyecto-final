import React, { useState } from 'react';
import { User, Phone, Mail, FileText, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function PatientSelfRegister() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        dni: '',
        phone: '',
        email: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/patients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.name} ${formData.surname}`,
                    dni: formData.dni,
                    phone: formData.phone,
                    email: formData.email,
                    notes: `AUTOREGISTRO QR: ${formData.notes}`
                })
            });

            if (res.ok) {
                setStep(3);
            } else {
                alert("Hubo un error en el registro. Por favor, avise en recepción.");
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    if (step === 3) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-12 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-green-500 rounded-[32px] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-green-200">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-4 uppercase tracking-tight">¡Registro Completado!</h2>
                    <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                        Tus datos han sido enviados correctamente al sistema de la clínica. Ya puedes avisar en el mostrador.
                    </p>
                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                        <Zap className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-black text-blue-700 uppercase tracking-widest">MediBot Intelligent Registration</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-6 font-sans">
            <div className="max-w-lg mx-auto w-full pt-10 pb-20">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Zap className="w-6 h-6 text-white fill-current" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none uppercase">Bienvenido a MediBot</h1>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Portal de Autoregistro</p>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100">
                    <div className="p-1 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="p-10">
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Datos del Paciente</h2>
                        <p className="text-sm font-bold text-slate-400 mb-8 uppercase tracking-widest">Por favor, rellena el formulario para tu ficha clínica</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nombre</label>
                                    <input required type="text" placeholder="Ej: Juan"
                                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Apellidos</label>
                                    <input required type="text" placeholder="Ej: Pérez"
                                        className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all"
                                        value={formData.surname} onChange={e => setFormData({ ...formData, surname: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">DNI / NIE / Pasaporte</label>
                                <input required type="text" placeholder="Ej: 12345678X"
                                    className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all"
                                    value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Teléfono de Contacto</label>
                                <input required type="tel" placeholder="Ej: 600 000 000"
                                    className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all"
                                    value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Email (Opcional)</label>
                                <input type="email" placeholder="Ej: juan@email.com"
                                    className="w-full bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold transition-all"
                                    value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>

                            <div className="pt-6">
                                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl mb-8">
                                    <input required type="checkbox" className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                                        He leído y acepto la política de privacidad y protección de datos (RGPD) de la clínica MediBot.
                                    </p>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="w-full py-5 bg-blue-600 text-white rounded-[32px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50">
                                    {loading ? 'Procesando...' : 'Finalizar Registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /><span>Datos Cifrados</span></div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <div>© 2026 MediBot PRO</div>
                </div>
            </div>
        </div>
    );
}
