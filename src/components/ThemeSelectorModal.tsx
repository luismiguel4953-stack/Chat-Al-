import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Palette, Check, Sparkles, X, Type, ArrowLeft } from 'lucide-react';
import { AppThemeColor } from '../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppThemeColor;
  onSelectTheme: (theme: AppThemeColor) => void;
  logoText: string;
  onChangeLogoText: (text: string) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  logoText,
  onChangeLogoText,
}) => {
  const themeOptions: { id: AppThemeColor; name: string; gradient: string; previewColor: string; description: string }[] = [
    {
      id: 'cyan',
      name: 'Cyberpunk Cyan (Default LM)',
      gradient: 'from-cyan-500 to-indigo-600',
      previewColor: 'bg-cyan-500',
      description: 'Estilo neón futurista cian y azul profundo.'
    },
    {
      id: 'matrix',
      name: 'Matrix Hacker Neon',
      gradient: 'from-emerald-500 to-green-700',
      previewColor: 'bg-emerald-500',
      description: 'Verde cibernético de terminal de código.'
    },
    {
      id: 'purple',
      name: 'Royal Purple AI',
      gradient: 'from-purple-500 to-indigo-800',
      previewColor: 'bg-purple-500',
      description: 'Elegancia violeta y púrpura de inteligencia artificial.'
    },
    {
      id: 'gold',
      name: 'Solar Gold LM Edition',
      gradient: 'from-amber-500 to-yellow-600',
      previewColor: 'bg-amber-500',
      description: 'Edición dorada de lujo desarrollada por LM.'
    },
    {
      id: 'sunset',
      name: 'Sunset Coral Dev',
      gradient: 'from-rose-500 to-amber-600',
      previewColor: 'bg-rose-500',
      description: 'Colores cálidos de atardecer y energía creativa.'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-gradient-to-b from-[#0a0e26] via-[#050716] to-[#020308] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-left relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Personalización de Tema & Logotipo
              </h3>
              <p className="text-xs text-slate-400">Variedad de colores y marca personalizada</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-1 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Regresar al Menú Principal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Custom Logo Text */}
        <div className="my-5 space-y-2">
          <label className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-cyan-400" />
            <span>Texto / Marca del Logotipo Principal:</span>
          </label>
          <input
            type="text"
            value={logoText}
            onChange={(e) => onChangeLogoText(e.target.value)}
            placeholder="Ej: LM Dev AI"
            className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-3.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Theme Options */}
        <div className="space-y-2.5 my-5">
          <label className="text-xs font-mono font-bold text-slate-300 block mb-2">
            Selecciona una Paleta de Colores:
          </label>

          {themeOptions.map((opt) => (
            <div
              key={opt.id}
              onClick={() => onSelectTheme(opt.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                currentTheme === opt.id
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-black/30 hover:bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${opt.gradient} shadow-md flex items-center justify-center text-white shrink-0`}>
                  {currentTheme === opt.id && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{opt.name}</h4>
                  <p className="text-[11px] text-slate-400">{opt.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 cursor-pointer"
        >
          Guardar Cambios
        </button>
      </motion.div>
    </div>
  );
};
