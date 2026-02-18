import React from 'react';
import { LoaderCircle, FileText } from './icons';

interface ProgressDisplayProps {
    processedCount: number;
    totalCount: number;
    currentFileName?: string;
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({
    processedCount,
    totalCount,
    currentFileName,
}) => {
    const progressPercentage = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;
    
    return (
        <div className="text-center p-8 flex flex-col items-center justify-center h-full w-full max-w-md">
            <LoaderCircle className="w-12 h-12 text-sky-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                Processing Files...
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 my-4">
                <div 
                    className="bg-sky-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progressPercentage}%` }}>
                </div>
            </div>
            <div className="w-full flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
                <span>Completed: {processedCount}</span>
                <span>Pending: {totalCount - processedCount}</span>
                <span>Total: {totalCount}</span>
            </div>
            {currentFileName && processedCount < totalCount && (
                <div className="mt-4 text-sm text-slate-500 dark:text-slate-500 flex items-center gap-2">
                    <FileText className="w-4 h-4"/>
                    <span>Currently processing: <span className="font-semibold">{currentFileName}</span></span>
                </div>
            )}
            {processedCount === totalCount && totalCount > 0 && (
                 <div className="mt-4 text-sm text-green-600 dark:text-green-400 font-semibold">
                    All files processed! Finalizing...
                </div>
            )}
        </div>
    );
};

export default ProgressDisplay;
