import { useState, useEffect } from 'react';
import axios from 'axios';
import { RotateCcw, Check, X, BookOpen, Brain, PlayCircle, Trophy } from 'lucide-react';

const Revision = () => {
  const [cards, setCards] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [stats, setStats] = useState({ remembered: 0, needsRevision: 0 });

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/cards`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCards(res.data);
      } catch (err) {
        console.error('Failed to load cards for revision', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCards();
  }, []);

  const startSession = () => {
    // Shuffle cards for random revision
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    setQueue(shuffled);
    setCurrentIndex(0);
    setStats({ remembered: 0, needsRevision: 0 });
    setIsFlipped(false);
    setSessionActive(true);
  };

  const handleNext = (remembered) => {
    setStats(prev => ({
      ...prev,
      [remembered ? 'remembered' : 'needsRevision']: prev[remembered ? 'remembered' : 'needsRevision'] + 1
    }));

    if (currentIndex + 1 < queue.length) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionActive(false); // End session
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1a472a]"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
          <BookOpen size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Cards Yet!</h2>
        <p className="text-gray-500">You need to create some Knowledge Cards before you can start a revision session.</p>
      </div>
    );
  }

  // Session Results Screen
  if (!sessionActive && queue.length > 0 && currentIndex >= queue.length - 1) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-[#1a472a]">
          <Trophy size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🍃 One more leaf strengthened!</h1>
        <p className="text-gray-500 mb-8">You revised {queue.length} cards today.</p>
        
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col items-center">
            <span className="text-3xl font-bold text-emerald-600 mb-1">{stats.remembered}</span>
            <span className="text-sm font-medium text-gray-500 uppercase">Remembered</span>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-2xl flex flex-col items-center">
            <span className="text-3xl font-bold text-orange-500 mb-1">{stats.needsRevision}</span>
            <span className="text-sm font-medium text-gray-500 uppercase">Need Revision</span>
          </div>
        </div>

        <button 
          onClick={startSession}
          className="bg-[#1a472a] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a472a]/90 transition-colors flex items-center gap-2"
        >
          <RotateCcw size={20} /> Start Another Session
        </button>
      </div>
    );
  }

  // Pre-Session Screen
  if (!sessionActive) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-[#1a472a]/10 rounded-full flex items-center justify-center mb-6 text-[#1a472a]">
          <Brain size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Revision Mode</h1>
        <p className="text-gray-500 mb-8">Test your memory on {cards.length} random knowledge cards.</p>
        
        <button 
          onClick={startSession}
          className="bg-[#1a472a] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1a472a]/90 transition-all hover:scale-105 flex items-center gap-3 shadow-lg shadow-[#1a472a]/20"
        >
          <PlayCircle size={24} /> Begin Session
        </button>
      </div>
    );
  }

  const currentCard = queue[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-8">
      
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Brain className="text-[#1a472a]" size={24} /> Revision
        </h2>
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">
          {currentIndex + 1} / {queue.length}
        </span>
      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full mb-12 overflow-hidden">
        <div 
          className="h-full bg-[#1a472a] transition-all duration-300"
          style={{ width: `${((currentIndex) / queue.length) * 100}%` }}
        ></div>
      </div>

      {/* Flashcard Area */}
      <div className="perspective-1000 w-full aspect-[4/3] sm:aspect-video mb-12">
        <div 
          className={`relative w-full h-full transition-transform duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={() => !isFlipped && setIsFlipped(true)}
        >
          {/* Front of card */}
          <div className="absolute w-full h-full backface-hidden bg-white border-2 border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center p-8 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4 bg-emerald-50 px-3 py-1 rounded-full">Question</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{currentCard.title}</h3>
            <p className="absolute bottom-6 text-gray-400 text-sm font-medium animate-pulse">Click to flip</p>
          </div>

          {/* Back of card */}
          <div className="absolute w-full h-full backface-hidden bg-[#1a472a] rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center rotate-y-180 text-white">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-4 bg-white/10 px-3 py-1 rounded-full">Answer</span>
            <div className="w-full max-h-[60%] overflow-y-auto custom-scrollbar">
              <p className="text-lg sm:text-xl font-medium leading-relaxed opacity-90 whitespace-pre-wrap">{currentCard.explanation || 'No explanation provided.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex items-center justify-center gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button 
          onClick={() => handleNext(false)}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 px-6 py-4 rounded-2xl font-bold transition-colors"
        >
          <X size={20} strokeWidth={3} /> Needs Revision
        </button>
        <button 
          onClick={() => handleNext(true)}
          className="flex-1 max-w-[200px] flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-4 rounded-2xl font-bold transition-colors shadow-lg shadow-emerald-500/30"
        >
          <Check size={20} strokeWidth={3} /> Remembered
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
      `}} />
    </div>
  );
};

export default Revision;
