import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Loader2, Plus, Trash2, Settings, Type, AlignLeft, List, CheckSquare, Calendar, Hash, Link as LinkIcon, Image, Star, Code, Edit3 } from 'lucide-react';

const CARD_SCHEMAS = {
  'Leaf': {
    icon: '🍃',
    name: 'Leaf (Concept)',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, isBase: true },
      { name: 'explanation', label: 'Explain in your own words', type: 'textarea', required: true, isBase: true },
      { name: 'definition', label: 'Definition', type: 'textarea' },
      { name: 'importance', label: 'Why is it important?', type: 'textarea' },
      { name: 'example', label: 'Real-world Example', type: 'textarea' },
      { name: 'keyPoints', label: 'Key Points', type: 'textarea' },
      { name: 'relatedTopics', label: 'Related Topics', type: 'text' },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'], isBase: true },
      { name: 'timeSpent', label: 'Time Spent (mins)', type: 'number', isBase: true },
      { name: 'tags', label: 'Tags', type: 'text', isBase: true },
      { name: 'source', label: 'Source', type: 'text', isBase: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'Code Leaf': {
    icon: '💻',
    name: 'Code Leaf (Programming)',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, isBase: true },
      { name: 'language', label: 'Programming Language', type: 'text', required: true },
      { name: 'problem', label: 'Problem Statement', type: 'textarea' },
      { name: 'code', label: 'Code Snippet', type: 'code' },
      { name: 'explanation', label: 'Solution Explanation', type: 'textarea', isBase: true },
      { name: 'complexity', label: 'Complexity', type: 'text' },
      { name: 'bestPractices', label: 'Best Practices', type: 'textarea' },
      { name: 'mistakes', label: 'Common Mistakes', type: 'textarea' },
      { name: 'tags', label: 'Tags', type: 'text', isBase: true },
      { name: 'repository', label: 'Repository Link', type: 'url' },
      { name: 'docs', label: 'Documentation Link', type: 'url' },
      { name: 'timeSpent', label: 'Time Spent (mins)', type: 'number', isBase: true },
    ]
  },
  'Branch': {
    icon: '📚',
    name: 'Branch (Resource)',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, isBase: true },
      { name: 'resourceType', label: 'Resource Type', type: 'select', options: ['Book', 'YouTube', 'Course', 'Documentation', 'Website'] },
      { name: 'author', label: 'Author/Creator', type: 'text' },
      { name: 'url', label: 'URL', type: 'url' },
      { name: 'platform', label: 'Platform', type: 'text' },
      { name: 'progress', label: 'Progress (0-100%)', type: 'number' },
      { name: 'rating', label: 'Rating (1-5)', type: 'select', options: ['1', '2', '3', '4', '5'] },
      { name: 'summary', label: 'Summary', type: 'textarea' },
      { name: 'notes', label: 'Important Notes', type: 'textarea' },
      { name: 'completed', label: 'Completed', type: 'checkbox' },
    ]
  },
  'Project Branch': {
    icon: '🌳',
    name: 'Project Branch',
    fields: [
      { name: 'title', label: 'Project Name', type: 'text', required: true, isBase: true },
      { name: 'explanation', label: 'Description', type: 'textarea', isBase: true },
      { name: 'techStack', label: 'Tech Stack', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Planning', 'Building', 'Testing', 'Completed'] },
      { name: 'github', label: 'GitHub Link', type: 'url' },
      { name: 'demo', label: 'Live Demo', type: 'url' },
      { name: 'features', label: 'Features', type: 'textarea' },
      { name: 'challenges', label: 'Challenges', type: 'textarea' },
      { name: 'solutions', label: 'Solutions', type: 'textarea' },
      { name: 'lessons', label: 'Lessons Learned', type: 'textarea' },
      { name: 'future', label: 'Future Improvements', type: 'textarea' },
      { name: 'timeInvested', label: 'Time Invested', type: 'text' },
    ]
  },
  'Seed': {
    icon: '🌼',
    name: 'Seed (Note)',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, isBase: true },
      { name: 'explanation', label: 'Quick Note', type: 'textarea', isBase: true },
      { name: 'tags', label: 'Tags', type: 'text', isBase: true },
      { name: 'color', label: 'Color', type: 'select', options: ['Yellow', 'Blue', 'Pink', 'Green', 'Default'] },
      { name: 'pin', label: 'Pin Note', type: 'checkbox' }
    ]
  },
  'Fruit': {
    icon: '🍎',
    name: 'Fruit (Memory)',
    fields: [
      { name: 'title', label: 'Question', type: 'text', required: true, isBase: true },
      { name: 'explanation', label: 'Answer', type: 'textarea', isBase: true },
      { name: 'difficulty', label: 'Difficulty', type: 'select', options: ['Easy', 'Medium', 'Hard'], isBase: true },
      { name: 'revisionDate', label: 'Next Revision Date', type: 'date' }
    ]
  }
};

const FIELD_TYPES = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'textarea', label: 'Textarea', icon: AlignLeft },
  { id: 'select', label: 'Dropdown', icon: List },
  { id: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'number', label: 'Number', icon: Hash },
  { id: 'url', label: 'URL', icon: LinkIcon },
  { id: 'code', label: 'Code Block', icon: Code },
  { id: 'markdown', label: 'Markdown', icon: Edit3 }
];

const CardModal = ({ isOpen, onClose, cardToEdit, initialCategory, onSave }) => {
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'Leaf');
  const [formData, setFormData] = useState({ title: '', explanation: '' });
  const [contentData, setContentData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Custom Builder State
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [customSchema, setCustomSchema] = useState({ name: '', icon: '🌱', color: 'White', fields: [] });
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (cardToEdit) {
        setActiveCategory(cardToEdit.category || 'Leaf');
        setFormData({
          title: cardToEdit.title || '',
          explanation: cardToEdit.explanation || '',
          tags: cardToEdit.tags || '',
          difficulty: cardToEdit.difficulty || 'Easy',
          timeSpent: cardToEdit.timeSpent || '',
          source: cardToEdit.source || ''
        });
        
        if (cardToEdit.content) {
          setContentData(typeof cardToEdit.content === 'string' ? JSON.parse(cardToEdit.content) : cardToEdit.content);
          if (cardToEdit.content.isCustom) {
            setCustomSchema(cardToEdit.content.schema);
            setActiveCategory('Custom');
          }
        } else {
          setContentData({});
        }
      } else {
        setActiveCategory(initialCategory || 'Leaf');
        setFormData({ title: '', explanation: '' });
        setContentData({});
        if (initialCategory === 'Custom') {
          setIsBuilderMode(true);
          setCustomSchema({ name: '', icon: '🌱', color: 'White', fields: [] });
        } else {
          setIsBuilderMode(false);
        }
      }
      setError('');
    }
  }, [cardToEdit, isOpen, initialCategory]);

  if (!isOpen) return null;

  const handleBaseChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setContentData({ ...contentData, [e.target.name]: value });
  };

  const addCustomField = (type) => {
    const fieldName = `field_${Date.now()}`;
    setCustomSchema(prev => ({
      ...prev,
      fields: [...prev.fields, { name: fieldName, label: 'New Field', type, options: type === 'select' ? ['Option 1'] : [] }]
    }));
    setShowFieldPicker(false);
  };

  const updateCustomField = (index, key, value) => {
    const newFields = [...customSchema.fields];
    newFields[index][key] = value;
    setCustomSchema({ ...customSchema, fields: newFields });
  };

  const removeCustomField = (index) => {
    const newFields = customSchema.fields.filter((_, i) => i !== index);
    setCustomSchema({ ...customSchema, fields: newFields });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    if (activeCategory === 'Custom' && customSchema.fields.length === 0) {
       setError('Please add at least one field to your custom card.');
       setIsLoading(false);
       return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Compile final data
      const finalContent = activeCategory === 'Custom' ? {
        isCustom: true,
        schema: customSchema,
        ...contentData
      } : {
        ...contentData
      };

      const payload = {
        ...formData,
        category: activeCategory === 'Custom' ? (customSchema.name || 'Custom') : activeCategory,
        content: finalContent
      };

      if (cardToEdit) {
        await axios.put(`http://localhost:5000/api/cards/${cardToEdit.id}`, payload, { headers });
      } else {
        await axios.post('http://localhost:5000/api/cards', payload, { headers });
      }
      
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save card.');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderer for dynamic fields
  const renderField = (field, isCustomBuilder = false, index = -1) => {
    const isBase = field.isBase;
    const value = isBase ? formData[field.name] : contentData[field.name];
    const onChange = isBase ? handleBaseChange : handleContentChange;
    
    return (
      <div key={field.name} className={`space-y-1.5 ${field.type === 'textarea' || field.type === 'code' || field.type === 'markdown' ? 'col-span-full' : ''}`}>
        
        {isCustomBuilder ? (
           <div className="flex items-center justify-between mb-1">
             <input 
               value={field.label} 
               onChange={(e) => updateCustomField(index, 'label', e.target.value)}
               className="font-semibold text-gray-700 bg-transparent border-b border-gray-300 focus:border-[#1a472a] focus:outline-none"
             />
             <button type="button" onClick={() => removeCustomField(index)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
           </div>
        ) : (
           <label className="text-sm font-semibold text-gray-700">{field.label} {field.required && '*'}</label>
        )}

        {field.type === 'textarea' || field.type === 'markdown' ? (
          <textarea 
            name={field.name} value={value || ''} onChange={onChange} required={field.required}
            rows={field.type === 'markdown' ? 6 : 3}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] transition-all outline-none resize-none font-sans"
          />
        ) : field.type === 'code' ? (
          <textarea 
            name={field.name} value={value || ''} onChange={onChange} required={field.required}
            rows={6}
            className="w-full px-4 py-3 bg-[#1e1e2e] text-gray-200 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] transition-all outline-none font-mono text-sm"
          />
        ) : field.type === 'select' ? (
          <div className="flex gap-2">
            <select 
              name={field.name} value={value || ''} onChange={onChange} required={field.required}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] transition-all outline-none"
            >
              <option value="">Select option...</option>
              {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {isCustomBuilder && (
              <input 
                placeholder="Comma separated options"
                value={field.options.join(', ')}
                onChange={(e) => updateCustomField(index, 'options', e.target.value.split(',').map(s => s.trim()))}
                className="flex-1 px-3 py-1 text-xs border rounded-lg"
              />
            )}
          </div>
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center h-[42px] px-4 bg-gray-50 border border-gray-200 rounded-xl">
            <input 
              type="checkbox" name={field.name} checked={!!value} onChange={onChange}
              className="w-5 h-5 text-[#1a472a] rounded border-gray-300 focus:ring-[#1a472a]"
            />
            <span className="ml-3 text-sm text-gray-700">Yes</span>
          </div>
        ) : (
          <input 
            type={field.type} name={field.name} value={value || ''} onChange={onChange} required={field.required}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] transition-all outline-none"
          />
        )}
      </div>
    );
  };

  const schema = activeCategory === 'Custom' ? customSchema : CARD_SCHEMAS[activeCategory];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="text-2xl bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
              {schema?.icon || '🌱'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {cardToEdit ? 'Edit ' : (activeCategory === 'Custom' && isBuilderMode ? 'Design ' : 'Plant ')} 
                {activeCategory === 'Custom' ? (schema?.name || 'Custom Branch') : schema?.name}
              </h2>
              <p className="text-sm text-gray-500 font-medium">{activeCategory === 'Custom' && isBuilderMode ? 'Build your own card template' : 'Grow your knowledge tree'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCategory === 'Custom' && !isBuilderMode && !cardToEdit && (
               <button onClick={() => setIsBuilderMode(true)} className="p-2 text-gray-500 hover:text-[#1a472a] bg-white border border-gray-200 rounded-lg shadow-sm">
                 <Settings size={18} />
               </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm rounded-lg transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form id="cardForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {activeCategory === 'Custom' && isBuilderMode ? (
              // BUILDER UI
              <div className="col-span-full space-y-6">
                <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Template Name</label>
                    <input 
                      value={customSchema.name} onChange={(e) => setCustomSchema({...customSchema, name: e.target.value})}
                      placeholder="e.g., Interview Card"
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Icon Emoji</label>
                    <input 
                      value={customSchema.icon} onChange={(e) => setCustomSchema({...customSchema, icon: e.target.value})}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none text-center text-xl"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 border-b pb-2">Defined Fields</h3>
                  
                  {/* Always require Title for DB compatibility */}
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl opacity-70">
                    <span className="font-semibold text-gray-700">Title (Required, Text)</span>
                  </div>

                  {customSchema.fields.map((field, idx) => (
                    <div key={idx} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm relative group">
                      {renderField(field, true, idx)}
                    </div>
                  ))}

                  <div className="relative">
                    <button 
                      type="button" onClick={() => setShowFieldPicker(!showFieldPicker)}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-[#1a472a] hover:border-[#1a472a] hover:bg-[#f0f9f0] transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Plus size={18} /> Add Field
                    </button>
                    
                    {showFieldPicker && (
                      <div className="absolute z-10 bottom-full mb-2 left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {FIELD_TYPES.map(ft => {
                          const Icon = ft.icon;
                          return (
                            <button 
                              key={ft.id} type="button" onClick={() => addCustomField(ft.id)}
                              className="flex flex-col items-center justify-center p-3 gap-2 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
                            >
                              <Icon size={20} className="text-gray-600" />
                              <span className="text-xs font-semibold text-gray-700">{ft.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // RENDERER UI
              <>
                {/* Fixed base title if custom doesn't define it */}
                {activeCategory === 'Custom' && (
                  <div className="col-span-full space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Title *</label>
                    <input 
                      name="title" value={formData.title} onChange={handleBaseChange} required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1a472a]/20 focus:border-[#1a472a] outline-none"
                    />
                  </div>
                )}
                {schema?.fields.map(field => renderField(field))}
              </>
            )}
            
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center shrink-0">
          <div>
             {activeCategory === 'Custom' && isBuilderMode ? (
               <button type="button" onClick={() => setIsBuilderMode(false)} className="text-sm font-medium text-blue-600 hover:underline">
                 Preview Form
               </button>
             ) : activeCategory === 'Custom' && !cardToEdit ? (
               <button type="button" onClick={() => setIsBuilderMode(true)} className="text-sm font-medium text-blue-600 hover:underline">
                 Back to Builder
               </button>
             ) : null}
          </div>
          <div className="flex gap-3">
            <button 
              type="button" onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" form="cardForm" disabled={isLoading}
              className="flex items-center gap-2 bg-[#1a472a] hover:bg-[#153a22] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {cardToEdit ? 'Save Changes' : (isBuilderMode ? 'Save Template & Proceed' : 'Plant Knowledge')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CardModal;
