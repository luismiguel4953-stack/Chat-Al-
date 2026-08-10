import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  CheckSquare, 
  List, 
  Clock, 
  Calendar, 
  Cpu, 
  Copy, 
  Check, 
  Download, 
  MessageSquare, 
  Volume2, 
  Share2, 
  Sparkles,
  PhoneCall,
  UserCheck
} from 'lucide-react';
import { CallReport } from '../types';

interface CallSummaryProps {
  report: CallReport;
  onSaveToChat?: (report: CallReport) => void;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const CallSummary: React.FC<CallSummaryProps> = ({
  report,
  onSaveToChat,
  onClose,
  isEmbedded = false
}) => {
  const [copied, setCopied] = useState(false);
  const [actions, setActions] = useState(report.actionItems || []);
  const [savedToChat, setSavedToChat] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const toggleAction = (index: number) => {
    setActions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], completed: !next[index].completed };
      return next;
    });
  };

  const handleCopy = () => {
    const actionText = actions.map(a => `${a.completed ? '✅' : '⏳'} ${a.text}`).join('\n');
    const fullText = `📋 INFORME DE LLAMADA IA: ${report.title}
📅 Fecha: ${report.date} | ⏱️ Duración: ${formatDuration(report.durationSeconds)} | 🤖 Modelo: ${report.model}

📌 RESUMEN EJECUTIVO:
${report.executiveSummary}

🔑 PUNTOS CLAVE DISCUTIDOS:
${report.keyPoints.map(p => `• ${p}`).join('\n')}

⚡ ACCIONES PENDIENTES:
${actionText}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const actionText = actions.map(a => `- [${a.completed ? 'x' : ' '}] ${a.text}`).join('\n');
    const mdContent = `# 📞 Informe de Llamada IA: ${report.title}

- **Fecha:** ${report.date}
- **Duración:** ${formatDuration(report.durationSeconds)}
- **Modelo:** ${report.model}
- **Participantes:** ${report.participants?.join(', ') || 'Usuario & JARVIS Core'}

---

## 📌 Resumen Ejecutivo
${report.executiveSummary}

## 🔑 Puntos Clave
${report.keyPoints.map(p => `- ${p}`).join('\n')}

## ⚡ Acciones Pendientes
${actionText}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Llamada_${report.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (onSaveToChat) {
      onSaveToChat({ ...report, actionItems: actions });
      setSavedToChat(true);
      setTimeout(() => setSavedToChat(false), 2500);
    }
  };

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    const summaryText = `Informe de llamada ${report.title}. Resumen: ${report.executiveSummary}. Puntos clave: ${report.keyPoints.join('. ')}. Acciones pendientes: ${actions.map(a => a.text).join('. ')}.`;
    const utterance = new SpeechSynthesisUtterance(summaryText);
    utterance.lang = 'es-ES';
    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsPlayingVoice(true);
  };

  function formatDuration(sec: number): string {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  }

  const content = (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 sm:p-6 shadow-xl space-y-6 text-left">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wide">
                Informe de Llamada IA
              </span>
              {report.sentiment && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 capitalize">
                  {report.sentiment}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] mt-1">
              {report.title}
            </h3>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {formatDuration(report.durationSeconds)}
          </span>
          <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {report.date}
          </span>
          <span className="flex items-center gap-1 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            {report.model}
          </span>
        </div>
      </div>

      {/* 📌 1. Resumen Ejecutivo */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase font-extrabold tracking-wider text-cyan-400 font-mono">
          <FileText className="w-4 h-4" />
          <span>Resumen Ejecutivo</span>
        </div>
        <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-xs sm:text-sm leading-relaxed text-slate-200">
          {report.executiveSummary}
        </div>
      </div>

      {/* 🔑 2. Puntos Clave */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase font-extrabold tracking-wider text-indigo-400 font-mono">
          <List className="w-4 h-4" />
          <span>Puntos Clave Discutidos</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {report.keyPoints.map((point, i) => (
            <li
              key={i}
              className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 flex items-start gap-2.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ⚡ 3. Acciones Pendientes (Action Items) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase font-extrabold tracking-wider text-emerald-400 font-mono">
            <CheckSquare className="w-4 h-4" />
            <span>Acciones Pendientes y Tareas ({actions.filter(a => a.completed).length}/{actions.length})</span>
          </div>
        </div>
        <div className="space-y-2">
          {actions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => toggleAction(idx)}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer select-none ${
                item.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                  : 'bg-black/30 border-white/10 text-white hover:border-emerald-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                  item.completed
                    ? 'bg-emerald-500 border-emerald-400 text-black'
                    : 'border-slate-500 hover:border-emerald-400'
                }`}>
                  {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-xs font-medium">{item.text}</span>
              </div>

              {item.priority && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  item.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  item.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }`}>
                  {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Participantes */}
      {report.participants && report.participants.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <UserCheck className="w-4 h-4 text-cyan-400" />
          <span>Participantes:</span>
          <span className="text-slate-200 font-sans">{report.participants.join(', ')}</span>
        </div>
      )}

      {/* Toolbar Controls */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer text-slate-200"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer text-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Descargar .MD</span>
          </button>

          <button
            onClick={handleReadAloud}
            className={`py-2 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingVoice
                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 animate-pulse'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>{isPlayingVoice ? 'Detener Voz' : 'Escuchar Voz'}</span>
          </button>
        </div>

        {onSaveToChat && (
          <button
            onClick={handleSave}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            {savedToChat ? <Check className="w-4 h-4 text-emerald-300" /> : <MessageSquare className="w-4 h-4" />}
            <span>{savedToChat ? 'Guardado en Chat!' : 'Guardar en Chat'}</span>
          </button>
        )}
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl my-8 relative"
      >
        {content}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-black/40 hover:bg-black/60 transition-colors cursor-pointer"
          >
            ✕
          </button>
        )}
      </motion.div>
    </div>
  );
};
