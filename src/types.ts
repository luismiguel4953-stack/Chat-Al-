export type Role = 'user' | 'assistant' | 'system';

export interface CallReport {
  id: string;
  title: string;
  durationSeconds: number;
  date: string;
  model: string;
  executiveSummary: string;
  keyPoints: string[];
  actionItems: { text: string; completed: boolean; priority?: 'high' | 'medium' | 'low' }[];
  sentiment?: 'positivo' | 'neutral' | 'constructivo';
  participants?: string[];
}

export interface AudioItem {
  id: string;
  title: string;
  durationSeconds: number;
  timestamp: string;
  type: 'user_recording' | 'assistant_speech';
  audioUrl?: string;
  transcript?: string;
  conversationId?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string;
  tokens?: number;
  status?: 'sending' | 'thinking' | 'done' | 'error';
  attachment?: {
    type: 'image' | 'file';
    name: string;
    url?: string;
  };
  audioUrl?: string;
  isCallSummary?: boolean;
  callReportData?: CallReport;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  model: string;
  isPinned?: boolean;
}

export interface DevLevel {
  id: number;
  title: string;
  category: 'HTML & CSS' | 'Lógica JS' | 'React & UI' | 'Python & Algoritmos' | 'Full-Stack AI';
  description: string;
  task: string;
  codeTemplate: string;
  expectedOutputOrTest: string;
  hint: string;
  xpReward: number;
  isProRequired?: boolean;
}

export interface UserGameProgress {
  maxUnlockedLevel: number;
  completedLevels: number[];
  totalXp: number;
  currentStreak: number;
  badges: string[];
}

export type AppThemeColor = 'cyan' | 'matrix' | 'purple' | 'gold' | 'sunset' | 'cyberpunk';
export type PremiumTier = 'free' | 'pro' | 'elite_lm';

export interface AppSettings {
  theme: 'dark' | 'light';
  selectedModel: string;
  systemInstruction: string;
  temperature: number;
  autoScroll: boolean;
  // Ultra-Customization Settings
  accentColor: AppThemeColor;
  backgroundStyle: 'dark' | 'grid' | 'cosmos' | 'oled' | 'cyberpunk';
  personaPreset: 'general' | 'coder' | 'creative' | 'executive' | 'tutor';
  // Voice & Speech Settings
  autoVoiceResponse: boolean;
  voiceSpeed: number; // 0.5 to 1.5
  voicePitch: number; // 0.5 to 1.5
  voiceName?: string;
  // LM Branding & Theme
  lmThemePreset: AppThemeColor;
  customLogoText: string;
}

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar?: string;
  createdAt: string;
  usageCount?: number;
  usageLimit?: number;
  role?: 'user' | 'admin' | 'premium';
  hasVoiceBiometrics?: boolean;
  hasFaceBiometrics?: boolean;
  voicePassphrase?: string;
  preferences?: {
    theme?: 'dark' | 'light';
    selectedModel?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  isPaid?: boolean;
}
