import { AuthUser } from '../types';

const TOKEN_KEY = 'lm_chat_ai_token';

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
  message?: string;
  resetCode?: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function registerUser(payload: {
  username: string;
  fullName: string;
  email: string;
  password: string;
  termsAccepted: boolean;
  hasVoiceBiometrics?: boolean;
  hasFaceBiometrics?: boolean;
  voicePassphrase?: string;
  faceEmbedding?: string;
  avatar?: string;
}): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.token) {
      setStoredToken(data.token);
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al conectar con el servidor.' };
  }
}

export async function biometricLoginUser(payload: {
  emailOrUsername: string;
  voicePhrase?: string;
  faceMatchScore?: number;
}): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/biometric-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.token) {
      setStoredToken(data.token);
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Error en la verificación biométrica.' };
  }
}

export async function loginUser(payload: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success && data.token) {
      setStoredToken(data.token);
    }
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al conectar con el servidor.' };
  }
}

export async function fetchCurrentUser(): Promise<AuthResponse> {
  const token = getStoredToken();
  if (!token) {
    return { success: false, error: 'No hay token almacenado.' };
  }
  try {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      setStoredToken(null);
      return { success: false, error: 'Sesión expirada.' };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al verificar sesión.' };
  }
}

export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Error en la solicitud.' };
  }
}

export async function resetPassword(payload: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al restablecer la contraseña.' };
  }
}

export async function updateUserProfile(payload: {
  fullName?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
  preferences?: {
    theme?: 'dark' | 'light';
    selectedModel?: string;
  };
}): Promise<AuthResponse> {
  const token = getStoredToken();
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar perfil.' };
  }
}

export function logoutUser(): void {
  setStoredToken(null);
}
