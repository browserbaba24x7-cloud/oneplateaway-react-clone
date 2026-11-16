import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Check } from '../components/icons';

// Hero photo ("WhatsApp Image 2026-02-27 at 14.13.53.jpeg" from the export), served from /public.
const heroImg = '/volunteer-hero.jpeg';

const hadiths = [
  { text: 'The most beloved people to Allah are those who bring the most benefit to others.', source: 'Prophet Muhammad ﷺ' },
  { text: 'Give charity without delay, for it stands in the way of calamity.', source: 'Tirmidhi – Hasan' },
  { text: 'Charity extinguishes sin as water extinguishes fire.', source: 'Tirmidhi – Sahih' },
  { text: 'A person will be under the shade of his charity on the Day of Resurrection.', source: 'Ahmad – Sahih' },
  { text: 'The best charity is that given when you are healthy, hoping to live, and fearing poverty.', source: 'Bukhari & Muslim' },
  { text: 'And whoever feeds a believer until he is full, Allah will feed him from the fruits of Paradise.', source: 'Hadith – Hasan' },
];

const shareText = 'Share One Plate Away with your family, friends and community. The further the message travels, the more people we can feed.';

export default function Volunteer({ onJoin = () => console.log('open volunteer form') }) {
  const go = useNavigate();
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const current = hadiths[index];
  const next = () => setIndex((i) => (i + 1) % hadiths.length);
  const prev = () => setIndex((i) => (i - 1 + hadiths.length) % hadiths.length);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % hadiths.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Same behaviour as the original: native share sheet, else copy to clipboard, else WhatsApp.
  const share = async () => {
    const url = window.location.origin;
    try {
      if (navigator.share) { await navigator.share({ title: 'One Plate Away', text: shareText, url }); return; }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center text-sm text-gray-500 animate-fade-in"><Button variant={null} onClick={() => go("/")} className="hover:text-primary flex items-center transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house mr-1" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg> Home</Button><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right mx-2 text-gray-300" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg><Button variant={null} className="transition-colors font-bold text-gray-900" disabled={true}>Volunteer</Button></nav>
      <main className="flex-grow">
        <div className="animate-fade-in"><div className="hero-section relative w-full py-8 md:py-10 flex items-center justify-center text-center overflow-hidden rounded-[2rem] shadow-2xl mb-8 group"><div className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-in-out group-hover:scale-110" style={{ backgroundImage: `url("${heroImg}")` }} /><div className="absolute inset-0 bg-primary/80 mix-blend-multiply" /><div className="absolute inset-0 bg-black/30" /> <div className="relative z-20 w-full max-w-7xl mx-auto px-6"><h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight text-white drop-shadow-lg tracking-tight">Join the Movement</h1><div className="w-24 h-1 bg-secondary mx-auto mb-4 rounded-full" /><div className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed drop-shadow-md max-w-2xl mx-auto">Transform your free time into an act of worship. Be the change your community needs.</div></div></div><div className="max-w-5xl mx-auto px-4 py-16"><section className="bg-primary/5 py-16 my-20 relative overflow-hidden rounded-3xl"><div className="absolute top-0 right-0 p-32 bg-secondary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" /><div className="absolute bottom-0 left-0 p-24 bg-primary/5 rounded-full blur-3xl -ml-12 -mb-12 pointer-events-none" /><div className="max-w-4xl mx-auto px-4 relative z-10 text-center"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-secondary mx-auto mb-6 shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-quote" aria-hidden="true"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" /></svg></div><div className="relative min-h-[200px] flex items-center justify-center mb-8"><Button variant={null} className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-primary hover:bg-white transition-all hidden md:block" onClick={prev} aria-label="Previous Hadith"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg></Button><div className="animate-fade-in key={currentIndex} px-8"><p className="text-2xl md:text-3xl font-serif italic text-gray-800 leading-relaxed mb-6">{`"${current.text}"`}</p><p className="text-sm font-bold text-primary uppercase tracking-widest">{`— ${current.source}`}</p></div><Button variant={null} className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-primary hover:bg-white transition-all hidden md:block" onClick={next} aria-label="Next Hadith"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg></Button></div><div className="flex justify-center gap-2 mb-12">
    {hadiths.map((_, i) => (
      <button key={i} onClick={function () { setIndex(i); }} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === index ? 'bg-primary w-6' : 'bg-gray-300 hover:bg-gray-400'}`} aria-label={`Go to quote ${i + 1}`} />
    ))}
  </div></div></section><div className="bg-white rounded-[3rem] shadow-xl overflow-hidden flex flex-col md:flex-row mb-16"><div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center bg-gray-900 text-white relative overflow-hidden"><div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -mr-16 -mt-16" /><div className="relative z-10"><div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin text-secondary" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg></div><h3 className="text-3xl font-black mb-6 text-white">Visiting Makkah? Give With Us.</h3><p className="text-lg text-gray-300 mb-4 leading-relaxed">One Plate Away is about more than donating a meal.</p><div className="text-lg text-gray-300 mb-6 leading-relaxed">If you’re visiting Makkah and would like to give some of your time, you can join us in helping distribute meals to those in need.</div><p className="text-xl text-white italic font-serif mb-8 leading-relaxed">A simple act. A little of your time. A plate placed into someone else’s hands.</p><Button variant={null} onClick={onJoin} className="px-10 py-5 bg-secondary text-white font-bold rounded-xl shadow-lg hover:bg-accent transition-all flex items-center gap-3 transform hover:scale-105"><span>Join Us in Makkah</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-plus" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg></Button></div></div><div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center"><div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share2 lucide-share-2 text-primary" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg></div><h3 className="text-3xl font-black mb-6 text-primary">Not travelling to Makkah? You can still help.</h3><p className="text-lg text-gray-600 mb-8 leading-relaxed">Share One Plate Away with your family, friends and community. The further the message travels, the more people we can feed.</p><Button variant={null} onClick={share} className="px-10 py-5 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center gap-3 transform hover:scale-105 w-fit"><span>Share One Plate Away</span>{copied ? <Check size={20} /> : (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share2 lucide-share-2" aria-hidden="true"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>)}</Button>{copied && <p className="text-sm text-primary font-medium mt-4">Link copied. Pass it on to family and friends.</p>}</div></div></div></div>
      </main>
    </>
  );
}
