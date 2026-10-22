import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Send, GraduationCap, Maximize } from 'lucide-react';
import { StudyPanel } from './StudyPanel';
import { aiService } from '../../services/ai.service';

interface ChatMessage {
  id: number;
  role: 'user' | 'professor';
  text: string;
}

const SABICHAO_AVATAR = '/images/prof-sabichao.png';

const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  role: 'professor',
  text: 'Olá! Sou o Professor Sabichão. Posso tirar dúvidas sobre os conteúdos e sobre como usar o AprovaAI. Como posso ajudar?',
};

const SUGGESTIONS = [
  'Como funciona o XP?',
  'Onde vejo meu histórico?',
  'O que é o modo treino?',
  'Onde ficam as ferramentas de estudo?',
];

const HISTORY_LIMIT = 20;

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={index} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={index}
          className="px-1 py-0.5 rounded bg-slate-100 text-[0.85em]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <img
        src={SABICHAO_AVATAR}
        alt="Professor Sabichão"
        className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
      />
      <div className="px-3.5 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200 shadow-sm flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ProfessorChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isSending]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const history = await aiService.getHistory(HISTORY_LIMIT);
        if (cancelled || history.length === 0) return;

        const mapped: ChatMessage[] = history.map((item) => ({
          id: nextId.current++,
          role: item.role === 'USER' ? 'user' : 'professor',
          text: item.content,
        }));

        setMessages([WELCOME_MESSAGE, ...mapped]);
      } catch {
        // Sem histórico disponível: mantém apenas a mensagem de boas-vindas.
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isSending) return;

    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: 'user', text },
    ]);
    setInput('');
    setIsSending(true);

    try {
      const { reply } = await aiService.sendMessage(text);
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: 'professor', text: reply },
      ]);
    } catch {
      setError('Não consegui responder agora. Tente novamente em instantes.');
    } finally {
      setIsSending(false);
    }
  };

  const showSuggestions = !isLoadingHistory && messages.length === 1;

  return (
    <StudyPanel className="w-80 sm:w-96 h-[32rem] sm:h-[36rem] max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-600 to-violet-600">
        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">Professor Sabichão</h3>
          <p className="text-[10px] font-semibold text-white/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Disponível para dúvidas
          </p>
        </div>
        <button
          type="button"
          onClick={() => {}}
          aria-label="Tela cheia"
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-colors shrink-0"
        >
          <Maximize className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60"
      >
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="relative max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-indigo-600 text-white text-sm leading-relaxed shadow-sm">
                  <span className="absolute -right-1 bottom-2 w-2 h-2 rotate-45 bg-indigo-600" />
                  {msg.text}
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className="flex items-end gap-2">
              <img
                src={SABICHAO_AVATAR}
                alt="Professor Sabichão"
                className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="relative max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white border border-slate-200 text-slate-700 text-sm leading-relaxed shadow-sm whitespace-pre-line">
                <span className="absolute -left-1 bottom-2 w-2 h-2 rotate-45 bg-white border-l border-b border-slate-200" />
                {renderInline(msg.text)}
              </div>
            </div>
          );
        })}

        {isSending && <TypingBubble />}

        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSend(suggestion)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white">
        {error && (
          <p className="mb-2 text-xs font-semibold text-rose-600">{error}</p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua dúvida..."
            disabled={isSending}
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isSending}
            aria-label="Enviar"
            className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </StudyPanel>
  );
}
