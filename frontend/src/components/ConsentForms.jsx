import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Check, Clock, Plus, AlertTriangle, PenTool, RotateCw, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';

const CONSENT_TYPES = [
    {
        value: 'general', label: 'Consentimiento General',
        content: 'Autorizo al equipo médico de esta clínica dental a realizar las exploraciones, pruebas diagnósticas y tratamientos que consideren necesarios para mi atención dental. He sido informado/a de los riesgos generales de los procedimientos odontológicos, incluyendo pero no limitado a: dolor, inflamación, infección, sangrado, reacciones alérgicas a materiales o anestésicos, y daño temporal o permanente a nervios o tejidos adyacentes.'
    },
    {
        value: 'extraction', label: 'Extracción Dental',
        content: 'Autorizo la extracción de la/las piezas dentales indicadas. He sido informado/a de los riesgos específicos: sangrado prolongado, infección post-operatoria, lesión de nervios (con posible pérdida temporal o permanente de sensibilidad en labios, lengua o mentón), fractura de hueso alveolar, comunicación orosinusal, y necesidad de tratamiento adicional.'
    },
    {
        value: 'endodontics', label: 'Endodoncia',
        content: 'Autorizo el tratamiento de conductos (endodoncia) de la pieza dental indicada. He sido informado/a de los riesgos: posible fractura del instrumento dentro del conducto, perforación radicular, dolor post-operatorio, necesidad de retratamiento, y posibilidad de que el diente requiera extracción posterior.'
    },
    {
        value: 'implant', label: 'Implante Dental',
        content: 'Autorizo la colocación de implante/s dental/es. He sido informado/a de los riesgos: rechazo del implante, infección, lesión nerviosa, sinusitis, fracaso de la osteointegración, necesidad de injerto óseo adicional, y posible necesidad de retirar el implante.'
    },
    {
        value: 'orthodontics', label: 'Ortodoncia',
        content: 'Autorizo el tratamiento de ortodoncia. He sido informado/a de los riesgos: reabsorción radicular, descalcificación del esmalte, recesión gingival, dolor y molestias temporales, movimiento dental no deseado, recidiva post-tratamiento, y necesidad de uso de retenedores permanentes.'
    },
    {
        value: 'surgery', label: 'Cirugía Oral',
        content: 'Autorizo el procedimiento quirúrgico oral descrito. He sido informado/a de los riesgos: sangrado, infección, dolor, inflamación, daño a estructuras adyacentes (nervios, dientes, senos maxilares), necesidad de anestesia general o sedación, y posibles complicaciones post-operatorias.'
    },
    {
        value: 'whitening', label: 'Blanqueamiento Dental',
        content: 'Autorizo el tratamiento de blanqueamiento dental. He sido informado/a de los riesgos: sensibilidad dental temporal o prolongada, irritación gingival, resultados variables, necesidad de múltiples sesiones, y que el resultado puede no ser permanente.'
    }
];

export default function ConsentForms({ patientId, patientName, isOpen, onClose }) {
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedConsent, setSelectedConsent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [selectedType, setSelectedType] = useState('general');
    const [isSigningMode, setIsSigningMode] = useState(false);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (isOpen && patientId) fetchConsents();
    }, [isOpen, patientId]);

    const fetchConsents = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/consent_forms?patient=/api/patients/${patientId}`, {
                headers: { 'Accept': 'application/json' }
            });
            const data = await res.json();
            setConsents(Array.isArray(data) ? data : (data['member'] || data['hydra:member'] || []));
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCreate = async () => {
        const type = CONSENT_TYPES.find(t => t.value === selectedType);
        if (!type) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/consent_forms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    patient: `/api/patients/${patientId}`,
                    type: type.value,
                    title: type.label,
                    content: type.content,
                    status: 'pending'
                })
            });
            if (res.ok) {
                setIsCreating(false);
                fetchConsents();
            }
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    // Signature canvas handling
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#1e293b';
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleSign = async () => {
        if (!selectedConsent || !canvasRef.current) return;
        const signatureData = canvasRef.current.toDataURL('image/png');
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/consent_forms/${selectedConsent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/merge-patch+json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    status: 'signed',
                    signatureData: signatureData,
                    signedAt: new Date().toISOString()
                })
            });
            if (res.ok) {
                setIsSigningMode(false);
                setSelectedConsent(null);
                fetchConsents();
            }
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-0 md:p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl h-full md:h-auto md:max-h-[92vh] md:rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col">
                <div className="bg-slate-900 px-6 lg:px-8 py-4 lg:py-5 flex justify-between items-center text-white flex-shrink-0">
                    <div>
                        <h2 className="text-lg lg:text-xl font-black tracking-tight">Consentimientos</h2>
                        <p className="text-slate-400 text-[10px] lg:text-xs font-bold mt-0.5 lg:mt-1 font-mono uppercase tracking-widest">{patientName}</p>
                    </div>
                    <div className="flex items-center space-x-2 lg:space-x-3">
                        <button onClick={() => { setIsCreating(true); setSelectedConsent(null); setIsSigningMode(false); }}
                            className="px-3 py-1.5 lg:px-5 lg:py-2.5 bg-blue-600 text-white rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center space-x-2">
                            <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Nuevo</span>
                        </button>
                        <button onClick={onClose} className="p-2 lg:p-3 hover:bg-white/10 rounded-xl lg:rounded-2xl transition-all">
                            <X className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50">
                    {isCreating ? (
                        <div className="bg-white rounded-2xl lg:rounded-[32px] p-4 lg:p-8 shadow-sm border border-gray-100">
                            <h3 className="text-base lg:text-lg font-black text-slate-800 mb-4 lg:mb-6 flex items-center">
                                <FileText className="w-5 h-5 mr-3 text-blue-600" /> Generar
                            </h3>

                            <div className="mb-4 lg:mb-6">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
                                <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
                                    className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl text-xs lg:text-sm font-bold outline-none">
                                    {CONSENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>

                            <div className="p-4 lg:p-6 bg-slate-50 rounded-xl lg:rounded-2xl border border-slate-100 mb-4 lg:mb-6">
                                <p className="text-xs lg:text-sm text-slate-600 font-medium leading-relaxed max-h-40 overflow-y-auto">
                                    {CONSENT_TYPES.find(t => t.value === selectedType)?.content}
                                </p>
                            </div>

                            <div className="p-3 lg:p-4 bg-amber-50 border border-amber-100 rounded-xl lg:rounded-2xl mb-4 lg:mb-6 flex items-start space-x-3">
                                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] lg:text-xs text-amber-700 font-bold">Estado "Pendiente de firma". Requiere firma digital.</p>
                            </div>

                            <div className="flex gap-3 lg:gap-4">
                                <button onClick={() => setIsCreating(false)} className="flex-1 py-3 lg:py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancelar</button>
                                <button onClick={handleCreate} disabled={saving}
                                    className="flex-1 py-3 lg:py-4 bg-blue-600 text-white rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2">
                                    {saving ? <RotateCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                    <span>{saving ? 'Generando...' : 'Generar'}</span>
                                </button>
                            </div>
                        </div>
                    ) : isSigningMode && selectedConsent ? (
                        <div className="bg-white rounded-2xl lg:rounded-[32px] p-4 lg:p-8 shadow-sm border border-gray-100">
                            <button onClick={() => setIsSigningMode(false)} className="text-[10px] font-black text-blue-600 mb-4 lg:mb-6 hover:text-blue-700">← VOLVER</button>
                            <h3 className="text-lg lg:text-xl font-black text-slate-900 mb-1 lg:mb-2">{selectedConsent.title}</h3>
                            <p className="text-xs lg:text-sm text-slate-600 font-medium leading-relaxed mb-4 lg:mb-6 p-3 lg:p-4 bg-slate-50 rounded-xl lg:rounded-2xl max-h-32 lg:max-h-40 overflow-y-auto">
                                {selectedConsent.content}
                            </p>

                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                                        <PenTool className="w-3 h-3 mr-1" /> Firma
                                    </label>
                                    <button onClick={clearCanvas} className="text-[10px] font-bold text-red-500 hover:text-red-700">BORRAR</button>
                                </div>
                                <div className="border border-dashed border-slate-200 rounded-xl lg:rounded-2xl overflow-hidden bg-white">
                                    <canvas
                                        ref={canvasRef}
                                        width={600}
                                        height={180}
                                        className="w-full h-32 lg:h-auto cursor-crosshair touch-none"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                </div>
                            </div>

                            <button onClick={handleSign} disabled={saving}
                                className="w-full py-4 bg-green-600 text-white rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center space-x-2">
                                {saving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                <span>{saving ? 'Firmando...' : 'Firmar Consentimiento'}</span>
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center justify-center h-40"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>
                    ) : consents.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200">
                            <div className="text-5xl mb-4">📋</div>
                            <h4 className="font-black text-slate-400 uppercase tracking-widest text-sm">Sin consentimientos</h4>
                            <p className="text-slate-300 text-sm mt-2 font-medium">Genera el primer consentimiento informado</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                            {consents.map(consent => (
                                <div key={consent.id}
                                    className="bg-white p-4 lg:p-6 rounded-xl lg:rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                    <div className="flex items-center justify-between gap-2">
                                        <div>
                                            <h4 className="font-black text-slate-900 text-sm lg:text-lg leading-tight">{consent.title}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1">
                                                {new Date(consent.createdAt).toLocaleDateString('es-ES')}
                                                {consent.signedAt && ` — OK: ${new Date(consent.signedAt).toLocaleDateString('es-ES')}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            {consent.status === 'pending' ? (
                                                <button onClick={() => { setSelectedConsent(consent); setIsSigningMode(true); }}
                                                    className="px-4 py-2 bg-amber-100 text-amber-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-200 transition-all flex items-center space-x-2">
                                                    <PenTool className="w-3 h-3" /> <span>Firmar</span>
                                                </button>
                                            ) : (
                                                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-2">
                                                    <Check className="w-3 h-3" /> <span>Firmado</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {consent.signatureData && consent.status === 'signed' && (
                                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <img src={consent.signatureData} alt="Firma" className="h-12 mx-auto opacity-70" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
