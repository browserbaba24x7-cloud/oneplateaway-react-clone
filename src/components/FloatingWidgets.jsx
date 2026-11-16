import { useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { Check, X } from './icons';
import { chatWithAI } from '../services/chat';

export const languages = ['English', 'Arabic', 'Spanish', 'French', 'Urdu', 'Indonesian', 'Bengali', 'Turkish', 'Russian', 'Portuguese', 'German', 'Japanese', 'Korean', 'Hindi', 'Mandarin Chinese'];

const defaultNotifications = [
  'Someone in Makkah will break their fast tonight.',
  '£2.99 feeds someone near the Haram.',
  'Imagine someone making dua for you in Makkah tonight.',
];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

export default function FloatingWidgets({ onDonate, language, onLanguage }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "As-salamu alaykum! I'm the OnePlateAway assistant. How can I help you feed the hungry today?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // ---- rotating donation toast (same timing as the original) ----
  const [toastText, setToastText] = useState('');
  const [toastShown, setToastShown] = useState(false);
  const [queue, setQueue] = useState(() => shuffle(defaultNotifications));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('waiting');

  useEffect(() => {
    if (chatOpen) { setToastShown(false); return undefined; }
    let t;
    if (phase === 'waiting') {
      t = setTimeout(() => setPhase('showing'), 3000 + 3000 * Math.random());
    } else if (phase === 'showing') {
      if (queue.length > 0) { setToastText(queue[index]); setToastShown(true); }
      t = setTimeout(() => {
        setToastShown(false);
        setTimeout(() => {
          setIndex((i) => {
            const n = i + 1;
            if (n >= queue.length) { setQueue(shuffle(defaultNotifications)); return 0; }
            return n;
          });
          setPhase('waiting');
        }, 500);
      }, 6000 + 2000 * Math.random());
    }
    return () => clearTimeout(t);
  }, [phase, chatOpen, queue, index]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, chatOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const history = messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
    setMessages((m) => [...m, { role: 'user', text }]);
    setLoading(true);
    try {
      const reply = await chatWithAI(text, history);
      setMessages((m) => [...m, { role: 'model', text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [...m, { role: 'model', text: "I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!chatOpen && (<div className={`fixed bottom-8 right-24 z-[60] max-w-[65%] md:max-w-xs transition-all duration-500 ease-in-out transform origin-bottom-right ${toastShown ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}><div onClick={onDonate} className="bg-white p-5 rounded-2xl shadow-2xl border border-gray-100 border-l-4 border-l-secondary relative cursor-pointer hover:bg-gray-50 transition-colors group"><button onClick={(e) => { e.stopPropagation(); setToastShown(false); }} className="absolute -top-2 -left-2 bg-white rounded-full p-1 text-gray-400 hover:text-gray-600 shadow-md border border-gray-100 z-10 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg></button><p className="text-sm text-gray-800 whitespace-pre-line font-bold leading-relaxed relative z-0">{toastText}</p><div className="absolute top-1/2 -right-2 w-4 h-4 bg-white transform rotate-45 border-t border-r border-gray-100 -translate-y-1/2 group-hover:bg-gray-50 transition-colors" /></div></div>)}
      <button onClick={() => setChatOpen(!chatOpen)} className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${chatOpen ? 'bg-gray-800 rotate-90 scale-90' : 'bg-secondary hover:scale-105'} text-white`} aria-label="Toggle Chat">{chatOpen ? <X size={24} /> : (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square" aria-hidden="true"><path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" /></svg>)}</button><div className={`fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 z-50 transform origin-bottom-right ${chatOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}><div className="bg-primary p-4 text-white flex items-center gap-3 shadow-sm"><div className="p-2 bg-white/20 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot" aria-hidden="true"><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" /></svg></div><div><h3 className="font-bold text-lg leading-none">Support Assistant</h3><p className="text-xs text-white/70">Ask about Fidya, projects, or volunteering</p></div></div><div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">{messages.map((m, i) => (
      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-secondary text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>{m.text}</div>
      </div>
    ))}
    {loading && (
      <div className="flex justify-start">
        <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex gap-1 items-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    )}
    <div ref={endRef} /></div><Form onSubmit={sendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2"><input type="text" placeholder="Type your question..." value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"  /><button type="submit" disabled={!input.trim() || loading} className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" /><path d="m21.854 2.147-10.94 10.939" /></svg></button></Form></div><button onClick={() => setLangOpen(!langOpen)} className={`fixed bottom-6 left-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${langOpen ? 'bg-gray-800 rotate-12 scale-90' : 'bg-white text-gray-700 hover:scale-105 border border-gray-200'}`} aria-label="Change Language" title="Change Language">{langOpen ? <X size={24} className="text-white" /> : (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" /></svg>)}</button><div className={`fixed bottom-24 left-6 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300 z-50 transform origin-bottom-left ${langOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}><div className="bg-gray-50 p-4 border-b border-gray-100"><h3 className="font-bold text-gray-900 text-sm">Select Language</h3><p className="text-xs text-gray-500">Translate the entire site.</p></div><div className="max-h-[300px] overflow-y-auto p-2">
      {languages.map((l) => (
        <button key={l} onClick={() => { onLanguage(l); setLangOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${language === l ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-gray-700'}`}>
          <span>{l}</span>
          {language === l && <Check size={16} />}
        </button>
      ))}
    </div></div>
    </>
  );
}
