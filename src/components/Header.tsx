import React, { useState } from 'react';
import { 
  Menu, 
  Sun, 
  Moon, 
  Trash2, 
  Settings, 
  ChevronDown, 
  Sparkles, 
  Zap,
  User,
  LogIn,
  Share2,
  Copy,
  Check,
  Globe,
  ExternalLink,
  X,
  PhoneCall,
  Volume2,
  Trophy,
  Bot,
  Crown,
  BookOpen,
  Palette,
  ArrowLeft,
  Home
} from 'lucide-react';
import { AVAILABLE_MODELS } from '../data/initialData';
import { AuthUser } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onClearChat: () => void;
  onOpenSettings: () => void;
  onOpenAICall?: () => void;
  onOpenAudioHistory?: () => void;
  onOpenDevGame?: () => void;
  onOpenJarvisLive?: () => void;
  onOpenProModal?: () => void;
  onOpenTutorial?: () => void;
  onOpenThemeModal?: () => void;
  onGoHome?: () => void;
  conversationTitle?: string;
  user: AuthUser | null;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  selectedModel,
  onSelectModel,
  theme,
  onToggleTheme,
  onClearChat,
  onOpenSettings,
  onOpenAICall,
  onOpenAudioHistory,
  onOpenDevGame,
  onOpenJarvisLive,
  onOpenProModal,
  onOpenTutorial,
  onOpenThemeModal,
  onGoHome,
  conversationTitle,
  user,
  onOpenAuthModal,
  onOpenProfileModal,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  const publicUrl = typeof window !== 'undefined' 
    ? (window.location.href.includes('ais-dev') 
        ? window.location.href.replace('ais-dev', 'ais-pre') 
        : window.location.href)
    : 'https://ais-pre-eh4hozmwqvmtzjmi6k5s2d-695832131344.us-east1.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="h-16 border-b border-[var(--border-subtle)] flex items-center justify-between px-3 lg:px-8 bg-black/10 backdrop-blur-md z-30 select-none">
      {/* Left Section: Sidebar Toggle, Back/Home Button & App Status */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title={sidebarOpen ? "Cerrar panel lateral" : "Abrir panel lateral"}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Explicit Prominent "Volver / Inicio" Button */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Regresar al Menú Principal / Pantalla de Inicio"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="inline font-semibold">Volver</span>
          </button>
        )}

        {/* System Online Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Online
          </span>
        </div>

        <div className="hidden md:block h-4 w-[1px] bg-white/10" />

        {/* Active Title or Breadcrumb */}
        <div className="text-xs font-semibold text-slate-200 truncate max-w-[120px] sm:max-w-xs flex items-center gap-1">
          <span className="text-slate-500 hidden lg:inline">Inicio</span>
          <span className="text-slate-600 hidden lg:inline">/</span>
          <span className="text-cyan-300 font-medium truncate">{conversationTitle || 'Panel Principal'}</span>
        </div>
      </div>

      {/* Center Section: Model Selector Pill */}
      <div className="relative">
        <button
          onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          className="py-1.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-medium text-slate-200 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{currentModel.name}</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono hidden sm:inline">
            {currentModel.badge}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Options */}
        {modelDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setModelDropdownOpen(false)}
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-2 shadow-2xl z-50">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1">
                Seleccionar Motor de IA
              </div>
              {AVAILABLE_MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectModel(m.id);
                    setModelDropdownOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex flex-col gap-0.5 mb-1 cursor-pointer ${
                    m.id === selectedModel
                      ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-200'
                      : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{m.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                      {m.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{m.description}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right Section: Controls, User Auth & Theme Toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* AI Call & Report Button */}
        {onOpenAICall && (
          <button
            onClick={onOpenAICall}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            title="Llamada de Voz IA e Informe Automático"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
            <span className="hidden sm:inline">Llamada IA</span>
          </button>
        )}

        {/* Public Share / Publish Button */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-600/20"
          title="Publicar y Compartir Inteligencia Artificial"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Publicar App</span>
        </button>

        {/* User Auth Profile Button / Login Button */}
        {user ? (
          <button
            onClick={onOpenProfileModal}
            className="py-1 px-2 sm:px-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/80 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            title="Mi Perfil y Configuración de Cuenta"
          >
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
              alt={user.fullName}
              className="w-6 h-6 rounded-lg bg-zinc-950 object-cover border border-indigo-500/40"
            />
            <span className="hidden sm:inline font-bold text-xs truncate max-w-[90px]">{user.fullName.split(' ')[0]}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </button>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Iniciar Sesión</span>
          </button>
        )}

        {/* Dev Game Mode 100 Levels Button */}
        {onOpenDevGame && (
          <button
            onClick={onOpenDevGame}
            className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Modo de Juego Desarrollador de 100 Niveles"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">100 Niveles</span>
          </button>
        )}

        {/* JARVIS Live Robot Voice Game Button */}
        {onOpenJarvisLive && (
          <button
            onClick={onOpenJarvisLive}
            className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Escuche nuestra voz, hable con nosotros - Robot JARVIS"
          >
            <Bot className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden md:inline">JARVIS Vivo</span>
          </button>
        )}

        {/* Pro / Premium Upgrade Button */}
        {onOpenProModal && (
          <button
            onClick={onOpenProModal}
            className="py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Planes Pro & Premium"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Plan Pro</span>
          </button>
        )}

        {/* Clear Chat Button */}
        <button
          onClick={onClearChat}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          title="Limpiar conversación actual"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={theme === 'dark' ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Configuración"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* PUBLIC SHARE & PUBLISH MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Publicar tu Inteligencia Artificial <Sparkles className="w-4 h-4 text-cyan-400" />
                  </h3>
                  <p className="text-xs text-zinc-400">Comparte el enlace web público para que cualquiera pueda usar LM Chat AI</p>
                </div>
              </div>
              <button
                onClick={() => setShareModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Public Link Box */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  🌐 Enlace Web Público Listo para Compartir:
                </label>
                <div className="flex items-center gap-2 p-2 bg-zinc-950 border border-zinc-800 rounded-2xl">
                  <input
                    type="text"
                    readOnly
                    value={publicUrl}
                    className="w-full bg-transparent text-xs text-cyan-300 font-mono px-2 focus:outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="py-2 px-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Enlace</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Deployment / Sharing steps info */}
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2.5 text-xs text-zinc-300">
                <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Opciones de Publicación en AI Studio:
                </div>
                <ul className="list-disc pl-4 space-y-1.5 text-zinc-400 text-[11px]">
                  <li>
                    <strong className="text-zinc-200">Enlace Compartido:</strong> El enlace copiado arriba permite a otros probar tu aplicación en la web.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Botón Share en AI Studio:</strong> Puedes pulsar el botón <span className="text-indigo-400 font-semibold">Share</span> en la barra superior derecha de la pantalla de Google AI Studio para generar una URL pública permanente o publicar una demo.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Despliegue en Cloud Run:</strong> Si deseas hospedar en producción con tu propio dominio, puedes elegir la opción <span className="text-cyan-400 font-semibold">Deploy to Cloud Run</span> o exportar el código fuente a tu repositorio de GitHub.
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Abrir App en Nueva Pestaña</span>
                </a>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
