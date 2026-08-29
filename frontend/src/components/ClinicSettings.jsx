import React, { useState, useEffect } from 'react';
import {
    Settings, Save, RotateCw, Building2, Phone, Mail,
    MapPin, Globe, Clock, Image as ImageIcon, Palette, Check
} from 'lucide-react';

const DEFAULT_CONFIG = {
    clinicName: 'MediBot Dental',
    subtitle: 'Clínica Dental Profesional',
    address: '',
    phone: '',
    email: '',
    website: '',
    cif: '',
    schedule: 'Lunes a Viernes: 9:00 - 20:00',
    logoUrl: '',
    primaryColor: '#2563eb',
    footerText: 'Gracias por confiar en nosotros. Su sonrisa es nuestra prioridad.',
    invoiceNotes: 'Forma de pago: Efectivo, Tarjeta o Transferencia. IVA incluido.'
};

const COLOR_PRESETS = [
    { name: 'Azul Profesional', value: '#2563eb' },
    { name: 'Verde Salud', value: '#059669' },
    { name: 'Índigo Elegante', value: '#4f46e5' },
    { name: 'Cyan Moderno', value: '#0891b2' },
    { name: 'Púrpura Premium', value: '#7c3aed' },
    { name: 'Rosa Coral', value: '#e11d48' }
];

export default function ClinicSettings() {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('medibot_clinic_config');
        if (stored) {
            try { setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) }); } catch (e) { }
        }
    }, []);

    const handleSave = () => {
        setSaving(true);
        setTimeout(() => {
            localStorage.setItem('medibot_clinic_config', JSON.stringify(config));
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }, 600);
    };

    const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Configuración</h2>
                    <p className="text-sm text-slate-400 font-bold mt-1">Personaliza tu clínica dental</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center space-x-2 shadow-lg ${saved
                        ? 'bg-green-600 text-white shadow-green-200'
                        : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
                        } disabled:opacity-50`}>
                    {saving ? <RotateCw className="w-4 h-4 animate-spin" />
                        : saved ? <Check className="w-4 h-4" />
                            : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Guardando...' : saved ? '¡Guardado!' : 'Guardar'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Identity */}
                    <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                            <Building2 className="w-4 h-4 mr-2" /> Identidad de la Clínica
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre de la Clínica *</label>
                                <input value={config.clinicName} onChange={e => update('clinicName', e.target.value)}
                                    placeholder="Ej: Clínica Dental Sonrisa"
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eslogan / Subtítulo</label>
                                <input value={config.subtitle} onChange={e => update('subtitle', e.target.value)}
                                    placeholder="Ej: Tu sonrisa, nuestra pasión"
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CIF / NIF</label>
                                <input value={config.cif} onChange={e => update('cif', e.target.value)}
                                    placeholder="B12345678"
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">URL del Logotipo</label>
                                <input value={config.logoUrl} onChange={e => update('logoUrl', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                            <Phone className="w-4 h-4 mr-2" /> Datos de Contacto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dirección</label>
                                <input value={config.address} onChange={e => update('address', e.target.value)}
                                    placeholder="Calle Mayor 1, 28001 Madrid"
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</label>
                                <input value={config.phone} onChange={e => update('phone', e.target.value)}
                                    placeholder="+34 900 123 456"
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                                <input value={config.email} onChange={e => update('email', e.target.value)}
                                    placeholder="info@clinica.com"
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Página Web</label>
                                <input value={config.website} onChange={e => update('website', e.target.value)}
                                    placeholder="https://www.clinica.com"
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horario</label>
                                <input value={config.schedule} onChange={e => update('schedule', e.target.value)}
                                    placeholder="L-V: 9:00-20:00"
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" />
                            </div>
                        </div>
                    </div>

                    {/* Invoice & Docs */}
                    <div className="bg-white rounded-[28px] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center">
                            <Settings className="w-4 h-4 mr-2" /> Documentos e Impresión
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Texto de pie en presupuestos</label>
                                <textarea value={config.footerText} onChange={e => update('footerText', e.target.value)} rows={2}
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notas de factura</label>
                                <textarea value={config.invoiceNotes} onChange={e => update('invoiceNotes', e.target.value)} rows={2}
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Preview */}
                <div className="space-y-6">
                    {/* Color Theme */}
                    <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                            <Palette className="w-4 h-4 mr-2" /> Color Principal
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                            {COLOR_PRESETS.map(c => (
                                <button key={c.value} onClick={() => update('primaryColor', c.value)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center space-y-1 ${config.primaryColor === c.value
                                        ? 'border-slate-900 scale-105'
                                        : 'border-slate-100 hover:border-slate-200'}`}>
                                    <div className="w-8 h-8 rounded-full shadow-md" style={{ backgroundColor: c.value }}></div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase">{c.name.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Live Preview Card */}
                    <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Vista Previa</h3>
                        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
                            <div className="text-center">
                                {config.logoUrl ? (
                                    <img src={config.logoUrl} alt="Logo" className="h-12 mx-auto mb-3 object-contain" />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-xl font-black shadow-lg" style={{ backgroundColor: config.primaryColor }}>
                                        {config.clinicName?.[0] || 'M'}
                                    </div>
                                )}
                                <h4 className="font-black text-slate-900 text-lg">{config.clinicName || 'Nombre de Clínica'}</h4>
                                <p className="text-xs text-slate-400 font-medium mt-1">{config.subtitle}</p>
                                {config.address && <p className="text-[10px] text-slate-400 mt-3 flex items-center justify-center"><MapPin className="w-3 h-3 mr-1" />{config.address}</p>}
                                {config.phone && <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-center"><Phone className="w-3 h-3 mr-1" />{config.phone}</p>}
                                {config.email && <p className="text-[10px] text-slate-400 mt-1 flex items-center justify-center"><Mail className="w-3 h-3 mr-1" />{config.email}</p>}
                            </div>
                            <hr className="my-4 border-slate-100" />
                            <p className="text-[9px] text-slate-400 text-center font-medium">{config.footerText}</p>
                        </div>
                        <p className="text-[9px] text-slate-300 text-center mt-3 font-bold">Así aparecerá en presupuestos e informes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
