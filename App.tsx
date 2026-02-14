
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { searchService, SearchResult } from './services/geminiService';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await searchService.search(query);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (result && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-100">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <a href="https://kosalnith.github.io" className="serif text-xl font-bold tracking-tight text-gray-900">
          Kosal <span className="text-[#8c1515]">Nith.</span>
        </a>
        <div className="hidden md:flex space-x-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          <a href="https://kosalnith.github.io/research.html" className="hover:text-[#8c1515] transition-all">Research</a>
          <a href="https://kosalnith.github.io/bio.html" className="hover:text-[#8c1515] transition-all">Biography</a>
          <a href="https://kosalnith.substack.com" className="hover:text-[#8c1515] transition-all">Substack Blog</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="serif text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-in fade-in slide-in-from-top-4 duration-700">
            Kosal Nith <br /> <span className="italic text-[#8c1515]">Research Intelligence</span>
          </h1>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Searching across the professional portfolio and Substack blog of Kosal Nith for deep economic insights.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
            <div className={`transition-all duration-300 transform ${isLoading ? 'scale-[0.98]' : 'hover:scale-[1.01]'}`}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about his latest research or Substack posts..."
                className="w-full bg-white border border-gray-200 rounded-full px-8 py-5 text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-50 focus:border-[#8c1515] transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="absolute right-3 top-3 bottom-3 px-8 bg-[#8c1515] text-white font-bold rounded-full hover:bg-black transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                  </div>
                ) : (
                  <i className="fa-solid fa-magnifying-glass"></i>
                )}
              </button>
            </div>
          </form>

          {!result && !isLoading && (
            <div className="mt-12 flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              {[
                { label: "Latest Blog Post", q: "What is the most recent post on his Substack blog?" },
                { label: "Economic Growth", q: "What are his views on economic growth in Cambodia?" },
                { label: "Research Focus", q: "Summarize his research focus areas from his website" },
                { label: "Contact Details", q: "Where can I find his formal contact information?" }
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { setQuery(item.q); }}
                  className="px-4 py-2 bg-white border border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#8c1515] hover:border-[#8c1515] transition-all rounded-md"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <main className="max-w-4xl w-full mx-auto px-6 pb-40 flex-grow">
        <div ref={resultsRef} className="space-y-12">
          {error && (
            <div className="p-8 bg-white border-l-4 border-red-600 shadow-sm animate-in zoom-in duration-300">
              <h3 className="text-red-600 font-bold uppercase tracking-widest text-xs mb-2">Notice</h3>
              <p className="text-gray-600 font-light">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-white p-8 md:p-14 shadow-2xl rounded-sm border border-gray-100 animate-in slide-in-from-bottom-8 duration-700 ease-out">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="serif text-3xl font-bold text-gray-900 mb-1">Ecosystem Report</h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300">Synthesized Professional Context</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => window.print()} className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                    <i className="fa-solid fa-print"></i>
                  </button>
                  <button 
                    onClick={() => {setQuery(''); setResult(null);}} 
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-700 border border-gray-100 px-4 py-2 rounded transition-all"
                  >
                    New Search
                  </button>
                </div>
              </div>

              {/* Main Text Output */}
              <article className="prose prose-slate max-w-none mb-12">
                <div className="text-gray-800 text-lg leading-relaxed font-light whitespace-pre-wrap">
                  {result.text}
                </div>
              </article>

              {/* Citations / Sources */}
              {result.sources.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-50">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center">
                    <i className="fa-solid fa-link mr-2 text-red-700/50"></i> Verified Knowledge Sources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-gray-50 rounded group hover:bg-red-50 transition-colors flex flex-col"
                      >
                        <span className="text-xs font-bold text-gray-900 group-hover:text-[#8c1515] line-clamp-1">{source.title}</span>
                        <span className="text-[10px] text-gray-400 line-clamp-1">{source.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-12 pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between gap-4 text-[9px] text-gray-300 uppercase tracking-widest font-bold">
                <p>Sources: kosalnith.github.io & kosalnith.substack.com</p>
                <p>Gemini Research Protocol v2.2</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-100 py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="serif text-xl font-bold text-gray-900">Kosal <span className="text-[#8c1515]">Nith.</span></h3>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2 font-bold">Research Associate | Cambodia</p>
          </div>
          <div className="flex space-x-6">
            <a href="https://kosalnith.substack.com" className="text-gray-400 hover:text-[#FF6719] transition-colors"><i className="fa-solid fa-rss"></i></a>
            <a href="https://github.com/kosalnith" className="text-gray-400 hover:text-black transition-colors"><i className="fa-brands fa-github"></i></a>
            <a href="https://twitter.com/kosalnith" className="text-gray-400 hover:text-[#1DA1F2] transition-colors"><i className="fa-brands fa-x-twitter"></i></a>
            <a href="https://www.linkedin.com/in/kosalnith" className="text-gray-400 hover:text-[#0A66C2] transition-colors"><i className="fa-brands fa-linkedin-in"></i></a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 text-center text-[10px] text-gray-300 uppercase tracking-widest font-bold">
          © 2024-2026 • Professional Knowledge Extension
        </div>
      </footer>
    </div>
  );
};

export default App;
