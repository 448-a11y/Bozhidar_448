import React from 'react';
import { LoaderCircle, Lightbulb, FileWarning } from './icons';

interface FinancialInsightsProps {
  insights: string | null;
  isLoading: boolean;
  error: string | null;
}

// Simple markdown parser to convert ### and * to HTML
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return (
        <div className="space-y-3">
            {lines.map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h4 key={index} className="text-md font-semibold text-slate-700 dark:text-slate-300">{line.substring(4)}</h4>;
                }
                if (line.startsWith('* ')) {
                    return <li key={index} className="flex items-start">
                        <span className="text-sky-500 mr-2 mt-1">&#8226;</span>
                        <span>{line.substring(2)}</span>
                    </li>;
                }
                if (line.match(/^\d+\.\s/)) {
                     return <li key={index} className="flex items-start">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold mr-2 mt-1">{line.match(/^\d+\./)}</span>
                        <span>{line.substring(line.indexOf(' ') + 1)}</span>
                    </li>;
                }
                return <p key={index}>{line}</p>;
            })}
        </div>
    );
};

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ insights, isLoading, error }) => {
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-6">
                    <LoaderCircle className="w-6 h-6 text-sky-500 animate-spin mr-3" />
                    <span className="text-slate-600 dark:text-slate-400">Generating AI insights...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <FileWarning className="w-6 h-6 text-red-500 mr-3" />
                    <span className="text-red-700 dark:text-red-400 font-medium">{error}</span>
                </div>
            );
        }

        if (insights) {
            return (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                    <SimpleMarkdown text={insights} />
                </div>
            );
        }

        return null;
    };
    
    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
                <Lightbulb className="w-6 h-6 text-amber-400 mr-2" />
                AI Financial Insights
            </h2>
            <div className="p-4 sm:p-6 bg-amber-50/50 dark:bg-slate-800/50 rounded-xl border border-amber-200 dark:border-slate-700 shadow-sm">
                {renderContent()}
            </div>
        </div>
    );
};

export default FinancialInsights;
