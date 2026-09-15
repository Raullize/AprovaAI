import { useState, useRef, useEffect } from 'react';
import { Send, GraduationCap, Maximize } from 'lucide-react';

interface ChatMessage {
  id: number;
  role: 'user' | 'professor';
  text: string;
}

const SABICHAO_AVATAR = '/images/prof-sabichao.png';

const WELCOME_MESSAGE: ChatMessage = {
  id: 0,
  role: 'professor',
  text: 'Olá! Sou o Professor Sabichão. Em breve vou poder tirar suas dúvidas sobre os simulados e conteúdos. Por enquanto, fique à vontade para escrever aqui.',
};

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
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, typing]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: 'user', text },
    ]);
    setInput('');
    setTyping(true);

    // Resposta mockada — sem integração real por enquanto
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: 'professor',
          text: 'Excelente dúvida! Estou estudando ainda mais para te responder com precisão. Continue praticando enquanto isso.',
        },
      ]);
    }, 1400);
  };

  return (
    <div className="w-80 sm:w-96 h-[32rem] sm:h-[36rem] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-2xl shadow-slate-900/15 border border-slate-200 overflow-hidden flex flex-col">
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
              <div className="relative max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white border border-slate-200 text-slate-700 text-sm leading-relaxed shadow-sm">
                <span className="absolute -left-1 bottom-2 w-2 h-2 rotate-45 bg-white border-l border-b border-slate-200" />
                {msg.text}
              </div>
            </div>
          );
        })}

        {typing && <TypingBubble />}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Digite sua dúvida..."
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label="Enviar"
            className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
