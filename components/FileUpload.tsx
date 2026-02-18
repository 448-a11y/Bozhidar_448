import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2 } from './icons';

interface FileUploadProps {
  onFileChange: (files: File[]) => void;
  onExtract: () => void;
  files: File[] | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, onExtract, files }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(Array.from(e.target.files));
    }
  };

  const handleButtonClick = () => {
    document.getElementById('file-upload-input')?.click();
  };


  return (
    <div className="w-full flex flex-col items-center">
      <div
        className={`w-full max-w-lg p-8 border-2 border-dashed rounded-xl transition-colors duration-300 ${isDragging ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-sky-400'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload-input"
          className="hidden"
          accept="application/pdf,image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          multiple
        />
        <div className="flex flex-col items-center text-center">
          <UploadCloud className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
          <p className="text-slate-600 dark:text-slate-400 font-semibold">
            Drag & drop your statement(s) here, or
          </p>
          <button
            type="button"
            onClick={handleButtonClick}
            className="mt-2 text-sky-600 dark:text-sky-400 font-bold hover:underline focus:outline-none"
          >
            browse files
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Supported formats: PDF, PNG, JPG, WEBP
          </p>
        </div>
      </div>
      
      {files && files.length > 0 && (
        <div className="mt-6 w-full max-w-lg text-center">
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg space-y-2 text-left">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 px-1 mb-2">Selected Files:</h3>
            {files.map((f, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-1">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate" title={f.name}>{f.name}</span>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />
              </div>
            ))}
          </div>
          <button
            onClick={onExtract}
            disabled={!files || files.length === 0}
            className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed dark:focus:ring-offset-slate-900"
          >
            Extract Transactions from {files.length} file(s)
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;