import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import heroImg from '../assets/images/stories/hero.jpeg';
import barakahImg from '../assets/images/stories/barakah-of-feeding.jpg';

// In the original these come from the database. Add more objects to list more stories.
const stories = [
  {
    slug: 'the-barakah-of-feeding',
    title: 'The Barakah of Feeding',
    category: 'Spiritual',
    date: 'March 10, 2024',
    readTime: 2,
    image: barakahImg,
    excerpt: 'It wasn’t planned.\nThere was no campaign. no branding. no intention to build anything.',
  },
];

export default function Stories({ onOpenStory = (story) => console.log('open story', story.slug) }) {
  const go = useNavigate();
  return (
    <>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center text-sm text-gray-500 animate-fade-in"><Button variant={null} onClick={() => go("/")} className="hover:text-primary flex items-center transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house mr-1" aria-hidden="true"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg> Home</Button><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right mx-2 text-gray-300" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg><Button variant={null} className="transition-colors font-bold text-gray-900" disabled={true}>Stories</Button></nav>
      <main className="flex-grow">
        <div className="animate-fade-in"><div className="hero-section relative w-full py-8 md:py-10 flex items-center justify-center text-center overflow-hidden rounded-[2rem] shadow-2xl mb-8 group"><div className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] ease-in-out group-hover:scale-110" style={{ backgroundImage: `url("${heroImg}")` }} /><div className="absolute inset-0 bg-primary/80 mix-blend-multiply" /><div className="absolute inset-0 bg-black/30" /> <div className="relative z-20 w-full max-w-7xl mx-auto px-6"><h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight text-white drop-shadow-lg tracking-tight">Stories of Hope</h1><div className="w-24 h-1 bg-secondary mx-auto mb-4 rounded-full" /><div className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed drop-shadow-md max-w-2xl mx-auto">Updates from the field, impact reports, and the voices of those you help.</div></div></div><div className="max-w-7xl mx-auto px-4 py-16"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{stories.map((story) => (<div key={story.slug} onClick={() => onOpenStory(story)} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"><div className="relative h-56 overflow-hidden shrink-0"><img alt={story.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={story.image} /><div className="absolute top-4 left-4 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/90 text-primary">{story.category}</div></div><div className="p-8 flex flex-col flex-grow"><div className="flex items-center gap-4 text-gray-400 text-xs font-bold mb-3"><div className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar" aria-hidden="true"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>{` ${story.date}`}</div><div className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>{` ${story.readTime} min read`}</div></div><h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors leading-tight">{story.title}</h3><p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">{story.excerpt}</p><div className="pt-4 border-t border-gray-50 mt-auto"><Button variant={null} className="text-secondary font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Read Story <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right" aria-hidden="true"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg></Button></div></div></div>))}</div></div></div>
      </main>
    </>
  );
}
