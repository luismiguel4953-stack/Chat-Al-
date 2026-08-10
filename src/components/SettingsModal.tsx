import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Sliders, 
  Cpu, 
  Trash2, 
  Download, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Volume2,
  Palette,
  Sparkles,
  Bot,
  Play,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearAllData: () => void;
  onExportData: (format: 'json' | 'markdown') => void;
}

const PERSONA_PRESETS = [
  {
    id: 'jarvis',
    name: '🤖 Protocolo JARVIS (Asistente Personal)',
    desc: 'Atento, analítico, eficiente y con tono ejecutivo tecnológicamente avanzado.',
    prompt: 'Eres JARVIS, un sistema de inteligencia artificial avanzado y personalizado. Respondes con atención impecable, saludos profesionales ("A su servicio", "Procesando datos"), análisis claro y sugerencias proactivas.',
  },
  {
    id: 'general',
    name: 'Asistente General LM AI',
    desc: 'Equilibrado, preciso y profesional.',
    prompt: 'Eres LM Chat AI, un asistente de inteligencia artificial avanzado, servicial, conciso y profesional en español. Respondes con estructura clara, bloques de código estilizados y respuestas analíticas.',
  },
  {
    id: 'coder',
    name: 'Programador Senior & Arquitecto',
    desc: 'Especialista en TypeScript, React, APIs y optimización.',
    prompt: 'Eres un Programador Senior y Arquitecto de Software. Das respuestas extremadamente estructuradas, código TypeScript/Node.js impecable, análisis de complejidad y mejores prácticas de diseño.',
  },
  {
    id: 'executive',
    name: 'Estratega Ejecutivo & Negocios',
    desc: 'Puntos clave, métricas, ROI y resúmenes ejecutivos.',
    prompt: 'Eres un Consultor y Estratega Ejecutivo de Alto Nivel. Respondes con puntos clave scannables, métricas de valor, tono profesional y recomendaciones directas.',
  },
  {
    id: 'tutor',
    name: 'Tutor Socrático Educativo',
    desc: 'Explicaciones paso a paso con preguntas guiadas.',
    prompt: 'Eres un Tutor Educativo Socrático. Explicas conceptos complejos de forma clara y accesible con analogías visuales, desgloses paso a paso y preguntas para reforzar el aprendizaje.',
  },
  {
    id: 'creative',
    name: 'Creador de Contenido & Marketing',
    desc: 'Ideas persuasivas, tono dinámico y copywriting.',
    prompt: 'Eres un Experto Creador de Contenido y Copywriter Creativo. Generas ideas innovadoras, estructuras persuasivas y contenido memorable.',
  },
];

const ACCENT_COLORS = [
  { id: 'indigo', name: 'Índigo Neón', color: 'bg-indigo-500', border: 'border-indigo-500' },
  { id: 'emerald', name: 'Esmeralda Aurora', color: 'bg-emerald-500', border: 'border-emerald-500' },
  { id: 'rose', name: 'Rosa Neón', color: 'bg-rose-500', border: 'border-rose-500' },
  { id: 'amber', name: 'Ámbar Dorado', color: 'bg-amber-500', border: 'border-amber-500' },
  { id: 'cyan', name: 'Cian Ciberpunk', color: 'bg-cyan-500', border: 'border-cyan-500' },
  { id: 'purple', name: 'Púrpura Místico', color: 'bg-purple-500', border: 'border-purple-500' },
  { id: 'cyberpunk', name: '⚡ Cyberpunk Neon', color: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400', border: 'border-pink-500' },
];

const BACKGROUND_STYLES = [
  { id: 'dark', name: 'Oscuro Elegante', desc: 'Fondo suave con gradientes de luz' },
  { id: 'grid', name: 'Malla Grid', desc: 'Patrón de red técnica retro' },
  { id: 'cosmos', name: 'Cosmos Estelar', desc: 'Ambiente estelar profundo' },
  { id: 'oled', name: 'OLED Negro Puro', desc: 'Ahorro máximo de energía' },
  { id: 'cyberpunk', name: '⚡ Cyberpunk Partículas', desc: 'Láseres neón, matriz y nodos dinámicos' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllData,
  onExportData,
}) => {
  const [activeTab, setActiveTab] = useState<'persona' | 'voice' | 'theme' | 'system'>('persona');
  
  // Settings State
  const [systemInst, setSystemInst] = useState(settings.systemInstruction);
  const [temp, setTemp] = useState(settings.temperature);
  const [accent, setAccent] = useState(settings.accentColor || 'indigo');
  const [bgStyle, setBgStyle] = useState(settings.backgroundStyle || 'dark');
  const [persona, setPersona] = useState(settings.personaPreset || 'general');

  // Voice State
  const [autoVoice, setAutoVoice] = useState(settings.autoVoiceResponse || false);
  const [vSpeed, setVSpeed] = useState(settings.voiceSpeed || 1.0);
  const [vPitch, setVPitch] = useState(settings.voicePitch || 1.0);
  const [vName, setVName] = useState(settings.voiceName || '');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Health check state
  const [apiStatus, setApiStatus] = useState<{ checked: boolean; online: boolean; message: string }>({
    checked: false,
    online: false,
    message: '',
  });

  useEffect(() => {
    setSystemInst(settings.systemInstruction);
    setTemp(settings.temperature);
    setAccent(settings.accentColor || 'indigo');
    setBgStyle(settings.backgroundStyle || 'dark');
    setPersona(settings.personaPreset || 'general');
    setAutoVoice(settings.autoVoiceResponse || false);
    setVSpeed(settings.voiceSpeed || 1.0);
    setVPitch(settings.voicePitch || 1.0);
    setVName(settings.voiceName || '');

    // Load browser SpeechSynthesis voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        if (!settings.voiceName && voices.length > 0) {
          const defaultSpanish = voices.find(v => v.lang.startsWith('es')) || voices[0];
          setVName(defaultSpanish.name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [settings, isOpen]);

  const handleSelectPersonaPreset = (preset: typeof PERSONA_PRESETS[0]) => {
    setPersona(preset.id as any);
    setSystemInst(preset.prompt);
  };

  const testVoiceSample = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance('Hola, soy LM Chat AI. Esta es mi respuesta por voz personalizada.');
    utterance.lang = 'es-ES';
    utterance.rate = vSpeed;
    utterance.pitch = vPitch;

    if (vName && availableVoices.length > 0) {
      const match = availableVoices.find(v => v.name === vName);
      if (match) utterance.voice = match;
    }

    window.speechSynthesis.speak(utterance);
  };

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setApiStatus({
        checked: true,
        online: data.status === 'online',
        message: `Servidor Backend OK (${data.service}). API Key Gemini: ${data.apiKeyConfigured ? 'Configurada' : 'Inactiva (Fallback Local Activo)'}`,
      });
    } catch (err) {
      setApiStatus({
        checked: true,
        online: false,
        message: 'No se pudo verificar el backend.',
      });
    }
  };

  const handleSave = () => {
    onUpdateSettings({
      systemInstruction: systemInst,
      temperature: temp,
      accentColor: accent as any,
      backgroundStyle: bgStyle as any,
      personaPreset: persona as any,
      autoVoiceResponse: autoVoice,
      voiceSpeed: vSpeed,
      voicePitch: vPitch,
      voiceName: vName,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative text-zinc-200 select-none flex flex-col max-h-[85vh]"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base text-white tracking-tight flex items-center gap-2">
                  <span>Personalización Última & Ajustes</span>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </h2>
                <p className="text-xs text-zinc-400">Configura voz, temas visuales y la conducta de la IA.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Regresar al Menú Principal"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex p-1 bg-zinc-950 border border-zinc-800/80 rounded-2xl mb-4 shrink-0 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('persona')}
              className={`flex-1 min-w-[100px] py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'persona' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Personalidad</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('voice')}
              className={`flex-1 min-w-[100px] py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'voice' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voz & TTS</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex-1 min-w-[100px] py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'theme' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Diseño</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`flex-1 min-w-[100px] py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'system' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Avanzado</span>
            </button>
          </div>

          {/* TAB 1: PERSONA & SYSTEM PROMPT */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {activeTab === 'persona' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Presets de Personalidad IA
                  </label>
                  <div className="space-y-2">
                    {PERSONA_PRESETS.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPersonaPreset(p)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          persona === p.id
                            ? 'bg-indigo-600/20 border-indigo-500/80 text-white shadow-lg'
                            : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span>{p.name}</span>
                          {persona === p.id && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono">
                              ACTIVO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Instrucciones del Sistema Personalizadas
                  </label>
                  <textarea
                    value={systemInst}
                    onChange={(e) => setSystemInst(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: VOICE & SPEECH SYNTHESIS */}
            {activeTab === 'voice' && (
              <div className="space-y-5">
                {/* Auto Voice Response Toggle */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-white">Hablar Respuestas por Voz</h3>
                    <p className="text-[11px] text-zinc-400">Lee en voz alta automáticamente las respuestas que genere la IA.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoVoice}
                      onChange={(e) => setAutoVoice(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Voice Selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Voz del Sintetizador
                  </label>
                  {availableVoices.length > 0 ? (
                    <select
                      value={vName}
                      onChange={(e) => setVName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {availableVoices.map((v, i) => (
                        <option key={i} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">Cargando voces del navegador...</p>
                  )}
                </div>

                {/* Voice Speed Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Velocidad de Lectura ({vSpeed.toFixed(1)}x)
                    </label>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {vSpeed < 0.9 ? 'Lento' : vSpeed > 1.2 ? 'Rápido' : 'Normal'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={vSpeed}
                    onChange={(e) => setVSpeed(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Voice Pitch Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Tono de Voz ({vPitch.toFixed(1)})
                    </label>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {vPitch < 0.9 ? 'Grave' : vPitch > 1.2 ? 'Agudo' : 'Estándar'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={vPitch}
                    onChange={(e) => setVPitch(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Test Voice Sample Button */}
                <button
                  type="button"
                  onClick={testVoiceSample}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-indigo-400" />
                  <span>🔊 Probar Muestra de Voz</span>
                </button>
              </div>
            )}

            {/* TAB 3: THEME & BACKGROUND */}
            {activeTab === 'theme' && (
              <div className="space-y-5">
                {/* Accent Color Selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Color de Acento de la App
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAccent(c.id as any)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          accent === c.id
                            ? `${c.border} bg-zinc-800 text-white font-bold shadow-md`
                            : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full ${c.color}`} />
                        <span className="text-xs truncate">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Style Selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Estilo de Fondo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BACKGROUND_STYLES.map((bg) => (
                      <div
                        key={bg.id}
                        onClick={() => setBgStyle(bg.id as any)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                          bgStyle === bg.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-lg'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-0.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-xs">{bg.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500">{bg.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ADVANCED & DATA */}
            {activeTab === 'system' && (
              <div className="space-y-5">
                {/* Creativity Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Temperatura IA ({temp})</span>
                    </label>
                    <span className="text-[10px] text-indigo-400 font-mono">
                      {temp < 0.4 ? 'Preciso' : temp > 0.8 ? 'Creativo' : 'Equilibrado'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={temp}
                    onChange={(e) => setTemp(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                {/* API Inspector */}
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Diagnóstico de Servidor</span>
                    </div>
                    <button
                      type="button"
                      onClick={checkHealth}
                      className="py-1 px-3 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[10px] font-mono cursor-pointer"
                    >
                      Probar Conexión
                    </button>
                  </div>
                  {apiStatus.checked && (
                    <div className="mt-2 text-xs flex items-start gap-2 p-2.5 rounded-xl bg-black/60 border border-zinc-800">
                      {apiStatus.online ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span className="text-zinc-300 text-[11px]">{apiStatus.message}</span>
                    </div>
                  )}
                </div>

                {/* Export / Reset */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                    Exportar / Reset
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => onExportData('markdown')}
                      className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Exportar Markdown</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onExportData('json')}
                      className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Exportar JSON</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={onClearAllData}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Borrar Todo el Histórico Local</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-zinc-800 mt-4 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-zinc-500 font-mono">v4.2 • LM Chat AI</span>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="py-2 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
