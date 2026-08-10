import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Zap, 
  Lock, 
  ShieldCheck, 
  X, 
  Key, 
  Star,
  Award,
  ArrowLeft
} from 'lucide-react';
import { PremiumTier } from '../types';

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: PremiumTier;
  onUpgradeTier: (tier: PremiumTier) => void;
}

export const ProUpgradeModal: React.FC<ProUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onUpgradeTier,
}) => {
  const [activationCode, setActivationCode] = useState('');
  const [message, setMessage] = useState('');

  const handleActivateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (activationCode.trim().toLowerCase() === 'lm-pro' || activationCode.trim().toLowerCase() === 'lm-elite') {
      onUpgradeTier('elite_lm');
      setMessage('🎉 ¡Suscripción Elite LM Activada exitosamente!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1800);
    } else if (activationCode.trim().length > 3) {
      onUpgradeTier('pro');
      setMessage('✨ ¡Plan Pro Activado exitosamente!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1800);
    } else {
      setMessage('⚠️ Código inválido. Prueba con "LM-PRO" o "LM-ELITE".');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-gradient-to-b from-[#0e1128] via-[#080918] to-[#03040a] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.2)] text-left relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/30">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                  Suscripción Especial
                </span>
                {currentTier !== 'free' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    Activo: {currentTier}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-white mt-0.5">
                Planes Pro & Premium - LM AI Engine
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Regresar al Menú Principal"
            >
              <ArrowLeft className="w-4 h-4" />
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

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* Plan Gratuito */}
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Gratuito</span>
              <h3 className="text-lg font-black text-white mt-1">$0 / mes</h3>
              <p className="text-xs text-slate-400 mt-2">Niveles básicos y chat estándar para iniciarse en programación.</p>
              
              <ul className="text-xs space-y-2 text-slate-300 mt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Primeros 15 niveles</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Chat de IA básico</li>
                <li className="flex items-center gap-2 text-slate-500"><Lock className="w-3.5 h-3.5 shrink-0" /> Niveles 16-100 bloqueados</li>
              </ul>
            </div>

            <button
              disabled={currentTier === 'free'}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 text-xs font-bold text-slate-300 disabled:opacity-50"
            >
              {currentTier === 'free' ? 'Plan Actual' : 'Básico'}
            </button>
          </div>

          {/* Plan Pro */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-cyan-950/40 border border-cyan-500/50 flex flex-col justify-between space-y-4 shadow-xl">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase">Suscripción Pro</span>
              <h3 className="text-lg font-black text-white mt-1">$9.99 / mes</h3>
              <p className="text-xs text-cyan-200/80 mt-2">Acceso completo a los 100 niveles y modelos de IA avanzados.</p>

              <ul className="text-xs space-y-2 text-cyan-100 mt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Desbloquea 100 Niveles completos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Modo JARVIS Robot en Vivo</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-cyan-400 shrink-0" /> Modelos Gemini 2.5 Flash / Pro</li>
              </ul>
            </div>

            <button
              onClick={() => {
                onUpgradeTier('pro');
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              {currentTier === 'pro' ? 'Plan Activo' : 'Activar Pro'}
            </button>
          </div>

          {/* Plan Elite LM */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-950/40 to-yellow-950/40 border border-amber-500/60 flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-black uppercase">
              Recomendado
            </div>

            <div>
              <span className="text-xs font-mono font-bold text-amber-300 uppercase">Elite LM Edition</span>
              <h3 className="text-lg font-black text-white mt-1">$19.99 / mes</h3>
              <p className="text-xs text-amber-200/80 mt-2">Experiencia ilimitada respaldada por Luis Miguel Martínez (LM).</p>

              <ul className="text-xs space-y-2 text-amber-100 mt-4">
                <li className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 shrink-0 fill-current" /> Todos los beneficios Pro</li>
                <li className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 shrink-0 fill-current" /> Personalización de logotipo LM</li>
                <li className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-400 shrink-0 fill-current" /> Temas exclusivos & Soporte Prioritario</li>
              </ul>
            </div>

            <button
              onClick={() => {
                onUpgradeTier('elite_lm');
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs shadow-xl shadow-amber-500/30 transition-all cursor-pointer"
            >
              {currentTier === 'elite_lm' ? 'Elite Activo' : 'Activar Elite LM'}
            </button>
          </div>
        </div>

        {/* Quick Instant Activation Key Input */}
        <form onSubmit={handleActivateCode} className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 w-full sm:w-auto">
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <span>¿Tienes un código de licencia?</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder='Ej: "LM-PRO" o "LM-ELITE"'
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              className="bg-black border border-white/10 rounded-xl py-2 px-3 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shrink-0"
            >
              Canjear
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-3 text-center text-xs font-bold text-amber-300 animate-pulse">
            {message}
          </div>
        )}
      </motion.div>
    </div>
  );
};
