import { useState, useEffect } from 'react';
import axios from 'axios';
import { Network, Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import CardModal from '../components/cards/CardModal';

const KnowledgeTree = () => {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Modal State for viewing/editing a card
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState(null);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data);
    } catch (err) {
      setError('Failed to fetch knowledge tree data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Group cards by category
  const groupedCards = cards.reduce((acc, card) => {
    // Treat empty or null categories as 'Uncategorized'
    const cat = card.category && card.category.trim() !== '' ? card.category : 'Uncategorized';
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(card);
    return acc;
  }, {});

  // Sort categories alphabetically, but put 'Uncategorized' at the end
  const sortedCategories = Object.keys(groupedCards).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    sortedCategories.forEach(cat => allExpanded[cat] = true);
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    setExpandedCategories({});
  };

  const openCard = (card) => {
    setCardToEdit(card);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="text-[#1a472a]" /> Knowledge Tree
          </h1>
          <p className="text-gray-500 text-sm mt-1">Your entire knowledge base visualized as a growing tree.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={collapseAll} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Collapse All
          </button>
          <button onClick={expandAll} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            Expand All
          </button>
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
              <Network size={24} className="text-gray-400" />
            </div>
            <h4 className="text-gray-900 font-bold mb-1">Your tree is empty</h4>
            <p className="text-gray-500 text-sm max-w-xs mb-6">Plant some knowledge cards to watch your tree grow!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Root of the tree */}
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg mb-4 ml-1">
              <Network className="text-[#1a472a]" size={22} /> My Knowledge Base
            </div>

            {/* Branches (Categories) */}
            <div className="ml-5 border-l-2 border-gray-100 pl-4 space-y-3">
              {sortedCategories.map(category => {
                const isExpanded = expandedCategories[category];
                const categoryCards = groupedCards[category];
                
                return (
                  <div key={category} className="space-y-1">
                    {/* Category Node */}
                    <div 
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-2 p-2 hover:bg-[#e8f3ec] rounded-lg cursor-pointer transition-colors group select-none"
                    >
                      <span className="text-gray-400 group-hover:text-[#1a472a] transition-colors">
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </span>
                      <span className="text-[#1a472a]">
                        {isExpanded ? <FolderOpen size={18} className="fill-[#1a472a]/10" /> : <Folder size={18} className="fill-[#1a472a]/10" />}
                      </span>
                      <span className="font-semibold text-gray-800 group-hover:text-[#1a472a] transition-colors">
                        {category}
                      </span>
                      <span className="text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100 ml-2">
                        {categoryCards.length}
                      </span>
                    </div>

                    {/* Leaves (Cards in this category) */}
                    {isExpanded && (
                      <div className="ml-6 border-l-2 border-gray-100 pl-4 py-1 space-y-1">
                        {categoryCards.map(card => (
                          <div 
                            key={card.id}
                            onClick={() => openCard(card)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
                          >
                            <span className="text-gray-300 group-hover:text-[#1a472a] transition-colors">
                              <FileText size={16} />
                            </span>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                              {card.title}
                            </span>
                            
                            {card.difficulty === 'Easy' && <span className="ml-auto w-2 h-2 rounded-full bg-green-400" title="Easy"></span>}
                            {card.difficulty === 'Medium' && <span className="ml-auto w-2 h-2 rounded-full bg-orange-400" title="Medium"></span>}
                            {card.difficulty === 'Hard' && <span className="ml-auto w-2 h-2 rounded-full bg-red-400" title="Hard"></span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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

export default KnowledgeTree;
