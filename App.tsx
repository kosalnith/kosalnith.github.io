
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { conductResearch, getFollowUpQuestions } from './services/geminiService';
import { ResearchSession, ResearchStatus, Source } from './types';
import ResearchResult from './components/ResearchResult';
import LoadingSkeleton from './components/LoadingSkeleton';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ResearchStatus>(ResearchStatus.IDLE);
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleResearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setStatus(ResearchStatus.SEARCHING);
    setFollowUps([]);
    
    try {
      const { text, sources } = await conductResearch(searchQuery);
      
      const session: ResearchSession = {
        id: Math.random().toString(36).substr(2, 6),
        query: searchQuery,
        answer: text,
        sources,
        timestamp: Date.now()
      };

      setCurrentSession(session);
      setStatus(ResearchStatus.COMPLETED);

      const suggestions = await getFollowUpQuestions(searchQuery, text);
      setFollowUps(suggestions);

    } catch (error) {
      console.error(error);
      setStatus(ResearchStatus.ERROR);
    }
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleResearch(query);
  };

  useEffect(() => {
    if (status === ResearchStatus.COMPLETED && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status]);

  return (
    <div className="min-h-screen flex flex-col items-center">
      {/* Top Brand Bar */}
      <div className="w-full h-1 bg-maroon"></div>
      
      <div className="w-full max-w-5xl px-4 md:px-8">
        {/* Masthead mimicking user's site */}
        <header className="py-8 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-200 mb-12">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold tracking-tight">
              <span className="text-maroon">Kosal</span> <span className="text-gray-900">Nith.</span>
            </div>
            <div className="hidden md:block h-8 w-px bg-gray-300"></div>
            <div className="hidden md:block text-xs font-semibold text-gray-500 uppercase tracking-widest leading-tight">
              Research Intelligence Portal
            </div>
          </div>
          
          <nav className="flex items-center gap-6 text-sm font-semibold text-gray-500">
            <a href="https://kosalnith.github.io" className="hover:text-maroon transition-colors">Home</a>
            <a href="https://kosalnith.github.io/research.html" className="hover:text-maroon transition-colors">Research</a>
            <a href="https://kosalnith.github.io/bio.html" className="hover:text-maroon transition-colors">Bio</a>
          </nav>
        </header>

        {/* Hero Section */}
        <section className={`transition-all duration-700 ${status === ResearchStatus.IDLE ? 'py-20 text-center' : 'py-0'}`}>
          {status === ResearchStatus.IDLE && (
            <div className="max-w-2xl mx-auto space-y-6 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Academic Research <span className="italic text-maroon">Synthesis.</span>
              </h2>
              <p className="text-gray-600 text-lg">
                Ask specific questions about my work in macroeconomics, monetary policy, and development in Cambodia.
              </p>
            </div>
          )}

          {/* AI Search Box */}
          <form onSubmit={onSearchSubmit} className="relative w-full max-w-2xl mx-auto group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-maroon transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search research topics, papers, or career history..."
              className="w-full h-14 bg-white border border-gray-300 rounded-full pl-14 pr-32 text-base focus:outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all shadow-sm placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={status === ResearchStatus.SEARCHING}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-maroon text-white rounded-full font-bold text-sm hover:bg-maroon-dark transition-all disabled:bg-gray-300"
            >
              {status === ResearchStatus.SEARCHING ? 'Synthesizing...' : 'Search'}
            </button>
          </form>

          {status === ResearchStatus.IDLE && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[`Research interests`, `Informal borrowing in Cambodia`, `CDRI affiliation`, `Future Forum fellowship`].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setQuery(suggestion); handleResearch(suggestion); }}
                  className="px-4 py-1.5 bg-white border border-gray-200 hover:border-maroon rounded-full text-xs font-semibold text-gray-500 hover:text-maroon transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Results */}
        <main className="w-full max-w-3xl mx-auto mt-12 pb-24" ref={scrollRef}>
          {status === ResearchStatus.SEARCHING && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-maroon uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-maroon rounded-full animate-ping"></div>
                Analyzing Internal Data Archives...
              </div>
              <LoadingSkeleton />
            </div>
          )}
          
          {status === ResearchStatus.COMPLETED && currentSession && (
            <div className="space-y-10">
              <ResearchResult answer={currentSession.answer} sources={currentSession.sources} />
              
              {followUps.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 delay-300">
                  <h4 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-[0.2em]">Explore More From This Site</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {followUps.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(q); handleResearch(q); }}
                        className="p-4 bg-white border border-gray-200 hover:border-maroon rounded-lg text-left text-xs font-semibold text-gray-600 hover:text-maroon transition-all shadow-academic"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <footer className="mt-auto w-full py-12 bg-white border-t border-gray-200 text-center text-[11px] text-gray-500 uppercase tracking-widest font-semibold px-4">
        <p>© 2018 – 2026 Kosal Nith • Research Intelligence grounding restricted to kosalnith.github.io</p>
      </footer>
    </div>
  );
};

export default App;
