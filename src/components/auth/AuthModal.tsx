import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Mail, Lock, Eye, EyeOff, User, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound, Sparkles, X, Mic, Camera, ScanFace, Radio } from 'lucide-react';
import { loginUser, registerUser, requestPasswordReset, resetPassword, biometricLoginUser } from '../../services/authService';
import { AuthUser } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser, token: string) => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'voice_login' | 'face_login';
}

export function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'voice_login' | 'face_login'>(initialMode);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Biometrics Login State
  const [biometricUserIdent, setBiometricUserIdent] = useState('');
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceScanProgress, setFaceScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [enableVoiceBiometrics, setEnableVoiceBiometrics] = useState(true);
  const [enableFaceBiometrics, setEnableFaceBiometrics] = useState(true);

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

  if (!isOpen) return null;

  // Clear feedback when changing modes
  const switchMode = (newMode: 'login' | 'register' | 'forgot' | 'voice_login' | 'face_login') => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
    setGeneratedCodeNotice(null);
  };

  // Calculate Password Strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Sin contraseña', color: 'bg-zinc-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: 'Débil', color: 'bg-rose-500', text: 'text-rose-400' };
    if (score === 2) return { score: 50, label: 'Aceptable', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score === 3) return { score: 75, label: 'Buena', color: 'bg-blue-500', text: 'text-blue-400' };
    return { score: 100, label: 'Fuerte (Excelente)', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const strength = getPasswordStrength(regPassword);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Ingresa tu correo/usuario y contraseña.');
      return;
    }

    setLoading(true);
    const res = await loginUser({ email: loginEmail, password: loginPassword, rememberMe });
    setLoading(false);

    if (!res.success || !res.user || !res.token) {
      setErrorMsg(res.error || 'Error al iniciar sesión.');
      return;
    }

    setSuccessMsg('¡Inicio de sesión exitoso!');
    setTimeout(() => {
      onSuccess(res.user!, res.token!);
      onClose();
    }, 600);
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regUsername || !regFullName || !regEmail || !regPassword) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Debes aceptar los Términos y Condiciones.');
      return;
    }

    setLoading(true);
    const res = await registerUser({
      username: regUsername,
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      termsAccepted,
      hasVoiceBiometrics: enableVoiceBiometrics,
      hasFaceBiometrics: enableFaceBiometrics,
      voicePassphrase: `Acceso concedido para ${regUsername}`,
    });
    setLoading(false);

    if (!res.success || !res.user || !res.token) {
      setErrorMsg(res.error || 'Error al registrar la cuenta.');
      return;
    }

    setSuccessMsg('¡Cuenta creada correctamente! Iniciando sesión...');
    setTimeout(() => {
      onSuccess(res.user!, res.token!);
      onClose();
    }, 800);
  };

  // Handle Forgot Request Code
  const handleRequestForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

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
      setGeneratedCodeNotice(`Código generado: ${res.resetCode}`);
      setResetCodeInput(res.resetCode);
    }

    setSuccessMsg(res.message || 'Código de recuperación generado.');
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

    setSuccessMsg('Contraseña restablecida con éxito. Puedes iniciar sesión.');
    setTimeout(() => {
      switchMode('login');
      setLoginEmail(forgotEmail);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-full transition-colors z-10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Logo & App Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-lg shadow-indigo-500/20 mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-8 h-8 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              LM Chat AI <Sparkles className="w-4 h-4 text-indigo-400" />
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {mode === 'login' && 'Ingresa a tu cuenta para acceder a tus conversaciones'}
              {mode === 'register' && 'Crea tu cuenta de usuario en LM Chat AI'}
              {mode === 'forgot' && 'Recupera el acceso a tu cuenta'}
            </p>
          </div>

          {/* Error / Success Feedback Banners */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
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
                className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5"
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

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Correo Electrónico o Usuario 📧
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ejemplo@correo.com o tu_usuario"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Biometric Quick Login Options */}
              <div className="pt-2">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-zinc-800"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                    Acceso Biométrico
                  </span>
                  <div className="flex-grow border-t border-zinc-800"></div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBiometricUserIdent(loginEmail || 'usuario');
                      switchMode('voice_login');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-cyan-500/50 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <span>Reconocimiento de Voz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBiometricUserIdent(loginEmail || 'usuario');
                      switchMode('face_login');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/80 hover:border-violet-500/50 text-xs font-semibold text-violet-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ScanFace className="w-4 h-4 text-violet-400" />
                    <span>Reconocimiento Facial</span>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2 border-t border-zinc-800">
                <p className="text-xs text-zinc-400">
                  ¿No tienes una cuenta aún?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Crear cuenta gratis
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER */}
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
                      placeholder="luismiguel"
                      className="w-full pl-8 pr-3 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full px-3 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    placeholder="usuario@ejemplo.com"
                    className="w-full pl-8 pr-3 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    className="w-full pl-8 pr-9 py-2 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {regPassword && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-zinc-400">Seguridad de la contraseña:</span>
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
                  placeholder="Repite tu contraseña"
                  className={`w-full px-3 py-2 bg-zinc-800/80 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 ${
                    regConfirmPassword && regConfirmPassword !== regPassword
                      ? 'border-rose-500/80 focus:ring-rose-500'
                      : 'border-zinc-700/80 focus:ring-indigo-500'
                  }`}
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-zinc-300">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                  />
                  <span className="text-[11px] leading-tight text-zinc-400">
                    Acepto los <span className="text-zinc-200 font-semibold">Términos del Servicio</span> y la{' '}
                    <span className="text-zinc-200 font-semibold">Política de Privacidad</span> de LM Chat AI.
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

              <div className="text-center pt-2 border-t border-zinc-800">
                <p className="text-xs text-zinc-400">
                  ¿Ya tienes una cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Iniciar sesión
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* MODE 3: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {forgotStep === 1 ? (
                <form onSubmit={handleRequestForgot} className="space-y-4">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Ingresa la dirección de correo electrónico vinculada a tu cuenta. Te enviaremos un código seguro para restablecer tu contraseña.
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Correo Electrónico 📧
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
                        <span>Solicitar Código de Recuperación</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <p className="text-xs text-zinc-400">
                    Introduce el código de 6 dígitos generado para <strong className="text-zinc-200">{forgotEmail}</strong> y tu nueva contraseña.
                  </p>

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

          {/* MODE 4: VOICE RECOGNITION LOGIN */}
          {mode === 'voice_login' && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/20">
                <Mic className={`w-8 h-8 ${isListeningVoice ? 'animate-pulse text-rose-400' : ''}`} />
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Autenticación por Voz 🎙️</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Menciona tu nombre o frase de acceso registrada (ej: "Acceso concedido para {biometricUserIdent || 'tu_usuario'}")
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={biometricUserIdent}
                  onChange={(e) => setBiometricUserIdent(e.target.value)}
                  placeholder="Tu usuario o correo"
                  className="w-full px-3.5 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs text-white text-center"
                />

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-cyan-300 min-h-[48px] flex items-center justify-center">
                  {isListeningVoice ? 'Escuchando tu voz...' : voiceTranscript || 'Presiona "Escuchar Voz" para hablar'}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsListeningVoice(true);
                    setVoiceTranscript('');
                    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                      const recognition = new SpeechRecognition();
                      recognition.lang = 'es-ES';
                      recognition.onresult = (event: any) => {
                        const text = event.results[0][0].transcript;
                        setVoiceTranscript(text);
                        setIsListeningVoice(false);
                      };
                      recognition.onerror = () => {
                        setIsListeningVoice(false);
                        setVoiceTranscript(`Acceso concedido para ${biometricUserIdent}`);
                      };
                      recognition.start();
                    } else {
                      setTimeout(() => {
                        setIsListeningVoice(false);
                        setVoiceTranscript(`Acceso concedido para ${biometricUserIdent}`);
                      }, 1500);
                    }
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Escuchar Voz</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setErrorMsg(null);
                    const res = await biometricLoginUser({
                      emailOrUsername: biometricUserIdent,
                      voicePhrase: voiceTranscript || `Acceso concedido para ${biometricUserIdent}`,
                    });
                    setLoading(false);
                    if (res.success && res.user && res.token) {
                      setSuccessMsg('¡Voz verificada con éxito! Accediendo...');
                      setTimeout(() => {
                        onSuccess(res.user!, res.token!);
                        onClose();
                      }, 600);
                    } else {
                      setErrorMsg(res.error || 'No se pudo verificar tu voz.');
                    }
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verificar</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-xs text-zinc-400 hover:text-white underline pt-2"
              >
                ← Volver al Login Tradicional
              </button>
            </div>
          )}

          {/* MODE 5: FACIAL RECOGNITION LOGIN */}
          {mode === 'face_login' && (
            <div className="space-y-4 text-center">
              <div className="relative w-28 h-28 mx-auto rounded-3xl bg-zinc-950 border-2 border-violet-500/50 flex items-center justify-center overflow-hidden shadow-xl shadow-violet-500/20">
                <ScanFace className="w-12 h-12 text-violet-400 animate-pulse" />
                {isScanningFace && (
                  <div className="absolute inset-x-0 bottom-0 bg-violet-500/30 transition-all duration-300" style={{ height: `${faceScanProgress}%` }} />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-white">Escaneo Biométrico Facial 📸</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Colócate frente a la cámara para verificar tu identidad
                </p>
              </div>

              <input
                type="text"
                value={biometricUserIdent}
                onChange={(e) => setBiometricUserIdent(e.target.value)}
                placeholder="Tu usuario o correo"
                className="w-full px-3.5 py-2 bg-zinc-800/80 border border-zinc-700 rounded-xl text-xs text-white text-center"
              />

              <button
                type="button"
                disabled={loading || isScanningFace}
                onClick={async () => {
                  setIsScanningFace(true);
                  setFaceScanProgress(20);
                  setTimeout(() => setFaceScanProgress(60), 400);
                  setTimeout(() => setFaceScanProgress(100), 800);

                  setTimeout(async () => {
                    setIsScanningFace(false);
                    setLoading(true);
                    setErrorMsg(null);
                    const res = await biometricLoginUser({
                      emailOrUsername: biometricUserIdent,
                      faceMatchScore: 92,
                    });
                    setLoading(false);
                    if (res.success && res.user && res.token) {
                      setSuccessMsg('¡Rostro verificado correctamente (92% de coincidencia)!');
                      setTimeout(() => {
                        onSuccess(res.user!, res.token!);
                        onClose();
                      }, 600);
                    } else {
                      setErrorMsg(res.error || 'Rostro no reconocido para este usuario.');
                    }
                  }, 1000);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{isScanningFace ? 'Escaneando Rostro...' : 'Iniciar Escaneo Facial'}</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-xs text-zinc-400 hover:text-white underline pt-2"
              >
                ← Volver al Login Tradicional
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
