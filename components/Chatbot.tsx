
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { supabase } from '../lib/supabaseClient';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatbotProps {
  isOpen?: boolean;
  toggleOpen?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen: propIsOpen, toggleOpen }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use prop if available, otherwise internal state
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (toggleOpen) {
      toggleOpen();
    } else {
      setInternalIsOpen(val);
    }
  };
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Olá! Sou o assistente virtual do Tio Michael. Como posso ajudar você a planejar sua viagem mágica para Orlando?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatInstance = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasNewPostToday, setHasNewPostToday] = useState(false);

  useEffect(() => {
    checkNewPosts();
  }, []);

  const checkNewPosts = async () => {
    // Check if there is a published post created TODAY
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('posts')
      .select('created_at')
      .eq('status', 'published')
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .limit(1);

    if (data && data.length > 0) {
      setHasNewPostToday(true);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initChat = () => {
    if (!chatInstance.current) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
        console.error("Gemini API Key is missing or invalid.");
        setMessages(prev => [...prev, { role: 'model', text: "Erro de configuração: Chave de API inválida." }]);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      chatInstance.current = ai.chats.create({
        model: 'gemini-2.0-flash',
        config: {
          systemInstruction: `Você é o assistente virtual do "Tio Michael - Orlando Travel VIP". 
          Sua personalidade é amigável, entusiasmada e prestativa. 
          Seu objetivo é responder perguntas sobre pacotes de viagem, roteiros em Orlando, dicas de parques (Disney, Universal), e serviços de Personal Shopper e Transfer.
          Informações principais:
          - Oferecemos Guia Especialista, Transfers VIP e Personal Shopper.
          - Destinos: Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom, Universal Studios, Islands of Adventure, SeaWorld e Outlets.
          - Próximas saídas: Janeiro, Maio e Julho de 2026.
          - Valores aproximados: R$ 9.800 a R$ 15.200.
          Sempre incentive o usuário a falar diretamente com o Tio Michael no WhatsApp para fechamentos e detalhes personalizados. 
          Responda em Português do Brasil.`,
        },
      });
    }
  };

  // --- Realtime Support State ---
  const [chatMode, setChatMode] = useState<'selection' | 'ai' | 'human'>('selection');
  const [chatId, setChatId] = useState<string | null>(null);
  const [visitorToken, setVisitorToken] = useState('');

  useEffect(() => {
    // 1. Initialize Visitor Token
    let token = localStorage.getItem('tio_michael_visitor_token');
    if (!token) {
      token = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('tio_michael_visitor_token', token);
    }
    setVisitorToken(token);

    // 2. Check for existing active chat
    checkActiveChat(token);
  }, []);

  useEffect(() => {
    if (!chatId || !isOpen || chatMode !== 'human') return;

    // 3. Subscribe to Realtime Messages
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${chatId}` }, (payload) => {
        const newMessage = payload.new as any;
        if (newMessage.sender !== 'visitor') {
          setMessages(prev => [...prev, { role: 'model', text: newMessage.content }]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [chatId, isOpen, chatMode]);

  const checkActiveChat = async (token: string) => {
    const { data } = await supabase.from('support_chats').select('id, status').eq('visitor_token', token).eq('status', 'active').single();
    if (data) {
      setChatId(data.id);
      setChatMode('human');
      // Load history? (Optional for now, maybe just last few)
      const { data: history } = await supabase.from('chat_messages').select('*').eq('chat_id', data.id).order('created_at', { ascending: true });
      if (history) {
        setMessages(history.map((h: any) => ({
          role: h.sender === 'visitor' ? 'user' : 'model',
          text: h.content
        })));
      }
    } else {
      setChatMode('selection');
    }
  };

  const startHumanChat = async () => {
    setChatMode('human');
    // Create Chat if not exists
    if (!chatId) {
      const { data, error } = await supabase.from('support_chats').insert([{ visitor_token: visitorToken, visitor_name: 'Visitante' }]).select().single();
      if (data) {
        setChatId(data.id);
        setMessages(prev => [...prev, { role: 'model', text: 'Conectando você a um atendente humano... Aguarde um momento.' }]);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);

    if (chatMode === 'human' && chatId) {
      // Send to Supabase
      await supabase.from('chat_messages').insert([{ chat_id: chatId, sender: 'visitor', content: userMessage }]);

      // Trigger Alert (Fire and forget)
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-support-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ chatId, visitorName: 'Visitante Site', messageContent: userMessage })
      }).catch(err => console.error("Alert Error", err));

    } else {
      // AI Logic
      initChat();
      setIsLoading(true);
      try {
        if (chatInstance.current) {
          const response = await chatInstance.current.sendMessage({ message: userMessage });
          const botText = response.text || "Desculpe, tive um problema técnico.";
          setMessages(prev => [...prev, { role: 'model', text: botText }]);
        }
      } catch (error) {
        setMessages(prev => [...prev, { role: 'model', text: "Erro ao conectar com o ratinho. Tente novamente." }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-display">
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-20 md:right-4 w-full h-[60vh] md:w-[400px] md:h-[500px] bg-surface border-t md:border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">

          {/* Header */}
          <div className="bg-primary p-3 md:p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {chatMode !== 'selection' && (
                <button onClick={() => setChatMode('selection')} className="mr-1 text-background-dark/50 hover:text-background-dark">
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>
              )}
              <div className={`size-10 rounded-full flex items-center justify-center ${chatMode === 'human' ? 'bg-green-500' : 'bg-background-dark'}`}>
                <span className={`material-symbols-outlined ${chatMode === 'human' ? 'text-white' : 'text-primary'}`}>
                  {chatMode === 'human' ? 'support_agent' : 'smart_toy'}
                </span>
              </div>
              <div>
                <h4 className="text-background-dark font-black text-sm uppercase leading-tight">
                  {chatMode === 'human' ? 'Atendimento Humano' : (chatMode === 'ai' ? 'Suporte Mágico' : 'Tio Michael')}
                </h4>
                <p className="text-background-dark/70 text-[10px] font-bold uppercase tracking-wider">
                  {chatMode === 'human' ? 'Aguardando resposta...' : (chatMode === 'ai' ? 'Online agora' : 'Escolha uma opção')}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-background-dark hover:rotate-90 transition-transform">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* SELECTION SCREEN */}
          {chatMode === 'selection' && (
            <div className="flex-1 p-4 md:p-6 flex flex-col justify-center gap-3 overflow-y-auto bg-background-dark/95">
              <p className="text-white text-center mb-2 text-sm md:text-base">Como você prefere ser atendido hoje?</p>

              <button
                onClick={() => { setChatMode('ai'); initChat(); }}
                className="group bg-surface hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex flex-row md:flex-col items-center gap-4 transition-all text-left md:text-center"
              >
                <div className="size-10 md:size-12 bg-primary/20 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-xl md:text-2xl">smart_toy</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm md:text-base">Suporte Mágico (IA)</h4>
                  <p className="text-xs text-white/50 leading-tight mt-1">Tire dúvidas sobre roteiros e parques instantaneamente.</p>
                </div>
              </button>

              <button
                onClick={() => startHumanChat()}
                className="group bg-surface hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex flex-row md:flex-col items-center gap-4 transition-all text-left md:text-center"
              >
                <div className="size-10 md:size-12 bg-green-500/20 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-green-500 text-xl md:text-2xl">support_agent</span>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm md:text-base">Falar com Humano</h4>
                  <p className="text-xs text-white/50 leading-tight mt-1">Fale diretamente com nossa equipe e receba ajuda personalizada.</p>
                </div>
              </button>
            </div>
          )}

          {/* CHAT INTERFACE */}
          {chatMode !== 'selection' && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar bg-background-dark/50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-primary text-background-dark font-medium rounded-tr-none'
                      : 'bg-surface border border-white/5 text-white/90 rounded-tl-none'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-surface border border-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1">
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-surface border-t border-white/5">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="relative"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pergunte sobre roteiros..."
                    className="w-full bg-background-dark border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-primary focus:border-primary border"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:opacity-30 p-1"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Blog CTA - Only show when chat is closed */}
      {!isOpen && (
        <a
          href="#blog"
          className="absolute bottom-20 right-1 size-12 bg-white text-primary rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-50 group"
          title="Ver Dicas no Blog"
        >
          <span className="material-symbols-outlined">rss_feed</span>
          <span className="absolute right-full mr-2 bg-white text-primary text-xs font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            {hasNewPostToday ? 'Novo Post Hoje!' : 'Ir para o Blog'}
          </span>
          {hasNewPostToday && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </a>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`size-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-white text-background-dark' : 'bg-primary text-background-dark'
          }`}
      >
        <span className="material-symbols-outlined text-3xl font-bold">
          {isOpen ? 'close' : 'chat_bubble'}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
