import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Cpu, Zap, Bot } from 'lucide-react';

interface MascotFigureProps {
  state?: 'thinking' | 'typing' | 'idle' | 'speaking';
  text?: string;
  modelName?: string;
}

export const MascotFigure: React.FC<MascotFigureProps> = ({
  state = 'typing',
  text = 'Escribiendo respuesta...',
  modelName = 'LM Chat AI',
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 my-4 max-w-4xl mx-auto select-none">
      {/* Animated 3D-styled Mascot Figure */}
      <div className="relative group shrink-0">
        {/* Neon Aura Backlight */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 blur-md opacity-70"
        />

        {/* Mascot Body Container */}
        <motion.div
          animate={{
            y: [-3, 3, -3],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border-2 border-[var(--accent-primary)] shadow-[0_0_20px_var(--accent-glow)] flex items-center justify-center overflow-hidden"
        >
          {/* Holographic grid lines inside visor */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:6px_6px]" />

          {/* Animated Eyes / Visor Face */}
          <div className="relative z-10 flex items-center gap-1.5">
            {/* Left Eye */}
            <motion.div
              animate={
                state === 'typing'
                  ? { scaleY: [1, 0.2, 1, 1], scaleX: [1, 1.2, 1, 1] }
                  : { scale: [1, 1.2, 1] }
              }
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.1 }}
              className="w-2.5 h-3 sm:w-3 sm:h-3.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00f0ff]"
            />
            {/* Right Eye */}
            <motion.div
              animate={
                state === 'typing'
                  ? { scaleY: [1, 0.2, 1, 1], scaleX: [1, 1.2, 1, 1] }
                  : { scale: [1, 1.2, 1] }
              }
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.2 }}
              className="w-2.5 h-3 sm:w-3 sm:h-3.5 rounded-full bg-pink-400 shadow-[0_0_10px_#ff007f]"
            />
          </div>

          {/* Floating Antenna Signal Bulb */}
          <motion.div
            animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"
          />

          {/* Animated Typing Keyboard Beam below face */}
          {state === 'typing' && (
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], x: [-6, 6, -6] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute bottom-1.5 w-8 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 rounded-full blur-[0.5px]"
            />
          )}
        </motion.div>
      </div>

      {/* Speech Bubble with Tail pointing to Mascot */}
      <motion.div
        initial={{ opacity: 0, x: -10, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-sm sm:rounded-tl-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md flex items-center gap-3 accent-border"
      >
        {/* Speech Bubble Pointer Tail (Left side pointing to mascot) */}
        <div className="hidden sm:block absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-[var(--bg-card)] filter drop-shadow-[-2px_0_1px_var(--border-subtle)]" />

        {/* Animated Sound/Typing Waves */}
        <div className="flex items-center gap-1 shrink-0">
          <motion.span
            animate={{ height: ['8px', '18px', '8px'] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            className="w-1 bg-[var(--accent-primary)] rounded-full shadow-[0_0_6px_var(--accent-glow)]"
          />
          <motion.span
            animate={{ height: ['14px', '6px', '14px'] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
            className="w-1 bg-[var(--accent-secondary)] rounded-full shadow-[0_0_6px_var(--accent-glow)]"
          />
          <motion.span
            animate={{ height: ['6px', '20px', '6px'] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
            className="w-1 bg-cyan-400 rounded-full shadow-[0_0_6px_#00f0ff]"
          />
        </div>

        {/* Text Details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <Sparkles className="w-3.5 h-3.5 accent-text animate-spin" />
            <span>{modelName}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full accent-bg font-mono">
              {text}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5">
            ⚡ Transmisión neural de alta velocidad
          </span>
        </div>
      </motion.div>
    </div>
  );
};
