import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Trophy, 
  Bot, 
  Palette, 
  Crown, 
  Sparkles,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';

interface AppTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDevGame?: () => void;
  onOpenJarvisLive?: () => void;
}

export const AppTutorialModal: React.FC<AppTutorialModalProps> = ({
  isOpen,
  onClose,
  onOpenDevGame,
  onOpenJarvisLive,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Bienvenido a la IA para Aprender a Programar',
      subtitle: 'Desarrollado por Luis Miguel Martínez (LM)',
      icon: Sparkles,
      color: 'from-cyan-500 to-indigo-600',
      description: 'Esta plataforma está diseñada con Inteligencia Artificial avanzada para enseñarte programación desde cero hasta arquitecturas avanzadas.',
      bullets: [
        'Chat interactivo de programación con IA en tiempo real',
        'Generación de explicaciones y depuración instantánea de código',
        'Historial de conversaciones y grabaciones de audio'
      ]
    },
    {
      title: 'Modo Juego de 100 Niveles (Bloqueo Progresivo)',
      subtitle: 'Aprende paso a paso con desafíos prácticos',
      icon: Trophy,
      color: 'from-amber-500 to-yellow-600',
      description: 'Accede al mapa interactivo de 100 niveles. Cada nivel superado desbloquea el siguiente paso y suma XP a tu perfil.',
      bullets: [
        'Niveles 1-15: HTML, CSS y Lógica JavaScript',
        'Niveles 16-50: React UI, Algoritmos y Proyectos',
        'Niveles 51-100: Python, Inteligencia Artificial y Full-Stack'
      ]
    },
    {
      title: 'Modo JARVIS Vivo: "Escuche nuestra voz, hable con nosotros"',
      subtitle: 'Robot de voz animado y micro-código en tiempo real',
      icon: Bot,
      color: 'from-purple-500 to-cyan-500',
      description: 'Interactúa vocalmente con la IA. El robot JARVIS reacciona a tu voz y programa pequeñas piezas de código mientras conversa.',
      bullets: [
        'Reconocimiento de voz directo desde tu micrófono',
        'Síntesis vocal fluida en español',
        'Generación de código en directo en la pantalla del robot'
      ]
    },
    {
      title: 'Personalización de Temas & Sistema Pro/Premium',
      subtitle: 'Personaliza tu entorno y desbloquea el máximo potencial',
      icon: Palette,
      color: 'from-emerald-500 to-teal-600',
      description: 'Cambia la paleta de colores (Cyberpunk, Matrix, Morado, Dorado LM) y suscríbete al Plan Pro o Elite para acceso sin límites.',
      bullets: [
        'Personalización de colores y logotipo LM',
        'Informes automáticos de llamadas e historial de voz',
        'Planes Pro y Elite LM con licencias especiales'
      ]
    }
  ];

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-gradient-to-b from-[#0a0e26] via-[#050716] to-[#020308] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] text-left relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <BookOpen className="w-4 h-4" />
            <span>TUTORIAL DE LA PLATAFORMA ({currentStep + 1}/{steps.length})</span>
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

        {/* Step Body */}
        <div className="my-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <step.icon className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Paso #{currentStep + 1}
              </span>
              <h3 className="text-lg font-extrabold text-white leading-tight">
                {step.title}
              </h3>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">
                {step.subtitle}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-black/40 p-4 rounded-2xl border border-white/5">
            {step.description}
          </p>

          <div className="space-y-2">
            {step.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-cyan-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
              className="py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                if (onOpenDevGame) onOpenDevGame();
              }}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              <span>¡Comenzar a Programar!</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
