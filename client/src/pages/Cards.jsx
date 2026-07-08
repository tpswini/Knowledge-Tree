import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Filter, BookOpen, Star, Archive, Edit2, Copy, Trash2, X, 
  Zap, Palette, Check, Leaf, Code2, Briefcase, Edit3, Brush, Bookmark, Calendar, Clock,
  ChevronLeft, ChevronRight, ArrowRight
} from 'lucide-react';
import CardModal from '../components/cards/CardModal';
import CardViewModal from '../components/cards/CardViewModal';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [viewCard, setViewCard] = useState(null);
  const [initialCategory, setInitialCategory] = useState(null);
  const [initialSchema, setInitialSchema] = useState(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    timeframe: 'All', 
    category: 'All',
    difficulty: 'All',
    isFavorite: false,
    isArchived: false
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [hiddenTemplates, setHiddenTemplates] = useState(() => {
    const stored = localStorage.getItem('hiddenTemplates');
    return stored ? JSON.parse(stored) : [];
  });
  
  const [toastMessage, setToastMessage] = useState('');

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/cards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(res.data);
    } catch (err) {
      setError('Failed to fetch cards');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const openCreateModal = (category = 'Leaf', schema = null) => {
    setCardToEdit(null);
    setInitialCategory(category);
    setInitialSchema(schema);
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setCardToEdit(card);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!cardToDelete) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/cards/${cardToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCards();
    } catch (err) {
      alert('Failed to delete card');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCardToDelete(null);
    }
  };

  const handleAction = async (action, id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (action === 'delete') {
        setCardToDelete(id);
        setDeleteModalOpen(true);
        return;
      } else if (action === 'duplicate') {
        await axios.post(`${import.meta.env.VITE_API_URL}/cards/${id}/duplicate`, {}, { headers });
      } else if (action === 'archive') {
        await axios.put(`${import.meta.env.VITE_API_URL}/cards/${id}/archive`, {}, { headers });
      } else if (action === 'favorite') {
        await axios.put(`${import.meta.env.VITE_API_URL}/cards/${id}/favorite`, {}, { headers });
      }
      
      fetchCards();
    } catch (err) {
      alert(`Failed to ${action} card`);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ timeframe: 'All', category: 'All', difficulty: 'All', isFavorite: false, isArchived: false });
    setSearch('');
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Set(cards.map(c => c.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [cards]);

  const customTemplates = useMemo(() => {
    const templates = {};
    cards.forEach(card => {
      if (card.content?.isCustom && card.content?.schema) {
        const schema = card.content.schema;
        if (schema.name && !templates[schema.name] && !hiddenTemplates.includes(schema.name)) {
          templates[schema.name] = schema;
        }
      }
    });
    return Object.values(templates);
  }, [cards, hiddenTemplates]);

  const hasActiveFilters = filters.timeframe !== 'All' || filters.category !== 'All' || 
                           filters.difficulty !== 'All' || filters.isFavorite || filters.isArchived || search !== '';

  const filteredCards = cards.filter(card => {
    let matchesSearch = true;
    if (search.trim()) {
      const s = search.toLowerCase();
      const dateStr = new Date(card.createdAt).toLocaleDateString();
      matchesSearch = (
        card.title.toLowerCase().includes(s) ||
        card.explanation.toLowerCase().includes(s) ||
        (card.category && card.category.toLowerCase().includes(s)) ||
        (card.tags && card.tags.toLowerCase().includes(s)) ||
        (card.source && card.source.toLowerCase().includes(s)) ||
        (card.difficulty && card.difficulty.toLowerCase().includes(s)) ||
        dateStr.includes(s)
      );
    }
    if (!matchesSearch) return false;

    if (filters.isFavorite && !card.isFavorite) return false;
    if (filters.isArchived !== card.isArchived) return false;

    if (filters.category !== 'All' && card.category !== filters.category) return false;
    if (filters.difficulty !== 'All' && card.difficulty !== filters.difficulty) return false;

    if (filters.timeframe !== 'All') {
      const cardDate = new Date(card.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0); 
      
      if (filters.timeframe === 'Today') {
        if (cardDate < today) return false;
      } else if (filters.timeframe === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (cardDate < yesterday || cardDate >= today) return false;
      } else if (filters.timeframe === 'Last Week') {
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        if (cardDate < lastWeek) return false;
      } else if (filters.timeframe === 'Last Month') {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        if (cardDate < lastMonth) return false;
      }
    }

    return true;
  });

  const getCardStyle = (category) => {
    switch(category?.toLowerCase()) {
      case 'concept': return { bg: 'bg-[#f0f9f0]', text: 'text-[#5a8c64]', icon: '' };
      case 'code': return { bg: 'bg-[#f5f0fb]', text: 'text-[#9b72cf]', icon: '' };
      case 'resource': return { bg: 'bg-[#f0f5fb]', text: 'text-[#6395d8]', icon: '' };
      case 'project': return { bg: 'bg-[#fbf5f0]', text: 'text-[#c1865a]', icon: '' };
      case 'quick note': return { bg: 'bg-[#fcfaf0]', text: 'text-[#d4b953]', icon: '' };
      case 'memory': return { bg: 'bg-[#fff0f0]', text: 'text-[#e57373]', icon: '' };
      case 'custom': return { bg: 'bg-white', text: 'text-gray-600', icon: '' };
      // Fallbacks for old data
      case 'leaf': return { bg: 'bg-[#f0f9f0]', text: 'text-[#5a8c64]', icon: '' };
      case 'code leaf': return { bg: 'bg-[#f5f0fb]', text: 'text-[#9b72cf]', icon: '' };
      case 'branch': return { bg: 'bg-[#f0f5fb]', text: 'text-[#6395d8]', icon: '' };
      case 'project branch': return { bg: 'bg-[#fbf5f0]', text: 'text-[#c1865a]', icon: '' };
      case 'seed': return { bg: 'bg-[#fcfaf0]', text: 'text-[#d4b953]', icon: '' };
      case 'fruit': return { bg: 'bg-[#fff0f0]', text: 'text-[#e57373]', icon: '' };
      case 'note': return { bg: 'bg-[#fcfaf0]', text: 'text-[#d4b953]', icon: '' };
      default: return { bg: 'bg-[#f0f9f0]', text: 'text-[#5a8c64]', icon: '' }; 
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-[#133022]">
        <div className="absolute inset-0 z-0">
          <img src="/header_tree_bg.png" alt="Tree" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d2116] via-[#0d2116]/80 to-[#133022]/20"></div>
        </div>
        <div className="relative z-10 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            What did you learn today? <span className="text-2xl"></span>
          </h1>
          <p className="text-gray-200 mb-8 max-w-lg text-lg">
            Capture a lesson, create a memory, grow your tree.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => openCreateModal('Concept')}
              className="flex items-center gap-2 bg-[#6b9d75] hover:bg-[#5a8c64] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus size={20} /> New Concept
            </button>
            <button 
              onClick={() => openCreateModal('Quick Note')}
              className="flex items-center gap-2 bg-transparent border border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              <Zap size={20} /> Quick Note
            </button>
          </div>
        </div>
      </div>

      {/* Choose a Card Style */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <Palette className="text-gray-700" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Choose a Card Style</h2>
        </div>
        <p className="text-gray-500 text-sm mb-6 ml-9">Different cards for different kinds of knowledge.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div onClick={() => openCreateModal('Concept')} className="bg-[#f0f9f0] border-2 border-[#6b9d75] rounded-2xl p-5 cursor-pointer relative hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mx-auto text-2xl"></div>
            <div>
              <h3 className="font-bold text-center text-gray-900 text-sm">Concept</h3>
              <p className="text-center text-[#5a8c64] text-[11px] mt-1 font-medium leading-tight">Learn a new idea</p>
            </div>
          </div>
          
          <div onClick={() => openCreateModal('Code')} className="bg-[#f5f0fb] border border-transparent rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mx-auto text-2xl"></div>
            <div>
              <h3 className="font-bold text-center text-gray-900 text-sm">Code</h3>
              <p className="text-center text-[#7e55af] text-[11px] mt-1 font-medium leading-tight">Save code snippets & solutions</p>
            </div>
          </div>

          <div onClick={() => openCreateModal('Resource')} className="bg-[#f0f5fb] border border-transparent rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mx-auto text-2xl"></div>
            <div>
              <h3 className="font-bold text-center text-gray-900 text-sm">Resource</h3>
              <p className="text-center text-[#4a7ebd] text-[11px] mt-1 font-medium leading-tight">Books, videos & articles</p>
            </div>
          </div>

          <div onClick={() => openCreateModal('Project')} className="bg-[#fbf5f0] border border-transparent rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mx-auto text-2xl"></div>
            <div>
              <h3 className="font-bold text-center text-gray-900 text-sm">Project</h3>
              <p className="text-center text-[#a1683d] text-[11px] mt-1 font-medium leading-tight">Track your projects</p>
            </div>
          </div>

          <div onClick={() => openCreateModal('Quick Note')} className="bg-[#fcfaf0] border border-transparent rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mx-auto text-2xl"></div>
            <div>
              <h3 className="font-bold text-center text-gray-900 text-sm leading-tight">Quick Note</h3>
              <p className="text-center text-[#b89e35] text-[11px] mt-1 font-medium leading-tight">Capture thoughts instantly</p>
            </div>
          </div>
          
          <div onClick={() => openCreateModal('Memory')} className="bg-[#fff0f0] border border-transparent rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-3 mx-auto text-2xl"></div>
            <div>
              <h3 className="font-bold text-center text-gray-900 text-sm">Memory</h3>
              <p className="text-center text-[#e57373] text-[11px] mt-1 font-medium leading-tight">Flashcards & revision</p>
            </div>
          </div>

          {/* Custom User Templates */}
          {customTemplates.map((template, idx) => (
            <div key={idx} className="relative group bg-white border-2 border-[#6b9d75]/30 rounded-2xl p-5 cursor-pointer hover:border-[#6b9d75] hover:shadow-md transition-all flex flex-col justify-between">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setTemplateToDelete(template.name);
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Delete Template"
              >
                <Trash2 size={16} />
              </button>
              <div onClick={() => openCreateModal('Custom', template)} className="flex-1 flex flex-col justify-between">
                <div className="w-12 h-12 bg-gray-50 rounded-xl shadow-sm flex items-center justify-center mb-3 mx-auto text-2xl">{template.icon || ''}</div>
                <div>
                  <h3 className="font-bold text-center text-gray-900 text-sm leading-tight">{template.name}</h3>
                  <p className="text-center text-[#5a8c64] text-[11px] mt-1 font-medium leading-tight">Custom Template</p>
                </div>
              </div>
            </div>
          ))}

          <div onClick={() => openCreateModal('Custom')} className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-[#6b9d75] hover:bg-[#f0f9f0] transition-colors flex flex-col justify-between group">
            <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl shadow-sm flex items-center justify-center mb-3 mx-auto text-2xl group-hover:bg-white"></div>
            <div>
              <h3 className="font-bold text-center text-gray-900 text-sm leading-tight">Custom</h3>
              <p className="text-center text-gray-400 text-[11px] mt-1 font-medium leading-tight">Build your own card</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Created Cards Section */}
      <div className="space-y-6">
        
        {/* Section Header & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="text-[#6b9d75]" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Recently Created Cards</h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Minimal Search & Filter */}
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] transition-all text-sm"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-full border transition-colors ${
                showFilters || hasActiveFilters ? 'bg-[#e8f3ec] text-[#1a472a] border-[#1a472a]/20' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
            </button>
            
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            
            <button className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
              <Check size={16} className="text-[#6b9d75]"/> View All <ArrowRight size={16} />
            </button>
            
            <div className="flex items-center gap-1 ml-2">
              <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Same filter content as before */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Timeframe</label>
              <select 
                value={filters.timeframe} onChange={(e) => handleFilterChange('timeframe', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a472a]"
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="Yesterday">Yesterday</option>
                <option value="Last Week">Last Week</option>
                <option value="Last Month">Last Month</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
              <select 
                value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a472a]"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase">Difficulty</label>
              <select 
                value={filters.difficulty} onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a472a]"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="space-y-1.5 flex flex-col justify-end">
              <div className="flex gap-2">
                <button 
                  onClick={() => handleFilterChange('isFavorite', !filters.isFavorite)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-1 ${
                    filters.isFavorite ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Star size={14} className={filters.isFavorite ? 'fill-yellow-400' : ''} /> Favorites
                </button>
                <button 
                  onClick={() => handleFilterChange('isArchived', !filters.isArchived)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-1 ${
                    filters.isArchived ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Archive size={14} /> Archived
                </button>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="md:col-span-4 flex justify-end">
                <button onClick={clearFilters} className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1">
                  <X size={14} /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Cards Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#1a472a]"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>
        ) : filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <h4 className="text-gray-900 font-bold mb-1">No matches found</h4>
            <p className="text-gray-500 text-sm max-w-xs mb-6">Try adjusting your filters or search terms.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-[#1a472a] font-medium hover:underline text-sm">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredCards.map(card => {
              const style = getCardStyle(card.category);
              const isCode = card.category?.toLowerCase() === 'code';
              
              return (
                <div key={card.id} onClick={() => setViewCard(card)} className={`${style.bg} rounded-3xl p-5 relative shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-black/[0.03] hover:shadow-lg transition-shadow flex flex-col group h-[320px] cursor-pointer`}>
                  
                  {/* Actions overlay on hover */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-black/5 opacity-0 group-hover:opacity-100 transition-all z-10 flex gap-1 translate-y-2 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(card); }} className="p-2 text-gray-500 hover:text-[#1a472a] hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleAction('duplicate', card.id); }} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Duplicate">
                      <Copy size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleAction('delete', card.id); }} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/70 backdrop-blur-sm ${style.text}`}>
                      {card.category || 'Leaf'}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleAction('favorite', card.id); }}
                      className={`transition-colors ${card.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-700'}`}
                    >
                      <Bookmark size={18} className={card.isFavorite ? 'fill-yellow-500' : ''} />
                    </button>
                  </div>
                  
                  {/* Visual Element */}
                  <div className="flex-1 flex flex-col items-center justify-center mb-4 min-h-[90px] max-h-[100px]">
                     {isCode ? (
                        <div className="w-full h-full bg-[#282c34] text-left p-3 rounded-xl text-[10px] text-gray-300 font-mono shadow-inner overflow-hidden relative">
                           <div className="absolute top-2 left-2 flex gap-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                             <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                             <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                           </div>
                           <div className="mt-2 whitespace-pre-wrap line-clamp-3">
                             {card.content?.code || card.explanation || card.title}
                           </div>
                        </div>
                     ) : (
                       <div className="text-5xl filter drop-shadow-sm">{card.content?.icon || style.icon}</div>
                     )}
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-1.5 line-clamp-2">{card.title}</h3>
                  <p className="text-gray-600 text-xs line-clamp-2 mb-3 flex-1">{card.content?.description || card.explanation}</p>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                    {card.tags ? card.tags.split(',').slice(0, 2).map((tag, i) => (
                       <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-semibold bg-white/60 border border-white ${style.text}`}>
                         {tag.trim()}
                       </span>
                    )) : (
                       <span className={`px-2 py-0.5 rounded text-[10px] font-semibold bg-white/60 border border-white ${style.text}`}>
                         Knowledge
                       </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px] text-gray-500 font-medium pt-3 border-t border-black/5">
                    <span className="flex items-center gap-1.5"><Calendar size={13}/> {new Date(card.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <span className="flex items-center gap-1.5"><Clock size={13}/> 15 min</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="mt-4 bg-[#eaf4ed] rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between border border-[#d3ebd9]">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm"></div>
          <div>
            <h4 className="font-bold text-[#1f4a2c] text-lg">Every card you create is a leaf on your tree.</h4>
            <p className="text-[#3b6b4b] text-sm mt-0.5 font-medium">Keep learning, keep growing! </p>
          </div>
        </div>
        <div className="flex items-end gap-3 opacity-90 drop-shadow-sm">
          <div className="text-3xl translate-y-2"></div>
          <div className="text-4xl"></div>
          <div className="text-3xl translate-y-1"></div>
        </div>
      </div>

      <CardViewModal
        isOpen={!!viewCard}
        card={viewCard}
        onClose={() => setViewCard(null)}
        onEdit={(c) => {
          setViewCard(null);
          openEditModal(c);
        }}
      />

      <CardModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        cardToEdit={cardToEdit}
        initialCategory={initialCategory}
        initialSchema={initialSchema}
        onSave={() => {
          fetchCards();
          setToastMessage(' Your knowledge has grown!');
          setTimeout(() => setToastMessage(''), 3500);
        }} 
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full text-red-600">
                  <Trash2 size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Card?</h3>
              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to delete this card? This action is permanent and cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setDeleteModalOpen(false); setCardToDelete(null); }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Card'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Delete Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full text-red-600">
                  <Trash2 size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Template?</h3>
              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to remove the template "{templateToDelete}"? Existing cards using this template will not be affected.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setTemplateToDelete(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const newHidden = [...hiddenTemplates, templateToDelete];
                    setHiddenTemplates(newHidden);
                    localStorage.setItem('hiddenTemplates', JSON.stringify(newHidden));
                    setTemplateToDelete(null);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                >
                  Delete Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[200] bg-[#1a472a] text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <span className="font-semibold text-[15px]">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Cards;
