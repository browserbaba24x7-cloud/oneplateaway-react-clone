import { useState } from 'react';

const QuestionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-question-mark" aria-hidden="true">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
  </svg>
);

const Chevron = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chevron-down ${className}`} aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function FaqList({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div
            key={item.question}
            onClick={() => setOpenIndex(open ? null : i)}
            className={`group bg-white rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden border-2 ${open ? 'border-primary shadow-lg ring-4 ring-primary/5' : 'border-transparent shadow-sm hover:shadow-md hover:border-highlight/50'}`}
          >
            <div className="p-6 flex justify-between items-start gap-4">
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 p-2 rounded-full transition-all duration-300 shrink-0 ${open ? 'bg-primary text-white rotate-12 scale-110' : 'bg-gray-50 text-gray-400 group-hover:text-primary group-hover:bg-primary/10'}`}>
                  <QuestionIcon />
                </div>
                <h4 className={`font-bold text-lg leading-snug transition-colors duration-300 ${open ? 'text-primary' : 'text-gray-900 group-hover:text-primary/80'}`}>{item.question}</h4>
              </div>
              <div className={`p-1 rounded-full transition-all duration-300 ${open ? 'bg-secondary/10' : ''}`}>
                <Chevron className={`text-gray-400 transition-transform duration-500 ${open ? 'rotate-180 text-secondary' : 'group-hover:text-primary'}`} />
              </div>
            </div>
            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="px-6 pb-8 pl-[5rem]">
                  <p className="text-gray-600 leading-relaxed text-sm border-l-2 border-secondary/30 pl-4 py-1">{item.answer}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
