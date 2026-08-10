import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Sparkles, 
  X, 
  Image as ImageIcon,
  Zap,
  CornerDownLeft,
  AlertCircle,
  Camera
} from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (text: string, attachment?: { name: string; type: 'image' | 'file' }) => void;
  isGenerating: boolean;
  onSelectSuggestion?: (prompt: string) => void;
}

const QUICK_SUGGESTIONS = [
  '🎨 Generar imagen: Un robot futurista en la ciudad Cyberpunk',
  '📞 Generar informe de llamada IA con resumen y tareas',
  '🤖 Modo JARVIS: Activar protocolo personal',
  '🖼️ Generar imagen: Paisaje espacial galáctico en 8K',
  '🎵 Componer canción o letra musical',
  '⚡ Optimizar código TypeScript',
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  isGenerating,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; type: 'image' | 'file' } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachment) || isGenerating) return;

    onSendMessage(inputText.trim(), attachment || undefined);
    setInputText('');
    setAttachment(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImg = file.type.startsWith('image/');
      setAttachment({
        name: file.name,
        type: isImg ? 'image' : 'file',
      });
    }
  };

  const handleEnhancePrompt = () => {
    if (!inputText.trim()) return;
    setInputText(`Por favor, analiza en detalle el siguiente requerimiento, proporcionando ejemplos claros y estructura profesional: "${inputText.trim()}"`);
  };

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'es-ES';

          recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript;
            }
            if (transcript) {
              setInputText((prev) => {
                const cleanedPrev = prev.trim();
                return cleanedPrev ? `${cleanedPrev} ${transcript}` : transcript;
              });
            }
          };

          recognition.onerror = (event: any) => {
            console.warn("Speech recognition notice:", event.error);
            setIsRecording(false);
            if (event.error === 'not-allowed') {
              setMicError("El navegador bloqueó el micrófono. Permite el acceso al micrófono en los ajustes de tu navegador.");
            } else if (event.error !== 'no-speech') {
              setMicError(`Aviso de dictado por voz: ${event.error}`);
            }
          };

          recognition.onend = () => {
            setIsRecording(false);
          };

          recognitionRef.current = recognition;
        } catch (e) {
          console.warn("Could not instantiate SpeechRecognition:", e);
        }
      }
    }
  }, []);

  const toggleVoiceRecording = async () => {
    setMicError(null);

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsRecording(false);
      return;
    }

    // Explicitly request media permission if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        console.warn("Microphone access denied:", err);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setMicError("Permiso de micrófono denegado. Permite el acceso en el ícono de candado del navegador.");
          return;
        }
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e: any) {
        console.warn("Error starting speech recognition:", e);
        setMicError("Permiso de micrófono no otorgado o reconocimiento de voz ocupado.");
        setIsRecording(false);
      }
    } else {
      setMicError("Tu navegador o el entorno actual no soporta la API de reconocimiento de voz.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 pb-6 pt-2 select-none">
      {/* Quick Suggestions Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0 flex items-center gap-1">
          <Zap className="w-3 h-3 text-indigo-400" />
          Sugerencias:
        </span>
        {QUICK_SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(s)}
            className="py-1 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-indigo-600/20 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all shrink-0 cursor-pointer text-[11px]"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Live User Typing Mascot Badge */}
      {inputText.trim() && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-[var(--accent-primary)] text-xs shadow-lg w-fit animate-fade-in backdrop-blur-md">
          <div className="relative w-5 h-5 rounded-lg bg-slate-900 border border-cyan-400 flex items-center justify-center shrink-0 overflow-hidden">
            <div className="flex gap-0.5">
              <span className="w-1 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="w-1 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            </div>
          </div>
          <span className="font-semibold text-[11px] accent-text flex items-center gap-1.5">
            <span>✍️ Escribiendo mensaje para LM Chat AI...</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded accent-bg">
              {inputText.length} caracteres
            </span>
          </span>
        </div>
      )}

      {/* Voice Dictation Error / Permission Notice */}
      {micError && (
        <div className="mb-2 flex items-center justify-between px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{micError}</span>
          </div>
          <button
            type="button"
            onClick={() => setMicError(null)}
            className="p-1 hover:text-white shrink-0 ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Voice Dictation Active Wave Banner */}
      {isRecording && (
        <div className="mb-2 flex items-center justify-between px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-rose-400 animate-bounce" />
            <span className="font-bold">Escuchando dictado por voz... Habla ahora.</span>
          </div>
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]"
          >
            Detener
          </button>
        </div>
      )}

      {/* Attachment Chip Preview */}
      {attachment && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 w-fit">
          {attachment.type === 'image' ? <ImageIcon className="w-3.5 h-3.5" /> : <Paperclip className="w-3.5 h-3.5" />}
          <span className="truncate max-w-xs">{attachment.name}</span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="p-0.5 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Box Shell */}
      <form
        onSubmit={handleSubmit}
        className={`relative rounded-2xl bg-[var(--bg-input)] border transition-all shadow-2xl overflow-hidden ${
          inputText.trim()
            ? 'accent-border accent-glow'
            : 'border-[var(--border-subtle)]'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje a LM Chat AI..."
          rows={1}
          maxLength={4000}
          className="w-full bg-transparent px-4 py-3.5 text-sm text-[var(--text-primary)] placeholder:text-slate-500 focus:outline-none resize-none max-h-48 leading-relaxed"
        />

        {/* Hidden File Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,.pdf,.txt,.js,.ts,.json"
        />
        <input
          ref={cameraInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*"
          capture="environment"
        />

        {/* Composer Toolbar Bottom */}
        <div className="px-3 pb-3 flex items-center justify-between border-t border-white/5 pt-2">
          {/* Left Action Tools */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Adjuntar archivo o imagen"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
              title="Tomar foto con la cámara"
            >
              <Camera className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isRecording
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title="Dictado por voz"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleEnhancePrompt}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
              title="Mejorar prompt con IA"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

          {/* Right Action Tools & Send Button */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono">
              {inputText.length} / 4,000
            </span>

            <button
              type="submit"
              disabled={(!inputText.trim() && !attachment) || isGenerating}
              className={`py-2 px-4 rounded-xl font-medium text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                inputText.trim() && !isGenerating
                  ? 'btn-accent hover:scale-105'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Enviar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
