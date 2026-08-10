import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Shield, Key, LogOut, Check, AlertCircle, X, Sparkles, Activity, Calendar } from 'lucide-react';
import { AuthUser } from '../../types';
import { updateUserProfile } from '../../services/authService';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser;
  onUpdateUser: (updated: AuthUser) => void;
  onLogout: () => void;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=LM-AI-1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LM-AI-2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LM-AI-3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LM-AI-4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LM-AI-5',
];

export function UserProfileModal({ isOpen, onClose, user, onUpdateUser, onLogout }: UserProfileModalProps) {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || PRESET_AVATARS[0]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setLoading(true);
    const res = await updateUserProfile({
      fullName,
      avatar: selectedAvatar,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });
    setLoading(false);

    if (!res.success || !res.user) {
      setErrorMsg(res.error || 'Error al actualizar perfil.');
      return;
    }

    onUpdateUser(res.user);
    setSuccessMsg('¡Perfil actualizado con éxito!');
    setCurrentPassword('');
    setNewPassword('');
  };

  const formattedDate = new Date(user.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-6"
      >
        {/* Header background glow */}
        <div className="h-28 bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-emerald-900/60 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Overlay */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 mb-6">
            <div className="relative group">
              <img
                src={selectedAvatar}
                alt={user.fullName}
                className="w-24 h-24 rounded-2xl bg-zinc-950 border-4 border-zinc-900 object-cover shadow-xl"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-lg text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>IA</span>
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-black text-white">{user.fullName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  {user.role || 'Usuario'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">@{user.username} • {user.email}</p>
              <p className="text-[11px] text-zinc-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Miembro desde {formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Feedback message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Usage Stats Widget */}
          <div className="mb-6 p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Límite Diario</p>
                <p className="text-sm font-black text-white">{user.usageLimit ? `${user.usageLimit} Mensajes` : 'Ilimitado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Seguridad</p>
                <p className="text-sm font-black text-emerald-400">Verificada</p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Select Avatar */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Selecciona tu Avatar de Perfil
              </label>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`relative rounded-xl overflow-hidden p-0.5 transition-all cursor-pointer ${
                      selectedAvatar === av ? 'ring-2 ring-indigo-500 scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="Avatar" className="w-10 h-10 rounded-lg bg-zinc-950 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Change Password Section */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
              <p className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Cambiar Contraseña (Opcional)</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Contraseña actual"
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 gap-3">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Guardar Cambios</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
