import React, { useState } from 'react';
import { Camera, Split, ChevronLeft, ChevronRight, Maximize2, X, Trash2 } from 'lucide-react';

export default function BeforeAfterComparator({ isOpen, onClose, patientName }) {
    const [beforeImg, setBeforeImg] = useState(null);
    const [afterImg, setAfterImg] = useState(null);
    const [sliderPos, setSliderPos] = useState(50);
    const [isComparing, setIsComparing] = useState(false);

    if (!isOpen) return null;

    const handleUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (f) => {
                if (type === 'before') setBeforeImg(f.target.result);
                else setAfterImg(f.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                                <Split className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">Comparador de Evolución</h2>
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{patientName}</p>
                    </div>
                    <button onClick={onClose} className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 rounded-3xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
                    {!isComparing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
                            {/* Slot Antes */}
                            <div className="space-y-4">
                                <h3 className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estado Inicial (Antes)</h3>
                                <div className="relative aspect-video rounded-[32px] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center overflow-hidden hover:border-indigo-500 transition-all group bg-white dark:bg-slate-900 shadow-sm">
                                    {beforeImg ? (
                                        <>
                                            <img src={beforeImg} className="w-full h-full object-cover" alt="Antes" />
                                            <button onClick={() => setBeforeImg(null)} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg"><Trash2 className="w-4 h-4" /></button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center p-10">
                                            <Camera className="w-12 h-12 text-slate-300 mb-4 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Subir Foto Inicial</span>
                                            <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'before')} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Slot Después */}
                            <div className="space-y-4">
                                <h3 className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resultado Final (Después)</h3>
                                <div className="relative aspect-video rounded-[32px] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center overflow-hidden hover:border-emerald-500 transition-all group bg-white dark:bg-slate-900 shadow-sm">
                                    {afterImg ? (
                                        <>
                                            <img src={afterImg} className="w-full h-full object-cover" alt="Después" />
                                            <button onClick={() => setAfterImg(null)} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg"><Trash2 className="w-4 h-4" /></button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer flex flex-col items-center p-10">
                                            <Camera className="w-12 h-12 text-slate-300 mb-4 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Subir Foto Final</span>
                                            <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'after')} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* COMPARADOR SLIDER */
                        <div className="relative w-full aspect-video max-w-4xl rounded-[40px] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 animate-in zoom-in-95 duration-500">
                            {/* Image After (Bottom) */}
                            <img src={afterImg} className="absolute inset-0 w-full h-full object-cover" alt="Después" />

                            {/* Image Before (Top with clip) */}
                            <div
                                className="absolute inset-0 w-full h-full overflow-hidden"
                                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                            >
                                <img src={beforeImg} className="absolute inset-0 w-full h-full object-cover" alt="Antes" />
                            </div>

                            {/* Labels */}
                            <div className="absolute bottom-10 left-10 px-4 py-2 bg-slate-900/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest rounded-full">Antes</div>
                            <div className="absolute bottom-10 right-10 px-4 py-2 bg-emerald-500 drop-shadow-xl text-white text-[10px] font-black uppercase tracking-widest rounded-full">Después</div>

                            {/* Slider Controls */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderPos}
                                onChange={(e) => setSliderPos(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                            />

                            {/* Slider Visual Line */}
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 pointer-events-none"
                                style={{ left: `${sliderPos}%` }}
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center">
                                    <div className="flex gap-1">
                                        <ChevronLeft className="w-4 h-4 text-slate-800" />
                                        <ChevronRight className="w-4 h-4 text-slate-800" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-10 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-6 bg-white dark:bg-slate-900">
                    {!isComparing ? (
                        <button
                            disabled={!beforeImg || !afterImg}
                            onClick={() => setIsComparing(true)}
                            className="px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-4"
                        >
                            <Split className="w-5 h-5" /> Iniciar Comparación Visual
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsComparing(false)}
                            className="px-10 py-5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-4"
                        >
                            <ChevronLeft className="w-5 h-5" /> Cambiar Imágenes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
