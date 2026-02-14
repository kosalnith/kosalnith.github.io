
import React from 'react';
import { Source } from '../types';

interface ResearchResultProps {
  answer: string;
  sources: Source[];
}

const ResearchResult: React.FC<ResearchResultProps> = ({ answer, sources }) => {
  const formattedAnswer = answer.split('\n').map((line, i) => {
    if (line.startsWith('#')) {
      return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-maroon border-b border-gray-100 pb-1">{line.replace(/^#+\s*/, '')}</h3>;
    }
    if (line.startsWith('*') || line.startsWith('-')) {
      return <li key={i} className="ml-5 mb-2 text-gray-700 list-disc">{line.replace(/^[*-\s]+/, '')}</li>;
    }
    
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className="mb-4 leading-relaxed text-gray-700">
        {parts.map((part, pi) => 
          part.startsWith('**') && part.endsWith('**') 
            ? <strong key={pi} className="text-gray-900 font-bold">{part.slice(2, -2)}</strong> 
            : part
        )}
      </p>
    );
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-academic">
        <div className="prose prose-slate max-w-none">
          {formattedAnswer}
        </div>

        {sources.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-100">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">Cited Sources (kosalnith.github.io)</h4>
            <div className="space-y-2">
              {sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-200 transition-all group"
                >
                  <span className="text-sm font-medium text-gray-600 group-hover:text-maroon truncate mr-4">
                    {source.title.split('|')[0].trim()}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 flex-shrink-0 uppercase tracking-tighter italic">
                    {source.uri.split('/').pop() || 'index'}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchResult;
