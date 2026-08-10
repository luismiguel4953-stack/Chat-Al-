import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Mic, 
  Search, 
  Trash2, 
  Play, 
  Square, 
  Download, 
  Clock, 
  Calendar, 
  X, 
  Sparkles, 
  Bot, 
  User, 
  Plus,
  Radio,
  ArrowLeft
} from 'lucide-react';
import { AudioItem } from '../types';

const STORAGE_KEY_AUDIO = 'lm_chat_ai_audio_history_v1';

interface AudioHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTranscript?: (transcript: string) => void;
}

export const AudioHistoryModal: React.FC<AudioHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectTranscript,
}) => {
  const [audioList, setAudioList] = useState<AudioItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY_AUDIO);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Default seed audio history entries if empty
    return [
      {
        id: 'aud-1',
        title: 'Transcripción de llamada IA - Planificación de Proyecto',
        durationSeconds: 42,
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'user_recording',
        transcript: 'Hola JARVIS, necesito organizar los requerimientos para el informe de la llamada y la arquitectura de datos.',
      },
      {
        id: 'aud-2',
        title: 'Respuesta de Voz JARVIS - Resumen Ejecutivo',
        durationSeconds: 28,
        timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'assistant_speech',
        transcript: 'Procesamiento completado. El informe estructurado de la llamada ha sido almacenado en su historial local.',
      }
    ];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'user_recording' | 'assistant_speech'>('all');
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUDIO, JSON.stringify(audioList));
  }, [audioList]);

  // Handle Play audio transcript or audioUrl
  const handlePlayAudio = (item: AudioItem) => {
    if (currentlyPlayingId === item.id) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setCurrentlyPlayingId(null);
      return;
    }

    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audio.onended = () => setCurrentlyPlayingId(null);
      audio.play();
      setCurrentlyPlayingId(item.id);
    } else if (item.transcript && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(item.transcript);
      utterance.lang = 'es-ES';
      utterance.onend = () => setCurrentlyPlayingId(null);
      utterance.onerror = () => setCurrentlyPlayingId(null);
      window.speechSynthesis.speak(utterance);
      setCurrentlyPlayingId(item.id);
    }
  };

  // Delete item
  const handleDelete = (id: string) => {
    setAudioList(prev => prev.filter(item => item.id !== id));
    if (currentlyPlayingId === id) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setCurrentlyPlayingId(null);
    }
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const newAudio: AudioItem = {
          id: `aud-${Date.now()}`,
          title: `Grabación de Voz #${audioList.length + 1}`,
          durationSeconds: recordingSeconds || 5,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'user_recording',
          audioUrl,
          transcript: 'Grabación de audio en vivo realizada desde el panel de voz.',
        };

        setAudioList(prev => [newAudio, ...prev]);
        setIsRecording(false);
        setRecordingSeconds(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("No se pudo acceder al micrófono. Por favor verifica los permisos.");
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const filteredItems = audioList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.transcript && item.transcript.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border-subtle)] bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                    Historial de Grabaciones & Audio
                  </h2>
                  <p className="text-xs text-slate-400">
                    Módulos de voz recibidos, síntesis TTS y grabaciones de usuario.
                  </p>
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
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Live Mic Recording Banner */}
            <div className="p-4 bg-indigo-950/30 border-b border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                <span className="text-xs font-bold text-slate-200">
                  {isRecording ? `Grabando Audio (${recordingSeconds}s)...` : 'Nueva Grabación de Voz'}
                </span>
              </div>

              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="py-1.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md animate-pulse"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Detener</span>
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="py-1.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Grabar Micrófono</span>
                </button>
              )}
            </div>

            {/* Controls: Search & Tabs Filter */}
            <div className="p-4 space-y-3 bg-black/10">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por título o transcripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl py-2 pl-9 pr-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({audioList.length})
                </button>

                <button
                  onClick={() => setFilterType('user_recording')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterType === 'user_recording'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Micrófono Usuario</span>
                </button>

                <button
                  onClick={() => setFilterType('assistant_speech')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterType === 'assistant_speech'
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Voz IA (TTS)</span>
                </button>
              </div>
            </div>

            {/* Audio Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredItems.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500">
                  No hay grabaciones de audio que coincidan.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isPlaying = currentlyPlayingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isPlaying
                          ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                          : 'bg-black/20 hover:bg-white/5 border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <button
                          onClick={() => handlePlayAudio(item)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-transform hover:scale-105 ${
                            isPlaying
                              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40 animate-pulse'
                              : item.type === 'user_recording'
                              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                              : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                              item.type === 'user_recording'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}>
                              {item.type === 'user_recording' ? 'Usuario' : 'Voz IA'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.durationSeconds}s • {item.timestamp}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                            {item.title}
                          </h4>

                          {item.transcript && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                              "{item.transcript}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {onSelectTranscript && item.transcript && (
                          <button
                            onClick={() => {
                              onSelectTranscript(item.transcript || '');
                              onClose();
                            }}
                            className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-cyan-300 font-bold border border-white/10 transition-colors cursor-pointer"
                          >
                            Usar en Chat
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Eliminar audio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
