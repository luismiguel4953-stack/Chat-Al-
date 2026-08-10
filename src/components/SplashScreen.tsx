import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Iniciando motor LM Chat AI...');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(35);
      setStatusText('Cargando modelos neurales...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(75);
      setStatusText('Sincronizando almacenamiento local...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusText('¡Sistema listo!');
    }, 1400);

    const timerFinish = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timerFinish);
    };
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06060b] text-white select-none px-6"
    >
      {/* Background ambient glow */}
      <div className="absolute w-72 h-72 rounded-full bg-indigo-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute w-60 h-60 rounded-full bg-purple-600/15 blur-[90px] pointer-events-none" />

      {/* Main Logo Box */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative mb-6"
      >
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 shadow-[0_0_50px_rgba(99,102,241,0.5)]">
          <img
            src="/logo.jpg"
            alt="LM Chat AI Logo"
            className="w-full h-full object-cover rounded-[22px] shadow-inner"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Pulsing badge */}
        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl border border-indigo-400/50 shadow-lg flex items-center justify-center">
          <Cpu className="w-4 h-4 animate-pulse" />
        </div>
      </motion.div>

      {/* App Branding */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent mb-1">
          LM CHAT AI
        </h1>
        <p className="text-xs text-indigo-300 font-mono tracking-widest uppercase flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Mobile & Web Engine v4.2</span>
        </p>
      </motion.div>

      {/* Progress Bar & Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-xs space-y-2"
      >
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.8)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="truncate">{statusText}</span>
          <span className="text-indigo-400 font-bold">{progress}%</span>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-[10px] text-slate-500 font-mono flex items-center gap-2">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>Historial Local y Privacidad Garantizada</span>
      </div>
    </motion.div>
  );
};
