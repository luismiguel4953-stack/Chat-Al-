import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Cpu, 
  Bot, 
  FileText, 
  Send,
  Radio,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { CallReport, ChatMessage } from '../types';
import { CallSummary } from './CallSummary';
import { sendChatMessage } from '../services/chatService';

interface AICallModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  systemInstruction: string;
  onSaveReportToChat: (report: CallReport, callMessages: ChatMessage[]) => void;
}

export const AICallModal: React.FC<AICallModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  systemInstruction,
  onSaveReportToChat,
}) => {
  const [callState, setCallState] = useState<'connecting' | 'active' | 'ended'>('connecting');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [callTranscripts, setCallTranscripts] = useState<{ role: 'user' | 'assistant'; text: string; time: string }[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [report, setReport] = useState<CallReport | null>(null);

  const timerRef = useRef<any>(null);

  // Connection transition timer
  useEffect(() => {
    if (isOpen) {
      setCallState('connecting');
      setSeconds(0);
      setCallTranscripts([]);
      setReport(null);

      const connTimeout = setTimeout(() => {
        setCallState('active');
        // Initial AI call greeting
        const initialGreeting = "Hola. Asistente de inteligencia artificial JARVIS en línea. ¿En qué tema te gustaría trabajar o discutir en esta llamada?";
        setCallTranscripts([{
          role: 'assistant',
          text: initialGreeting,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);

        speakText(initialGreeting);
      }, 1500);

      return () => clearTimeout(connTimeout);
    }
  }, [isOpen]);

  // Call duration counter
  useEffect(() => {
    if (callState === 'active') {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const speakText = (text: string) => {
    if (!isSpeakerOn || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/```[\s\S]*?```/g, '').replace(/[*#`_]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'es-ES';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Call speech synthesis error:", e);
    }
  };

  const handleSendUtterance = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || isAiThinking) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newTranscripts = [...callTranscripts, { role: 'user' as const, text: userInput, time }];
    setCallTranscripts(newTranscripts);
    const sentText = userInput;
    setUserInput('');
    setIsAiThinking(true);

    try {
      const messagesForApi = newTranscripts.map(t => ({
        role: t.role,
        content: t.text
      }));

      const res = await sendChatMessage({
        messages: messagesForApi,
        systemInstruction: systemInstruction + " (Atención: Estás en una llamada de voz en tiempo real. Responde de forma concisa, profesional y directa).",
        model: selectedModel,
        temperature: 0.7
      });

      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCallTranscripts(prev => [...prev, { role: 'assistant', text: res.text, time: replyTime }]);
      speakText(res.text);
    } catch (err) {
      console.error("Error in call speech response:", err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // End Call and Generate Call Summary Report
  const handleEndCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const duration = seconds > 0 ? seconds : 12;
    const userTexts = callTranscripts.filter(t => t.role === 'user').map(t => t.text);
    const topic = userTexts.length > 0 ? userTexts[0] : 'Sesión de Asistencia Técnica e Ideas';

    // Build structured CallReport
    const generatedReport: CallReport = {
      id: `call-${Date.now()}`,
      title: topic.length > 30 ? topic.slice(0, 30) + '...' : topic,
      durationSeconds: duration,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      model: selectedModel,
      executiveSummary: callTranscripts.length > 1
        ? `Se realizó una llamada conversacional de ${Math.ceil(duration / 60)} minuto(s) sobre "${topic}". Se abordaron consultas clave con orientación de la IA, estableciendo objetivos claros.`
        : 'Llamada breve de prueba inicial con activación de protocolo de asistencia vocal y registro de memoria.',
      keyPoints: [
        `Discusión centrada en: ${topic}`,
        `Orientación brindada mediante modelo ${selectedModel}`,
        'Verificación de requerimientos de proyecto e integración',
        'Validación de flujo conversacional y voz sintetizada'
      ],
      actionItems: [
        { text: 'Revisar notas e informe de la llamada', completed: true, priority: 'high' },
        { text: 'Implementar acuerdos técnicos discutidos', completed: false, priority: 'high' },
        { text: 'Agendar seguimiento o próxima consulta', completed: false, priority: 'medium' }
      ],
      sentiment: 'positivo',
      participants: ['Usuario', 'JARVIS Core AI']
    };

    setReport(generatedReport);
    setCallState('ended');
  };

  const handleSaveToChat = (savedReport: CallReport) => {
    const chatMsgs: ChatMessage[] = callTranscripts.map((t, i) => ({
      id: `call-msg-${Date.now()}-${i}`,
      role: t.role,
      content: t.text,
      timestamp: t.time
    }));

    onSaveReportToChat(savedReport, chatMsgs);
    onClose();
  };

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        {callState !== 'ended' ? (
          <motion.div
            key="active-call"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-lg bg-gradient-to-b from-[#090b1c] to-[#04050d] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Background Ambient Pulsing Glow */}
            <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Badge, Volver & Timer */}
            <div className="w-full flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                  onClose();
                }}
                className="py-1 px-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                title="Regresar al Menú Principal"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                  {callState === 'connecting' ? 'CONECTANDO CANAL...' : `EN LLAMADA • ${formatTime(seconds)}`}
                </span>
              </div>
            </div>

            {/* AI Mascot Hologram Pulse */}
            <div className="relative mb-6">
              <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-1 flex items-center justify-center shadow-2xl transition-all ${
                isSpeaking ? 'scale-110 shadow-[0_0_40px_rgba(6,182,212,0.6)]' : ''
              }`}>
                <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center overflow-hidden relative">
                  <Bot className={`w-14 h-14 ${isSpeaking ? 'text-cyan-300 animate-bounce' : 'text-indigo-400'}`} />
                  {isSpeaking && (
                    <div className="absolute inset-0 bg-cyan-400/10 animate-pulse pointer-events-none" />
                  )}
                </div>
              </div>

              {/* Animated Waveform Rings */}
              {isSpeaking && (
                <>
                  <div className="absolute -inset-2 rounded-full border border-cyan-400/40 animate-ping pointer-events-none" />
                  <div className="absolute -inset-6 rounded-full border border-indigo-400/20 animate-pulse pointer-events-none" />
                </>
              )}
            </div>

            <h2 className="text-lg font-extrabold text-white mb-1">
              Llamada IA con JARVIS
            </h2>
            <p className="text-xs text-cyan-300 font-mono mb-6">
              {selectedModel} • Transmisión En Vivo
            </p>

            {/* Recent Live Transcript Snippet */}
            <div className="w-full bg-black/40 border border-white/10 rounded-2xl p-3.5 mb-6 max-h-36 overflow-y-auto text-left text-xs space-y-2 font-mono">
              {callTranscripts.map((t, idx) => (
                <div key={idx} className={`p-2 rounded-xl ${t.role === 'user' ? 'bg-indigo-950/40 border border-indigo-500/20 text-indigo-200 ml-4' : 'bg-cyan-950/40 border border-cyan-500/20 text-cyan-200 mr-4'}`}>
                  <div className="text-[9px] text-slate-400 mb-0.5">{t.role === 'user' ? '👤 Tú' : '🤖 JARVIS'} • {t.time}</div>
                  <div>{t.text}</div>
                </div>
              ))}
              {isAiThinking && (
                <div className="text-[10px] text-cyan-400 animate-pulse">🤖 JARVIS está procesando respuesta...</div>
              )}
            </div>

            {/* Quick Speech / Text Input Form inside Call */}
            <form onSubmit={handleSendUtterance} className="w-full flex items-center gap-2 mb-6">
              <input
                type="text"
                placeholder="Escribe tu mensaje para la llamada..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isMuted || isAiThinking}
                className="flex-1 bg-black/50 border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isAiThinking}
                className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
                title={isMuted ? 'Dessilenciar Micrófono' : 'Silenciar Micrófono'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={handleEndCall}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/40 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Colgar & Generar Informe</span>
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  !isSpeakerOn
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
                title={isSpeakerOn ? 'Desactivar Altavoz' : 'Activar Altavoz'}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>
        ) : (
          /* Ended Call - Display Call Summary Report */
          report && (
            <CallSummary
              report={report}
              onSaveToChat={handleSaveToChat}
              onClose={onClose}
              isEmbedded={false}
            />
          )
        )}
      </AnimatePresence>
    </div>
  );
};
