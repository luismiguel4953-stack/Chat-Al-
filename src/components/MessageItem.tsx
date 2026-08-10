import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Bot, User, Cpu, Sparkles, RefreshCw, Trash2, Volume2, Square } from 'lucide-react';
import { ChatMessage } from '../types';
import { CallSummary } from './CallSummary';

interface MessageItemProps {
  message: ChatMessage;
  onCopyText: (text: string) => void;
  onRegenerate?: () => void;
  onDeleteMessage?: (id: string) => void;
  voiceSettings?: {
    rate?: number;
    pitch?: number;
    voiceName?: string;
  };
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onCopyText,
  onRegenerate,
  onDeleteMessage,
  voiceSettings,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.role === 'user';

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = () => {
    onCopyText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Tu navegador no soporta síntesis de voz (Text-to-Speech).');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToRead = cleanTextForSpeech(message.content);
    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'es-ES';
    utterance.rate = voiceSettings?.rate || 1.0;
    utterance.pitch = voiceSettings?.pitch || 1.0;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    if (voiceSettings?.voiceName) {
      selectedVoice = voices.find(v => v.name === voiceSettings.voiceName);
    }
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith('es')) || voices[0];
    }
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 max-w-4xl mx-auto my-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Bot Mascot Figure Avatar */}
      {!isUser && (
        <div className="relative group shrink-0 mt-1">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-60 blur-[3px]" />
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-950 border border-[var(--accent-primary)] shadow-[0_0_15px_var(--accent-glow)] flex items-center justify-center overflow-hidden">
            {/* Eyes */}
            <div className="flex items-center gap-1">
              <span className="w-2 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] animate-pulse" />
              <span className="w-2 h-2.5 rounded-full bg-pink-500 shadow-[0_0_6px_#ff007f] animate-pulse" />
            </div>
            {/* Antenna signal */}
            <span className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_#10b981]" />
          </div>
        </div>
      )}

      {/* Message Content Container */}
      <div className={`group relative max-w-[85%] sm:max-w-[78%] flex flex-col`}>
        {/* Author Label & Timestamp Header */}
        <div className={`flex items-center gap-2 mb-1 text-[11px] font-semibold text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="accent-text font-bold flex items-center gap-1">
            {!isUser && <Bot className="w-3 h-3" />}
            {isUser ? 'Tú' : 'LM Chat AI'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">• {message.timestamp}</span>
          {message.tokens && (
            <span className="text-[9px] px-1.5 py-0.2 rounded accent-bg font-mono">
              ~{message.tokens} tokens
            </span>
          )}
        </div>

        {/* Message Bubble Shell with Speech Pointer Tail */}
        <div className="relative">
          {/* Speech Bubble Pointer Tail */}
          {!isUser ? (
            <div className="absolute -left-2 top-4 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[var(--bg-card)] filter drop-shadow-[-2px_0_1px_var(--border-subtle)]" />
          ) : (
            <div className="absolute -right-2 top-4 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[var(--accent-primary)] filter drop-shadow-[2px_0_1px_rgba(0,0,0,0.3)]" />
          )}

          {message.isCallSummary && message.callReportData ? (
            <CallSummary report={message.callReportData} isEmbedded={true} />
          ) : (
            <div
              className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed transition-all shadow-lg ${
                isUser
                  ? 'btn-accent rounded-tr-sm border border-white/20'
                  : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-sm backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
              }`}
            >
              {/* Render Formatted Text or Code Blocks */}
              <div className="prose prose-invert max-w-none text-sm space-y-3">
                {renderFormattedContent(message.content)}
              </div>
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div
          className={`flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-[11px] flex items-center gap-1 cursor-pointer"
            title="Copiar mensaje"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-mono text-[10px]">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>

          <button
            onClick={handleToggleSpeech}
            className={`p-1 rounded transition-colors text-[11px] flex items-center gap-1 cursor-pointer ${
              isSpeaking
                ? 'text-indigo-400 bg-indigo-500/20 animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={isSpeaking ? "Detener lectura de voz" : "Escuchar respuesta (Text-to-Speech)"}
          >
            {isSpeaking ? (
              <Square className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span className="font-mono text-[10px]">{isSpeaking ? 'Detener' : 'Escuchar'}</span>
          </button>

          {!isUser && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-white/10 transition-colors text-[11px] flex items-center gap-1 cursor-pointer"
              title="Volver a generar respuesta"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px]">Regenerar</span>
            </button>
          )}

          {onDeleteMessage && (
            <button
              onClick={() => onDeleteMessage(message.id)}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors text-[11px] cursor-pointer"
              title="Eliminar mensaje"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)] mt-1">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
};

// Custom Markdown / Code Block Renderer
function renderFormattedContent(content: string) {
  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add plain text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        value: content.slice(lastIndex, match.index),
      });
    }

    parts.push({
      type: 'code',
      language: match[1] || 'code',
      value: match[2].trim(),
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      value: content.slice(lastIndex),
    });
  }

  return parts.map((part, idx) => {
    if (part.type === 'code') {
      return <CodeBlock key={idx} language={part.language} code={part.value} />;
    }

    return (
      <div key={idx} className="whitespace-pre-wrap leading-relaxed">
        {formatInlineMarkdown(part.value)}
      </div>
    );
  });
}

// Code Block with Copy Button
const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-black/60 font-mono text-xs shadow-inner">
      <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/5 text-slate-400">
        <span className="text-[11px] font-bold uppercase text-indigo-400">{language}</span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-indigo-200/90 leading-normal">
        <code>{code}</code>
      </pre>
    </div>
  );
};

// Format Inline Markdown (bold, headings, bullet lists, inline code)
function formatInlineMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lIdx) => {
    // Headings
    if (line.startsWith('### ')) {
      return (
        <h3 key={lIdx} className="text-base font-bold text-indigo-300 mt-2 mb-1">
          {line.replace('### ', '')}
        </h3>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2 key={lIdx} className="text-lg font-bold text-white mt-3 mb-1">
          {line.replace('## ', '')}
        </h2>
      );
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <div key={lIdx} className="flex items-start gap-2 my-0.5 ml-2">
          <span className="text-indigo-400 font-bold">•</span>
          <span>{parseInlineStyles(line.trim().slice(2))}</span>
        </div>
      );
    }

    // Numbered points
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={lIdx} className="flex items-start gap-2 my-0.5 ml-2">
          <span className="text-indigo-400 font-bold font-mono">{numMatch[1]}.</span>
          <span>{parseInlineStyles(numMatch[2])}</span>
        </div>
      );
    }

    return <p key={lIdx} className="my-0.5">{parseInlineStyles(line)}</p>;
  });
}

function parseInlineStyles(text: string) {
  // Replace **bold** and `code`
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[12px]">{p.slice(1, -1)}</code>;
    }
    return p;
  });
}

function cleanTextForSpeech(text: string): string {
  // Replace code blocks with descriptive summary
  let clean = text.replace(/```[\s\S]*?```/g, ' Bloque de código omitido. ');
  // Remove markdown headers
  clean = clean.replace(/#{1,6}\s+/g, '');
  // Remove markdown formatting
  clean = clean.replace(/\*\*(.*?)\*\*/g, '$1');
  clean = clean.replace(/\*(.*?)\*/g, '$1');
  clean = clean.replace(/`(.*?)`/g, '$1');
  clean = clean.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  // Clean list symbols
  clean = clean.replace(/^[\s-*+]+/gm, '');
  return clean.trim();
}
