/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  History, 
  LayoutDashboard, 
  FileText, 
  BrainCircuit, 
  Plus,
  Trash2,
  ChevronLeft,
  FolderOpen,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import FileUpload from './components/FileUpload';
import Summary from './components/Summary';
import Quiz from './components/Quiz';
import { processPDF } from './services/gemini';
import { StudyMaterial, AppState } from './types';
import { cn } from './lib/utils';

interface LocalFile {
  name: string;
  handle: any;
}

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [history, setHistory] = useState<StudyMaterial[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<StudyMaterial | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz'>('summary');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Local Folder State
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [directoryHandle, setDirectoryHandle] = useState<any>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('study_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('study_history', JSON.stringify(history));
  }, [history]);

  const handleFilesSelect = async (files: File[]) => {
    setState('processing');
    const newMaterials: StudyMaterial[] = [];
    
    for (const file of files) {
      try {
        const result = await processPDF(file);
        const newMaterial: StudyMaterial = {
          id: crypto.randomUUID(),
          fileName: file.name,
          summary: result.summary,
          quiz: result.quiz,
          timestamp: Date.now(),
        };
        newMaterials.push(newMaterial);
      } catch (error) {
        console.error(`Failed to process ${file.name}`, error);
      }
    }

    if (newMaterials.length > 0) {
      setHistory(prev => [...newMaterials, ...prev]);
      setCurrentMaterial(newMaterials[0]);
      setState('viewing');
      setActiveTab('summary');
    } else {
      alert('Failed to process any files. Please try again.');
      setState('idle');
    }
  };

  const handleConnectFolder = async () => {
    try {
      // Note: This might be blocked in iframes. User should open in new tab if it fails.
      const handle = await (window as any).showDirectoryPicker();
      setDirectoryHandle(handle);
      await scanDirectory(handle);
    } catch (err) {
      if ((err as Error).name === 'SecurityError') {
        alert('Browser security blocked folder access in the preview. Please click "Open in new tab" at the top right to use this feature!');
      } else if ((err as Error).name !== 'AbortError') {
        console.error('Folder access error:', err);
      }
    }
  };

  const scanDirectory = async (handle: any) => {
    const files: LocalFile[] = [];
    for await (const entry of handle.values()) {
      if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.pdf')) {
        files.push({ name: entry.name, handle: entry as any });
      }
    }
    setLocalFiles(files);
  };

  const processLocalFile = async (localFile: LocalFile) => {
    setState('processing');
    try {
      const file = await localFile.handle.getFile();
      const result = await processPDF(file);
      const newMaterial: StudyMaterial = {
        id: crypto.randomUUID(),
        fileName: file.name,
        summary: result.summary,
        quiz: result.quiz,
        timestamp: Date.now(),
      };
      setHistory(prev => [newMaterial, ...prev]);
      setCurrentMaterial(newMaterial);
      setState('viewing');
      setActiveTab('summary');
    } catch (error) {
      console.error(`Failed to process ${localFile.name}`, error);
      alert(`Failed to process ${localFile.name}`);
      setState('idle');
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    if (currentMaterial?.id === id) {
      setCurrentMaterial(null);
      setState('idle');
    }
  };

  const selectHistoryItem = (item: StudyMaterial) => {
    setCurrentMaterial(item);
    setState('viewing');
    setActiveTab('summary');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 0 }}
        className="bg-white border-r border-slate-200 overflow-hidden flex flex-col relative"
      >
        <div className="p-6 border-b border-slate-200 flex items-center justify-between min-w-[320px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">StudyFlow</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 lg:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-w-[320px]">
          <div className="p-4 space-y-6">
            <button
              onClick={() => {
                setState('idle');
                setCurrentMaterial(null);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Study Session
            </button>

            {/* Local Folder Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <FolderOpen className="w-3 h-3" />
                  Local Folder
                </div>
                {directoryHandle && (
                  <button 
                    onClick={() => scanDirectory(directoryHandle)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                    title="Refresh folder"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              {!directoryHandle ? (
                <button
                  onClick={handleConnectFolder}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-slate-200 text-slate-500 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-600 transition-all text-sm font-medium"
                >
                  <FolderOpen className="w-4 h-4" />
                  Connect Local Folder
                </button>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {localFiles.length === 0 ? (
                    <p className="text-xs text-slate-400 px-3 italic">No PDFs found in folder</p>
                  ) : (
                    localFiles.map((file) => (
                      <button
                        key={file.name}
                        onClick={() => processLocalFile(file)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-all text-left group"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                        <span className="text-xs font-medium truncate">{file.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* History Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <History className="w-3 h-3" />
                Recent Sessions
              </div>
              
              <div className="space-y-1">
                {history.length === 0 ? (
                  <div className="px-4 py-4 text-center">
                    <p className="text-xs text-slate-400 italic">No history yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectHistoryItem(item)}
                      className={cn(
                        "w-full group flex items-center justify-between p-3 rounded-xl transition-all text-left",
                        currentMaterial?.id === item.id 
                          ? "bg-blue-50 text-blue-700 border border-blue-100" 
                          : "hover:bg-slate-100 text-slate-600 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className={cn(
                          "w-4 h-4 flex-shrink-0",
                          currentMaterial?.id === item.id ? "text-blue-600" : "text-slate-400"
                        )} />
                        <span className="text-sm font-medium truncate">{item.fileName}</span>
                      </div>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 min-w-[320px]">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-slate-400 leading-tight">
              To run this app fully offline on your machine, export the code from the Settings menu.
            </p>
            <a 
              href="https://github.com/google-gemini/generative-ai-js" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] text-blue-500 hover:underline"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              Powered by Gemini SDK
            </a>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
            )}
            {state === 'viewing' && currentMaterial && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-600 truncate max-w-[200px]">
                  {currentMaterial.fileName}
                </span>
              </div>
            )}
          </div>

          {state === 'viewing' && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('summary')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                  activeTab === 'summary' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <FileText className="w-4 h-4" />
                Summary
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                  activeTab === 'quiz' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <BrainCircuit className="w-4 h-4" />
                Quiz
              </button>
            </div>
          )}
          
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {state === 'idle' || state === 'processing' ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-12"
                >
                  <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">
                      Master any subject with AI
                    </h2>
                    <p className="text-lg text-slate-500 max-w-xl mx-auto">
                      Upload your lecture notes, research papers, or textbooks and let StudyFlow 
                      generate personalized summaries and interactive quizzes.
                    </p>
                  </div>
                  <FileUpload 
                    onFilesSelect={handleFilesSelect} 
                    isProcessing={state === 'processing'} 
                  />
                  
                  {/* Local Folder Hint */}
                  {!directoryHandle && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-8 text-center"
                    >
                      <button 
                        onClick={handleConnectFolder}
                        className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-2 mx-auto"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Or connect a local folder to browse files directly
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {activeTab === 'summary' && currentMaterial && (
                    <Summary 
                      content={currentMaterial.summary} 
                      fileName={currentMaterial.fileName} 
                    />
                  )}
                  {activeTab === 'quiz' && currentMaterial && (
                    <Quiz questions={currentMaterial.quiz} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
