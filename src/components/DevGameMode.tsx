import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Lock, 
  CheckCircle2, 
  Play, 
  Code, 
  Sparkles, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw, 
  X, 
  Award, 
  Flame, 
  Terminal, 
  Zap, 
  Crown,
  BookOpen,
  UserCheck,
  ArrowLeft
} from 'lucide-react';
import { DevLevel, UserGameProgress } from '../types';
import { GENERATED_100_LEVELS } from '../data/devLevelsData';

interface DevGameModeProps {
  isOpen: boolean;
  onClose: () => void;
  userProgress: UserGameProgress;
  onUpdateProgress: (newProgress: UserGameProgress) => void;
  isProUser: boolean;
  onOpenProModal: () => void;
}

export const DevGameMode: React.FC<DevGameModeProps> = ({
  isOpen,
  onClose,
  userProgress,
  onUpdateProgress,
  isProUser,
  onOpenProModal,
}) => {
  const [showWelcomeTutorial, setShowWelcomeTutorial] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<DevLevel | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAiHelp, setLoadingAiHelp] = useState(false);

  // Request AI Tutor explanation for current level/code
  const handleAskAiHelp = async () => {
    if (!selectedLevel) return;
    setLoadingAiHelp(true);
    setAiExplanation(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Estoy resolviendo el reto de programación #${selectedLevel.id} (${selectedLevel.title}): "${selectedLevel.task}".
Código actual:
\`\`\`javascript
${code}
\`\`\`
Por favor explícame paso a paso cómo resolver este reto, la lógica requerida y qué modificar sin dar solo la respuesta directa.`
            }
          ],
          systemInstruction: 'Eres un tutor amigable de programación que explica conceptos de forma clara y didáctica.',
        })
      });
      const data = await res.json();
      if (data.text) {
        setAiExplanation(data.text);
      } else {
        setAiExplanation(`💡 **Guía de IA:**\n\n1. Revisa la definición del reto: "${selectedLevel.task}".\n2. Asegúrate de retornar exactamente: \`${selectedLevel.expectedOutputOrTest}\`.\n3. Revisa la sintaxis de las funciones en JavaScript.`);
      }
    } catch (e) {
      setAiExplanation(`💡 **Guía Rápida:** Observa el resultado esperado (${selectedLevel.expectedOutputOrTest}) e impleméntalo en la función.`);
    } finally {
      setLoadingAiHelp(false);
    }
  };

  // When selecting a level, load its template
  const handleSelectLevel = (level: DevLevel) => {
    if (level.id > userProgress.maxUnlockedLevel && (!isProUser || level.id > userProgress.maxUnlockedLevel + 5)) {
      onOpenProModal();
      return;
    }

    if (level.isProRequired && !isProUser) {
      onOpenProModal();
      return;
    }

    setSelectedLevel(level);
    setCode(level.codeTemplate);
    setOutput('');
    setIsSuccess(null);
    setShowHint(false);
  };

  // Run user code safely inside a evaluation context
  const handleRunCode = () => {
    if (!selectedLevel) return;
    try {
      // Evaluate JavaScript function in a isolated function
      const runUserFn = new Function(`
        ${code}
        try {
          if (typeof saludar === 'function') return saludar();
          if (typeof obtenerNombre === 'function') return obtenerNombre();
          if (typeof sumarValores === 'function') return sumarValores(15, 25);
          if (typeof verificarVelocidad === 'function') return verificarVelocidad(120);
          if (typeof agregarLenguaje === 'function') return agregarLenguaje();
          
          // Generic function call search
          const fnName = "retoNivel" + ${selectedLevel.id};
          if (typeof window[fnName] === 'function') return window[fnName]();
          
          // Evaluate return of code
          return String(eval(code));
        } catch(e) {
          return e.message;
        }
      `);

      const result = String(runUserFn());
      setOutput(result);

      const expected = selectedLevel.expectedOutputOrTest;
      const pass = result.trim() === expected.trim() || result.includes(expected);

      setIsSuccess(pass);

      if (pass) {
        // Unlock next level and add XP if not completed
        const isNewCompletion = !userProgress.completedLevels.includes(selectedLevel.id);
        if (isNewCompletion) {
          const nextMax = Math.max(userProgress.maxUnlockedLevel, selectedLevel.id + 1);
          const updated: UserGameProgress = {
            ...userProgress,
            maxUnlockedLevel: Math.min(100, nextMax),
            completedLevels: [...userProgress.completedLevels, selectedLevel.id],
            totalXp: userProgress.totalXp + selectedLevel.xpReward,
            currentStreak: userProgress.currentStreak + 1,
            badges: Array.from(new Set([...userProgress.badges, `Nivel ${selectedLevel.id} Superado`]))
          };
          onUpdateProgress(updated);
        }
      }
    } catch (err: any) {
      setOutput(`Error de Ejecución: ${err.message}`);
      setIsSuccess(false);
    }
  };

  const categories = ['Todos', 'HTML & CSS', 'Lógica JS', 'React & UI', 'Python & Algoritmos', 'Full-Stack AI'];

  const filteredLevels = GENERATED_100_LEVELS.filter(lvl => {
    if (activeCategory === 'Todos') return true;
    return lvl.category === activeCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-hidden">
      {/* 🚀 Welcome Onboarding Tutorial Overlay */}
      <AnimatePresence>
        {showWelcomeTutorial && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl"
          >
            <div className="w-full max-w-xl bg-gradient-to-b from-[#0e1330] via-[#080b1e] to-[#03040a] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.3)] text-center relative overflow-hidden">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-500/20 mb-4">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>

              <div className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest mb-2">
                Plataforma Educativa de Código IA
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-tight">
                ¡Bienvenido al Modo de Juego Desarrollador!
              </h2>

              <p className="text-xs sm:text-sm text-cyan-200/90 font-medium mb-4 italic">
                Desarrollado por <span className="font-bold text-cyan-400">Luis Miguel Martínez</span>, más conocido como <span className="font-extrabold text-amber-400 underline decoration-amber-500">LM</span>.
              </p>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left text-xs space-y-3.5 mb-6 text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">100 Niveles Interactivos</h4>
                    <p className="text-slate-400 text-[11px]">Aprende desde las bases hasta arquitecturas de Inteligencia Artificial.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Desbloqueo Progresivo por Niveles</h4>
                    <p className="text-slate-400 text-[11px]">Supera cada reto para abrir nuevos niveles. Niveles avanzados y Pro garantizan un aprendizaje estructurado.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Asistencia de Código en Tiempo Real</h4>
                    <p className="text-slate-400 text-[11px]">Escribe código, ejecútalo al instante y recibe XP y medallas por tus logros.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowWelcomeTutorial(false)}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>¡Empezar Aventura (100 Niveles)!</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Interface Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-6xl h-[92vh] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
      >
        {/* Top Navigation Bar */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] bg-black/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-widest font-mono">
                  MODO DESARROLLADOR LM
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  100 Niveles
                </span>
              </div>
              <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                Aprende a Programar con IA
              </h3>
            </div>
          </div>

          {/* User Progress Badges & XP */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="text-slate-300 font-bold">Racha: {userProgress.currentStreak} días</span>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300 font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{userProgress.totalXp} XP</span>
            </div>

            <button
              onClick={onClose}
              className="py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Regresar al Menú Principal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al Chat</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level Map OR Level Code Playground */}
        {!selectedLevel ? (
          /* LEVEL MAP VIEW */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* 100 Level Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredLevels.map((lvl) => {
                const isCompleted = userProgress.completedLevels.includes(lvl.id);
                const isUnlocked = lvl.id <= userProgress.maxUnlockedLevel || isCompleted;
                const isProLocked = lvl.isProRequired && !isProUser && !isCompleted;

                return (
                  <div
                    key={lvl.id}
                    onClick={() => handleSelectLevel(lvl)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-32 ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 shadow-md'
                        : isUnlocked
                        ? 'bg-black/40 hover:bg-cyan-950/30 border-cyan-500/30 hover:border-cyan-400 hover:scale-105'
                        : 'bg-black/20 border-white/5 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-extrabold uppercase text-cyan-400">
                          {lvl.category}
                        </span>

                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isProLocked ? (
                          <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
                        ) : !isUnlocked ? (
                          <Lock className="w-4 h-4 text-slate-500" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                        )}
                      </div>

                      <h4 className="text-xs font-extrabold text-white line-clamp-2">
                        #{lvl.id} {lvl.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                      <span>+{lvl.xpReward} XP</span>
                      {isProLocked ? (
                        <span className="text-amber-300 font-bold">Bloqueado Pro</span>
                      ) : isUnlocked ? (
                        <span className="text-cyan-300 font-bold">Jugar</span>
                      ) : (
                        <span>Bloqueado</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* CODE PLAYGROUND & TEST RUNNER VIEW */
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Challenge Specs */}
            <div className="w-full lg:w-1/3 p-5 border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] bg-black/20 overflow-y-auto space-y-4">
              <button
                onClick={() => setSelectedLevel(null)}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                ← Volver al Mapa de 100 Niveles
              </button>

              <div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  {selectedLevel.category} • Nivel #{selectedLevel.id}
                </span>
                <h2 className="text-lg font-black text-white mt-2">
                  {selectedLevel.title}
                </h2>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 leading-relaxed">
                  <h4 className="font-bold text-white mb-1">📖 Descripción:</h4>
                  <p>{selectedLevel.description}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 leading-relaxed text-indigo-200">
                  <h4 className="font-bold text-white mb-1">⚡ Tu Misión:</h4>
                  <p>{selectedLevel.task}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[11px]">
                  <span className="text-slate-400 block mb-1">Resultado esperado:</span>
                  <code className="text-emerald-400 font-bold">{selectedLevel.expectedOutputOrTest}</code>
                </div>
              </div>

              {/* Hint Box & AI Tutor Explain */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-amber-300 flex items-center gap-1.5 border border-white/10 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showHint ? 'Ocultar Pista' : 'Pista Rápida'}</span>
                  </button>

                  <button
                    onClick={handleAskAiHelp}
                    disabled={loadingAiHelp}
                    className="py-1.5 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-xs font-bold text-indigo-300 flex items-center gap-1.5 border border-indigo-500/40 cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span>Explicar con IA</span>
                  </button>
                </div>

                {showHint && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                    💡 <strong>Pista:</strong> {selectedLevel.hint}
                  </div>
                )}

                {loadingAiHelp && (
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span>La IA está analizando tu código y generando una explicación detallada...</span>
                  </div>
                )}

                {aiExplanation && !loadingAiHelp && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-b from-indigo-950/50 to-purple-950/40 border border-indigo-500/40 text-xs text-indigo-100 whitespace-pre-wrap leading-relaxed shadow-lg">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Explicación del Asistente Virtual:
                    </div>
                    {aiExplanation}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Code Editor & Execution Console */}
            <div className="flex-1 flex flex-col bg-[#050711] overflow-hidden">
              {/* Editor Header */}
              <div className="p-3 bg-black/40 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <span>Editor de Código JS / Reto #{selectedLevel.id}</span>
                </div>

                <button
                  onClick={handleRunCode}
                  className="py-1.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Comprobar Código</span>
                </button>
              </div>

              {/* Textarea Code Input */}
              <div className="flex-1 p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full bg-transparent font-mono text-xs sm:text-sm text-cyan-200 focus:outline-none resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Console Output Footer */}
              <div className="p-4 bg-black/80 border-t border-white/10 h-36 overflow-y-auto font-mono text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    Consola de Salida:
                  </span>
                  {isSuccess !== null && (
                    <span className={isSuccess ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {isSuccess ? '✅ ¡Nivel Superado!' : '❌ Inténtalo de nuevo'}
                    </span>
                  )}
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  isSuccess === true ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' :
                  isSuccess === false ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' :
                  'bg-black/40 border-white/5 text-slate-400'
                }`}>
                  {output || 'Presiona "Comprobar Código" para evaluar tus resultados...'}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
