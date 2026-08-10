import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  LogIn,
  UserPlus,
  Zap
} from 'lucide-react';
import { loginUser, registerUser, requestPasswordReset, resetPassword } from '../../services/authService';
import { AuthUser } from '../../types';

interface AuthGateProps {
  onSuccess: (user: AuthUser, token: string) => void;
  onContinueAsGuest?: () => void;
}

export function AuthGate({ onSuccess, onContinueAsGuest }: AuthGateProps) {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register' | 'forgot'>('welcome');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedCodeNotice, setGeneratedCodeNotice] = useState<string | null>(null);

  // General States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Clear feedback when changing modes
  const switchMode = (newMode: 'welcome' | 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedCodeNotice(null);
  };

  // Calculate Password Strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Sin contraseña', color: 'bg-zinc-700', text: 'text-zinc-500' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Débil', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score === 2) return { score: 50, label: 'Aceptable', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score === 3) return { score: 75, label: 'Buena', color: 'bg-blue-500', text: 'text-blue-400' };
    return { score: 100, label: 'Excelente (Fuerte)', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const strength = getPasswordStrength(regPassword);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Ingresa tu correo o usuario y tu contraseña.');
      return;
    }

    setLoading(true);
    const res = await loginUser({ email: loginEmail, password: loginPassword, rememberMe });
    setLoading(false);

    if (!res.success || !res.user || !res.token) {
      setErrorMsg(res.error || 'Error al iniciar sesión.');
      return;
    }

    setSuccessMsg('¡Inicio de sesión exitoso! Accediendo a la aplicación...');
    setTimeout(() => {
      onSuccess(res.user!, res.token!);
    }, 600);
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regUsername || !regFullName || !regEmail || !regPassword) {
      setErrorMsg('Completa todos los campos requeridos.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Debes aceptar los Términos del Servicio.');
      return;
    }

    setLoading(true);
    const res = await registerUser({
      username: regUsername,
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      termsAccepted,
    });
    setLoading(false);

    if (!res.success || !res.user || !res.token) {
      setErrorMsg(res.error || 'Error al crear la cuenta.');
      return;
    }

    setSuccessMsg('¡Registro completado con éxito! Iniciando sesión...');
    setTimeout(() => {
      onSuccess(res.user!, res.token!);
    }, 800);
  };

  // Handle Forgot Request
  const handleRequestForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!forgotEmail) {
      setErrorMsg('Ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    const res = await requestPasswordReset(forgotEmail);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Error en la solicitud.');
      return;
    }

    if (res.resetCode) {
      setGeneratedCodeNotice(`Código de prueba: ${res.resetCode}`);
      setResetCodeInput(res.resetCode);
    }

    setSuccessMsg('Código de recuperación enviado. Ingrésalo a continuación.');
    setForgotStep(2);
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!resetCodeInput || !newPassword) {
      setErrorMsg('Ingresa el código y la nueva contraseña.');
      return;
    }

    setLoading(true);
    const res = await resetPassword({
      email: forgotEmail,
      code: resetCodeInput,
      newPassword,
    });
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Error al restablecer contraseña.');
      return;
    }

    setSuccessMsg('Contraseña cambiada con éxito. Ya puedes iniciar sesión.');
    setTimeout(() => {
      switchMode('login');
      setLoginEmail(forgotEmail);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080811] text-white select-none overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none -top-20 -left-20" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none -bottom-20 -right-20" />

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-zinc-900/90 border border-zinc-800/90 rounded-3xl shadow-2xl overflow-hidden my-6 backdrop-blur-xl"
      >
        {/* Top colored accent line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />

        <div className="p-6 sm:p-8">
          {/* Header Branding & Welcome Presentation */}
          <div className="flex flex-col items-center text-center mb-6">
            {/* Mascot Avatar Icon */}
            <div className="relative mb-3 group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 opacity-75 blur-md animate-pulse" />
              <div className="relative w-18 h-18 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-10 h-10 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-white rounded-lg text-[9px] font-extrabold flex items-center gap-0.5 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* App Name Display */}
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-100 to-pink-300 bg-clip-text text-transparent flex items-center justify-center gap-2">
              LM Chat AI <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
            </h1>
            <p className="text-xs text-zinc-300 mt-1.5 max-w-sm leading-relaxed font-medium">
              {mode === 'welcome' && '¡Bienvenido! La plataforma inteligente de chat con dictado por voz, modelos rápidos y personalización ciberpunk.'}
              {mode === 'login' && 'Inicia sesión para acceder a tus conversaciones e historial guardado'}
              {mode === 'register' && 'Crea tu nueva cuenta para desbloquear todas las funciones IA'}
              {mode === 'forgot' && 'Restablece el acceso a tu cuenta'}
            </p>

            {/* Feature Highlights Chips for Welcome Screen */}
            {(mode === 'welcome' || mode === 'login') && (
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[10px] font-semibold text-zinc-300">
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                  ⚡ Streaming Ultrarrápido
                </span>
                <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 flex items-center gap-1">
                  🎤 Dictado de Voz
                </span>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1">
                  🎨 Tema Cyberpunk Neón
                </span>
              </div>
            )}
          </div>

          {/* Tab Navigation Pill for Welcome Screen Mode Switch */}
          {mode !== 'forgot' && (
            <div className="flex p-1 bg-zinc-950/90 border border-zinc-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => switchMode('welcome')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'welcome' || mode === 'login'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Bienvenida & Login</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Crear Cuenta</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p>{successMsg}</p>
                  {generatedCodeNotice && (
                    <p className="font-mono text-emerald-200 mt-1 font-bold">{generatedCodeNotice}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* FORM 1: WELCOME & LOGIN */}
          {(mode === 'login' || mode === 'welcome') && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Correo Electrónico o Usuario 📧</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Chat Login</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="tu_correo@ejemplo.com o usuario"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Contraseña 🔒
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Recordarme</span>
                </label>

                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar a LM Chat AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>¿No tienes cuenta? Crear Cuenta Gratis</span>
                </button>

                {onContinueAsGuest && (
                  <button
                    type="button"
                    onClick={onContinueAsGuest}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-1.5 mx-auto py-1"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Explorar como Invitado (Modo Demo)</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* FORM 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Usuario
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                    <input
                      type="text"
                      required
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="usuario"
                      className="w-full pl-8 pr-3 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Luis Miguel"
                    className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Correo Electrónico 📧
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full pl-8 pr-3 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Contraseña 🔒
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-8 pr-9 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {regPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400">Fuerza de la clave:</span>
                      <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className={`w-full px-3 py-2 bg-zinc-800/80 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 ${
                    regConfirmPassword && regConfirmPassword !== regPassword
                      ? 'border-rose-500/80 focus:ring-rose-500'
                      : 'border-zinc-700/80 focus:ring-emerald-500'
                  }`}
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-emerald-600 focus:ring-emerald-500 mt-0.5"
                  />
                  <span className="text-[11px] leading-tight text-zinc-400">
                    Acepto los Términos del Servicio y Política de Privacidad de LM Chat AI.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Crear Cuenta Gratis</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORM 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                <form onSubmit={handleRequestForgot} className="space-y-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ingresa tu correo para recibir las instrucciones de recuperación de contraseña.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="tu_correo@ejemplo.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Solicitar Recuperación</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Código de Verificación (6 dígitos)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCodeInput}
                      onChange={(e) => setResetCodeInput(e.target.value)}
                      placeholder="123456"
                      className="w-full text-center tracking-widest font-mono text-lg py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Restablecer Contraseña</span>
                    )}
                  </button>
                </form>
              )}

              <div className="text-center pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  ← Volver al Inicio de Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
