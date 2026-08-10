import { ChatMessage } from '../types';

export interface ChatRequestPayload {
  messages: { role: string; content: string }[];
  systemInstruction?: string;
  model?: string;
  temperature?: number;
}

export interface ChatResponseData {
  success: boolean;
  text: string;
  source?: string;
  model?: string;
  tokensEstimated?: number;
  notice?: string;
  error?: string;
}

export async function sendChatMessageStream(
  payload: ChatRequestPayload,
  onChunk: (chunk: string) => void
): Promise<string> {
  try {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Server status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.text) {
            fullText += parsed.text;
            onChunk(parsed.text);
          }
        } catch (e) {}
      }
    }

    if (fullText) return fullText;
    throw new Error("Empty response stream");
  } catch (err: any) {
    console.warn("SSE Streaming failed, falling back to standard completion:", err);
    const fallbackData = await sendChatMessage(payload);
    onChunk(fallbackData.text);
    return fallbackData.text;
  }
}

export async function sendChatMessage(payload: ChatRequestPayload): Promise<ChatResponseData> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      throw new Error(errorJson.error || `Server responded with status ${response.status}`);
    }

    const data: ChatResponseData = await response.json();
    return data;
  } catch (err: any) {
    console.warn("API request failed, generating client-side fallback:", err);

    // Fallback if backend server is unreachable
    const lastMsg = payload.messages[payload.messages.length - 1]?.content || "";
    return {
      success: true,
      source: "client-fallback",
      model: payload.model || "LM-Titan-v4",
      text: generateOfflineResponse(lastMsg),
      tokensEstimated: Math.round(lastMsg.length / 3),
      notice: "Modo cliente offline activo.",
    };
  }
}

export async function generateAiImage(prompt: string, style: string = 'futuristic'): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, style }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al conectar con el servidor de imágenes.' };
  }
}

function generateOfflineResponse(userText: string): string {
  const clean = userText.toLowerCase();
  
  if (clean.includes("hola") || clean.includes("buenas") || clean.includes("hey")) {
    return "¡Hola! Soy **LM Chat AI**. Estoy listo para responder tus consultas, organizar tus proyectos o ayudarte con desarrollo de software.";
  }

  if (clean.includes("codigo") || clean.includes("react") || clean.includes("typescript")) {
    return "### 💡 Snippet de Ejemplo\n\n```typescript\n// Ejemplo de manejo de estado en React\nimport { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <button onClick={() => setCount(c => c + 1)}>\n      Clicks: {count}\n    </button>\n  );\n}\n```\n\n¿Quieres que profundicemos en algún aspecto técnico?";
  }

  return `Procesado: **"${userText.slice(0, 80)}"**.\n\nPuedes personalizar esta respuesta conectando la clave de API de Gemini en la barra de Ajustes o realizando consultas específicas sobre desarrollo, resúmenes o planificación.`;
}
