import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, CheckCircle2, FileText } from 'lucide-react';
import CardModal from '../components/cards/CardModal';

const Timeline = () => {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState(null);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort cards strictly by date descending
      const sorted = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setCards(sorted);
    } catch (err) {
      setError('Failed to fetch timeline data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const openCard = (card) => {
    setCardToEdit(card);
    setIsModalOpen(true);
  };

  // Group cards by Date string (e.g. "6 July 2026")
  const groupedTimeline = cards.reduce((acc, card) => {
    const d = new Date(card.createdAt);
    const dateKey = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(card);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-[#1a472a]" /> Learning Timeline
          </h1>
          <p className="text-gray-500 text-sm mt-1">A chronological history of your knowledge journey.</p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[500px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#1a472a]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <h4 className="text-gray-900 font-bold mb-1">Your timeline is empty</h4>
            <p className="text-gray-500 text-sm max-w-xs mb-6">Create knowledge cards to see your history grow over time!</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto py-4">
            <div className="relative border-l-2 border-gray-100 ml-3 md:ml-6 space-y-12 pb-8">
              
              {Object.entries(groupedTimeline).map(([date, dayCards]) => (
                <div key={date} className="relative">
                  
                  {/* Date Header Node */}
                  <div className="absolute -left-[29px] md:-left-[41px] bg-[#1a472a] text-white w-[56px] md:w-[80px] text-center py-1 rounded-full text-[10px] md:text-xs font-bold shadow-sm ring-4 ring-white z-10">
                    {date.split(' ').slice(0, 2).join(' ')}
                  </div>
                  
                  <div className="pl-10 md:pl-16 pt-1 space-y-6">
                    {dayCards.map(card => {
                      const time = new Date(card.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div key={card.id} className="relative group">
                          {/* Card Bullet */}
                          <div className="absolute -left-[45px] md:-left-[69px] top-1.5 w-3 h-3 bg-white border-2 border-[#1a472a] rounded-full z-10 group-hover:bg-[#1a472a] transition-colors"></div>
                          
                          {/* Card Content */}
                          <div 
                            onClick={() => openCard(card)}
                            className="bg-gray-50 hover:bg-[#e8f3ec] border border-transparent hover:border-[#1a472a]/20 p-4 rounded-xl cursor-pointer transition-all flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
                          >
                            <div className="text-sm font-bold text-[#1a472a] shrink-0 w-20">
                              {time}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                <FileText size={16} className="text-gray-400" />
                                {card.title}
                              </h4>
                              {card.category && (
                                <p className="text-xs text-gray-500 mt-1 font-medium">{card.category}</p>
                              )}
                            </div>
                            
                            {card.difficulty && (
                              <div className="shrink-0 mt-2 md:mt-0">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  card.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                                  card.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {card.difficulty}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              ))}
              
              {/* Bottom Endpoint */}
              <div className="absolute bottom-0 -left-[5px] w-2.5 h-2.5 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      <CardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        cardToEdit={cardToEdit}
        onSave={fetchCards} 
      />
    </div>
  );
};

export default Timeline;
