import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Code, 
  Sparkles, 
  Cpu, 
  Terminal, 
  Send,
  Zap,
  Play,
  PlayCircle,
  ArrowLeft
} from 'lucide-react';
import { sendChatMessage } from '../services/chatService';

interface JarvisLiveRobotProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
}

export const JarvisLiveRobot: React.FC<JarvisLiveRobotProps> = ({
  isOpen,
  onClose,
  selectedModel,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [robotEyeColor, setRobotEyeColor] = useState<'cyan' | 'emerald' | 'amber' | 'rose'>('cyan');
  const [liveCode, setLiveCode] = useState('// Modo JARVIS Activado\n// Generando micro-código en tiempo real...\nfunction jarvisCore() {\n  return "Conexión estable con Luis Miguel Martínez (LM)";\n}');
  const [transcripts, setTranscripts] = useState<{ role: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      role: 'assistant',
      text: '¡Hola! Bienvenido al juego "Escuche nuestra voz, hable con nosotros". Soy el Robot JARVIS en vivo. Háblame o escríbeme y programemos algo en tiempo real.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');

  // Speech recognition ref
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      speakText('¡Hola! Bienvenido al juego Escuche nuestra voz, hable con nosotros. Soy el Robot JARVIS en vivo.');
    }
  }, [isOpen]);

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/```[\s\S]*?```/g, '').replace(/[*#`_]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'es-ES';
      utterance.onstart = () => {
        setIsSpeaking(true);
        setRobotEyeColor('cyan');
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = [...transcripts, { role: 'user' as const, text: textToSend, time }];
    setTranscripts(updated);
    setInputText('');
    setIsThinking(true);
    setRobotEyeColor('amber');

    try {
      const messagesForApi = updated.map(t => ({
        role: t.role,
        content: t.text
      }));

      const res = await sendChatMessage({
        messages: messagesForApi,
        systemInstruction: "Eres el robot animado de la plataforma de programación de Luis Miguel Martínez (LM). Responde brevemente y en tono entusiasta. Si puedes, genera un pequeño bloque de código de 3 a 5 líneas.",
        model: selectedModel,
        temperature: 0.7
      });

      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setTranscripts(prev => [...prev, { role: 'assistant', text: res.text, time: replyTime }]);
      setIsThinking(false);
      setRobotEyeColor('emerald');

      // Extract code block if present
      const codeMatch = res.text.match(/```(?:js|javascript|python|html)?([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        setLiveCode(codeMatch[1].trim());
      } else {
        setLiveCode(`// Micro-código generado automáticamente:\nfunction procesar(${textToSend.slice(0, 10).replace(/[^a-zA-Z]/g, '') || 'dato'}) {\n  console.log("JARVIS procesando respuesta...");\n  return true;\n}`);
      }

      speakText(res.text);
    } catch (err) {
      console.error("Error in Jarvis Live Robot:", err);
      setIsThinking(false);
      setRobotEyeColor('rose');
    }
  };

  // Toggle Live Speech Mic
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Tu navegador no soporta reconocimiento de voz nativo en vivo. Utiliza el teclado.");
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRec();
    rec.lang = 'es-ES';
    rec.interimResults = false;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      if (spokenText) {
        handleSendMessage(spokenText);
      }
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl h-[90vh] bg-gradient-to-b from-[#090e24] via-[#050714] to-[#020308] border border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.25)] flex flex-col relative overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  Modo JARVIS Vivo
                </span>
                <span className="text-[10px] font-bold text-amber-400">LM Dev Engine</span>
              </div>
              <h2 className="text-base font-extrabold text-white">
                "Escuche nuestra voz, hable con nosotros"
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Regresar al Menú Principal"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </button>

            <button
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Panel: Animated Live Robot Avatar & Micro-Code Generator */}
          <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-cyan-500/20 bg-black/30 flex flex-col items-center justify-between space-y-4 overflow-y-auto">
            {/* Robot SVG Visualizer */}
            <div className="relative my-4 flex flex-col items-center">
              {/* Pulsing Aura Rings */}
              <div className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full border-2 transition-all flex items-center justify-center relative ${
                isSpeaking
                  ? 'border-cyan-400 shadow-[0_0_60px_rgba(6,182,212,0.6)] animate-pulse'
                  : isThinking
                  ? 'border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.4)]'
                  : 'border-cyan-500/30'
              }`}>
                {/* Robot Head Core */}
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-indigo-950 border-2 border-cyan-400/50 flex flex-col items-center justify-center p-4 shadow-2xl relative">
                  {/* Robot Antenna */}
                  <div className="absolute -top-6 w-2 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                    <div className={`w-3.5 h-3.5 rounded-full ${isSpeaking ? 'bg-cyan-300 animate-ping' : 'bg-cyan-400'}`} />
                  </div>

                  {/* Robot Eyes */}
                  <div className="flex items-center gap-6 mb-3">
                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                      isSpeaking ? 'bg-cyan-300 border-white scale-125 shadow-[0_0_20px_#06b6d4]' :
                      isThinking ? 'bg-amber-400 border-amber-200 animate-bounce' :
                      'bg-cyan-400 border-cyan-200'
                    }`} />
                    <div className={`w-6 h-6 rounded-full border-2 transition-all ${
                      isSpeaking ? 'bg-cyan-300 border-white scale-125 shadow-[0_0_20px_#06b6d4]' :
                      isThinking ? 'bg-amber-400 border-amber-200 animate-bounce' :
                      'bg-cyan-400 border-cyan-200'
                    }`} />
                  </div>

                  {/* Robot Mouth Visualizer */}
                  <div className="w-16 h-3 bg-black/80 rounded-full border border-cyan-500/40 overflow-hidden flex items-center justify-center px-1 gap-0.5">
                    {isSpeaking ? (
                      <>
                        <div className="w-1 bg-cyan-400 h-full animate-pulse" />
                        <div className="w-1 bg-cyan-300 h-2/3 animate-ping" />
                        <div className="w-1 bg-cyan-400 h-full animate-pulse" />
                        <div className="w-1 bg-cyan-300 h-1/2 animate-ping" />
                      </>
                    ) : (
                      <div className="w-10 h-0.5 bg-cyan-400/80 rounded-full" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
                  {isSpeaking ? '🗣️ JARVIS Hablando...' : isThinking ? '🧠 Pensando Código...' : '👂 Escuchando tu voz'}
                </span>
              </div>
            </div>

            {/* Micro-Code Live Window ("programando cositas leves") */}
            <div className="w-full bg-black/80 border border-cyan-500/30 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Code className="w-3.5 h-3.5" />
                  Live Code JARVIS (Programación Leve)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Autogenerado</span>
              </div>

              <pre className="p-3 bg-[#03050d] rounded-xl border border-white/5 font-mono text-[11px] text-cyan-200 overflow-x-auto leading-relaxed max-h-32">
                <code>{liveCode}</code>
              </pre>
            </div>
          </div>

          {/* Right Panel: Interactive Speech & Text Chat */}
          <div className="w-full md:w-1/2 flex flex-col bg-[#040611] p-4 sm:p-5 overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-3 p-2 font-mono text-xs">
              {transcripts.map((t, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border ${
                    t.role === 'user'
                      ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200 ml-6'
                      : 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200 mr-6'
                  }`}
                >
                  <div className="text-[9px] text-slate-400 mb-1">
                    {t.role === 'user' ? '👤 Tú' : '🤖 JARVIS Robot'} • {t.time}
                  </div>
                  <p className="leading-relaxed font-sans">{t.text}</p>
                </div>
              ))}
              {isThinking && (
                <div className="text-[10px] text-amber-400 animate-pulse">
                  🤖 JARVIS procesando respuesta y escribiendo código...
                </div>
              )}
            </div>

            {/* Mic & Text Input Controls */}
            <div className="pt-3 border-t border-cyan-500/20 space-y-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputText);
                }}
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                      : 'bg-cyan-600/30 text-cyan-300 border-cyan-500/40 hover:bg-cyan-600 hover:text-white'
                  }`}
                  title={isListening ? 'Detener Escucha' : 'Hablar con JARVIS (Micrófono)'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  placeholder="Escribe o habla con el robot JARVIS..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-black/60 border border-white/10 rounded-2xl py-2.5 px-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || isThinking}
                  className="p-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
