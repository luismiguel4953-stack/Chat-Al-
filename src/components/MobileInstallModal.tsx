import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Smartphone, 
  Download, 
  Github, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Share2,
  Copy,
  Check,
  PackageCheck
} from 'lucide-react';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({ isOpen, onClose }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg bg-[#0f1017] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative text-slate-200 select-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
                <img src="/logo.jpg" alt="LM Chat AI" className="w-full h-full object-cover rounded-[14px]" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                  <span>Instalar en Celular / APK</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">v4.2</span>
                </h2>
                <p className="text-xs text-indigo-300">Descargar APK o agregar a la pantalla de inicio</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
            {/* Important notice regarding APK parsing */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-300">
                <span>⚠️ ¿Por qué aparece "Error al analizar el paquete"?</span>
              </p>
              <p className="text-[11px] text-amber-200/90">
                Los teléfonos Android requieren que el APK sea compilado por el SDK de Android y Gradle. La compilación oficial del archivo <strong>.APK nativo e instalable</strong> se realiza automáticamente a través de <strong>GitHub Actions</strong> al exportar el proyecto.
              </p>
            </div>

            {/* Direct App Link for Phone */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 mb-0.5">Enlace de la App para tu Celular:</p>
                <p className="text-xs text-slate-300 font-mono truncate">{currentUrl}</p>
              </div>
              <button
                onClick={handleCopyUrl}
                className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-md"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? '¡Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>

            {/* Option 1: GitHub APK Auto-Build */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-400 uppercase tracking-wider">
                  <Github className="w-4 h-4" />
                  <span>Método 1: APK Android desde GitHub Actions</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">APK Compilado</span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                El flujo de compilación de Android con Capacitor y Gradle (`.github/workflows/build-apk.yml`) ya está configurado.
              </p>
              <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/20 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <PackageCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pasos para obtener el archivo .APK:</span>
                </div>
                <ol className="text-[11px] text-slate-300 space-y-1.5 pl-5 list-decimal">
                  <li>Ve al menú superior derecho de <strong>AI Studio</strong> y haz clic en <strong>Exportar a GitHub</strong>.</li>
                  <li>Abre tu nuevo repositorio en GitHub y ve a la pestaña <strong>Actions</strong>.</li>
                  <li>GitHub compilará automáticamente el APK. Al terminar, descarga el archivo <strong>LM-Chat-AI-Android-APK.zip</strong> y transfiérelo o ábrelo en tu teléfono Android.</li>
                </ol>
              </div>
            </div>

            {/* Option 2: Instant PWA Direct Installation */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-900 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-xs text-indigo-300 uppercase tracking-wider">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>Método 2: Instalación Directa (PWA / App Web)</span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">Sin descargas</span>
              </div>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Instala <strong>LM Chat AI</strong> directamente en tu pantalla de inicio en Android o iPhone con el nuevo logo e interfaz nativa:
              </p>
              <ol className="text-xs text-slate-300 space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Abre este enlace en el navegador de tu teléfono (<strong>Chrome</strong> para Android o <strong>Safari</strong> para iOS).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Presiona el menú de opciones (3 puntos en Chrome o botón Compartir en Safari) y selecciona <strong>"Añadir a la pantalla de inicio"</strong> o <strong>"Instalar aplicación"</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/40 text-indigo-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Aparecerá el icono de la aplicación en el menú de tu celular con pantalla de inicio animada.</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Footer Close Button */}
          <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preparado para GitHub & Mobile</span>
            </span>
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

