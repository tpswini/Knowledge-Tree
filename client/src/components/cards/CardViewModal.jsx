import { X, Edit2, Clock, Calendar, ExternalLink, Code as CodeIcon } from 'lucide-react';
import { CARD_SCHEMAS } from './CardModal';

const CardViewModal = ({ isOpen, onClose, card, onEdit }) => {
  if (!isOpen || !card) return null;

  // Find the matching schema for the card's category
  let schema = null;
  if (card.content?.isCustom) {
    schema = card.content.schema;
  } else {
    schema = CARD_SCHEMAS[card.category] || CARD_SCHEMAS['Concept']; // Fallback
  }

  const renderField = (fieldKey, value) => {
    if (!value || value === '') return null;
    
    // Ignore internal properties
    if (['isCustom', 'schema', 'icon'].includes(fieldKey)) return null;

    // Find field schema for label and type
    const fieldSchema = schema?.fields?.find(f => f.name === fieldKey);
    const label = fieldSchema?.label || fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1).replace(/([A-Z])/g, ' $1');
    const type = fieldSchema?.type || 'text';

    if (type === 'code') {
      return (
        <div key={fieldKey} className="mb-6 col-span-full">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 block">{label}</label>
          <div className="bg-[#282c34] text-gray-300 p-4 rounded-xl font-mono text-sm overflow-x-auto shadow-inner">
            <div className="flex gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <pre className="whitespace-pre-wrap">{value}</pre>
          </div>
        </div>
      );
    }

    if (type === 'url') {
      return (
        <div key={fieldKey} className="mb-4">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1.5 font-medium break-all">
            {value} <ExternalLink size={14} />
          </a>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div key={fieldKey} className="mb-6 col-span-full">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-gray-800 whitespace-pre-wrap text-[15px] leading-relaxed">
            {value}
          </div>
        </div>
      );
    }

    if (type === 'checkbox') {
      return (
        <div key={fieldKey} className="mb-4 flex items-center gap-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}:</label>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {value ? 'Yes' : 'No'}
          </span>
        </div>
      );
    }

    return (
      <div key={fieldKey} className="mb-4">
        <label className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
        <div className="text-gray-800 font-medium">{value}</div>
      </div>
    );
  };

  const getStyle = () => {
    switch(card.category?.toLowerCase()) {
      case 'concept': return { bg: 'bg-[#f0f9f0]', text: 'text-[#5a8c64]' };
      case 'code': return { bg: 'bg-[#f5f0fb]', text: 'text-[#9b72cf]' };
      case 'resource': return { bg: 'bg-[#f0f5fb]', text: 'text-[#6395d8]' };
      case 'project': return { bg: 'bg-[#fbf5f0]', text: 'text-[#c1865a]' };
      case 'quick note': return { bg: 'bg-[#fcfaf0]', text: 'text-[#d4b953]' };
      case 'memory': return { bg: 'bg-[#fff0f0]', text: 'text-[#e57373]' };
      case 'custom': return { bg: 'bg-white', text: 'text-gray-600' };
      default: return { bg: 'bg-[#f0f9f0]', text: 'text-[#5a8c64]' };
    }
  };

  const style = getStyle();
  const icon = card.content?.icon || schema?.icon || '💡';
  
  // Sort keys so title, explanation come first, and textareas come last
  const getSortedEntries = () => {
    if (!card.content) return [];
    
    const entries = Object.entries(card.content);
    return entries.sort(([keyA], [keyB]) => {
      if (keyA === 'title') return -1;
      if (keyB === 'title') return 1;
      if (keyA === 'explanation') return -1;
      if (keyB === 'explanation') return 1;
      
      const typeA = schema?.fields?.find(f => f.name === keyA)?.type || 'text';
      const typeB = schema?.fields?.find(f => f.name === keyB)?.type || 'text';
      
      if (typeA === 'textarea' || typeA === 'code') return 1;
      if (typeB === 'textarea' || typeB === 'code') return -1;
      
      return 0;
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${style.bg} p-6 border-b border-black/5 flex items-start justify-between relative`}>
          <div className="flex items-center gap-4">
            <div className="text-4xl bg-white/60 backdrop-blur-sm w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-white/50">
              {icon}
            </div>
            <div>
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${style.text}`}>
                {card.category}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {card.title || card.content?.title || 'Untitled Card'}
              </h2>
            </div>
          </div>
          <div className="flex gap-2 relative z-10">
            <button 
              onClick={() => {
                onEdit(card);
                onClose();
              }}
              className="p-2.5 text-gray-600 hover:text-[#1a472a] bg-white/50 hover:bg-white rounded-xl shadow-sm transition-all flex items-center gap-2 font-semibold text-sm"
            >
              <Edit2 size={16} /> <span className="hidden sm:inline">Edit</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2.5 text-gray-500 hover:text-gray-700 bg-white/50 hover:bg-white rounded-xl shadow-sm transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          
          <div className="flex flex-wrap gap-2 mb-8">
            {card.tags && card.tags.split(',').map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold border border-gray-200">
                #{tag.trim()}
              </span>
            ))}
            <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold border border-gray-100 flex items-center gap-1.5 ml-auto">
              <Calendar size={13} /> {new Date(card.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {getSortedEntries().map(([key, value]) => renderField(key, value))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CardViewModal;
