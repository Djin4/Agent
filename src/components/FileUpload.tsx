import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2, FolderOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  isProcessing: boolean;
}

export default function FileUpload({ onFilesSelect, isProcessing }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length > 0) {
      onFilesSelect(files);
    }
  }, [onFilesSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === 'application/pdf');
    if (files.length > 0) {
      onFilesSelect(files);
    }
  }, [onFilesSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center",
          isDragging ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50",
          isProcessing && "pointer-events-none opacity-60"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".pdf"
          multiple
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "p-4 rounded-full transition-colors duration-300",
            isDragging ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
          )}>
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isProcessing ? "Analyzing Document..." : "Upload Study Material"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Drag and drop your PDF here, or click to browse
            </p>
          </div>

          <div className="flex gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
              <FileText className="w-3 h-3" />
              PDF Only
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
              <FolderOpen className="w-3 h-3" />
              Folder Support
            </span>
          </div>
        </div>

        {isProcessing && (
          <motion.div 
            className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 rounded-b-2xl"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 15, ease: "linear" }}
          />
        )}
      </motion.div>
    </div>
  );
}
