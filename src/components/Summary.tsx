import ReactMarkdown from 'react-markdown';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

interface SummaryProps {
  content: string;
  fileName: string;
}

export default function Summary({ content, fileName }: SummaryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.pdf', '')}_summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      <div className="border-bottom border-slate-200 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-slate-900">Study Summary</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-blue-600 border border-transparent hover:border-slate-200"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-blue-600 border border-transparent hover:border-slate-200"
            title="Download as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-8 prose prose-slate max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
