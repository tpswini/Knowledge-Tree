import React from 'react';
import axios from 'axios';
import { Download, FileText, FileJson, Database } from 'lucide-react';

const Export = () => {
  const exportData = async (format) => {
    try {
      const token = localStorage.getItem('token');
      // Fetch all cards for export
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/cards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const cards = res.data;

      if (format === 'json') {
        const dataStr = JSON.stringify(cards, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `knowledge_tree_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'markdown') {
        let md = `# Knowledge Tree Export\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n`;
        cards.forEach(c => {
          md += `## ${c.title}\n`;
          md += `- **Category:** ${c.category || 'N/A'}\n`;
          md += `- **Difficulty:** ${c.difficulty || 'N/A'}\n`;
          md += `- **Tags:** ${c.tags || 'None'}\n\n`;
          md += `### Explanation\n${c.explanation}\n\n`;
          if (c.source) md += `**Source:** ${c.source}\n\n`;
          md += `---\n\n`;
        });
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `knowledge_tree_export_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'pdf') {
        // Simple front-end print approach for PDF
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const contentWindow = iframe.contentWindow;
        contentWindow.document.open();
        contentWindow.document.write(`
          <html>
            <head>
              <title>Knowledge Tree Export</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 40px; color: #111827; }
                h1 { color: #1a472a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                .card { margin-bottom: 30px; page-break-inside: avoid; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; }
                h2 { margin-top: 0; color: #1f2937; }
                .meta { color: #6b7280; font-size: 14px; margin-bottom: 15px; }
                .explanation { white-space: pre-wrap; line-height: 1.6; }
              </style>
            </head>
            <body>
              <h1>Knowledge Tree Export</h1>
              ${cards.map(c => `
                <div class="card">
                  <h2>${c.title}</h2>
                  <div class="meta">
                    Category: ${c.category || 'N/A'} | Difficulty: ${c.difficulty || 'N/A'}
                  </div>
                  <div class="explanation">${c.explanation || ''}</div>
                  ${c.source ? `<p><strong>Source:</strong> ${c.source}</p>` : ''}
                </div>
              `).join('')}
            </body>
          </html>
        `);
        contentWindow.document.close();
        contentWindow.focus();
        contentWindow.print();
        
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to export data');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a472a] to-[#2c7a4b] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden mb-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Database size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Data Export</h1>
              <p className="text-emerald-100 mt-1">Download your knowledge base for backup or external use.</p>
            </div>
          </div>
        </div>
        <Database className="absolute -right-8 -bottom-16 text-white/10" size={240} />
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Export Format</h2>
        
        <div className="space-y-4">
          <button 
            onClick={() => exportData('markdown')}
            className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 hover:border-[#1a472a] hover:bg-[#f8fafc] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Markdown (.md)</h3>
                <p className="text-sm text-gray-500">Structured text, perfect for Obsidian or Notion.</p>
              </div>
            </div>
            <Download size={20} className="text-gray-300 group-hover:text-[#1a472a]" />
          </button>

          <button 
            onClick={() => exportData('json')}
            className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 hover:border-[#1a472a] hover:bg-[#f8fafc] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <FileJson size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">JSON (.json)</h3>
                <p className="text-sm text-gray-500">Raw data array, ideal for programmatic backups.</p>
              </div>
            </div>
            <Download size={20} className="text-gray-300 group-hover:text-[#1a472a]" />
          </button>

          <button 
            onClick={() => exportData('pdf')}
            className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 hover:border-[#1a472a] hover:bg-[#f8fafc] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-red-50 text-red-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">PDF Print</h3>
                <p className="text-sm text-gray-500">Opens browser print dialog for a clean document.</p>
              </div>
            </div>
            <Download size={20} className="text-gray-300 group-hover:text-[#1a472a]" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default Export;
