import React, { useState, useCallback, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { Transaction } from './types';
import { extractTransactions, generateFinancialInsights } from './services/geminiService';
import FileUpload from './components/FileUpload';
import TransactionTable from './components/TransactionTable';
import DownloadButton from './components/DownloadButton';
import { LoaderCircle, FileWarning, WalletCards, RefreshCw } from './components/icons';
import TransactionSummary from './components/TransactionSummary';
import ProgressDisplay from './components/ProgressDisplay';
import FinancialInsights from './components/FinancialInsights';

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = [ '#38bdf8', '#fbbf24', '#a78bfa', '#f87171', '#4ade80', '#fb923c', '#22d3ee', '#e879f9', '#60a5fa', '#f472b6' ];
const CHART_BORDER_COLORS = CHART_COLORS.map(color => color + 'B3');

interface CategoryChartProps {
  transactions: Transaction[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const chartData = useMemo<ChartData<'pie'>>(() => {
    const spendingByCategory: { [key: string]: number } = {};
    transactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        const category = t.category || 'Uncategorized';
        const amount = Math.abs(t.amount);
        if (spendingByCategory[category]) {
          spendingByCategory[category] += amount;
        } else {
          spendingByCategory[category] = amount;
        }
      });

    const sortedCategories = Object.entries(spendingByCategory).sort(([, a], [, b]) => b - a);
    const labels = sortedCategories.map(([category]) => category);
    const data = sortedCategories.map(([, amount]) => amount);

    return {
      labels,
      datasets: [{
        label: 'Spending',
        data,
        backgroundColor: CHART_COLORS,
        borderColor: CHART_BORDER_COLORS,
        borderWidth: 1,
      }],
    };
  }, [transactions]);

  if (!chartData.datasets[0].data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 dark:text-slate-400">
        <p>No spending data available to visualize.</p>
      </div>
    );
  }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: document.body.classList.contains('dark') ? '#cbd5e1' : '#475569',
          boxWidth: 20,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className="relative h-80 w-full">
      <Pie data={chartData} options={options} />
    </div>
  );
};


const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[] | null>(null);
  const [processedFilesCount, setProcessedFilesCount] = useState<number>(0);
  const [insights, setInsights] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);


  const handleFileChange = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setTransactions([]);
    setError(null);
  };

  const handleExtract = useCallback(async () => {
    if (!files || files.length === 0) {
      setError("Please select one or more files first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransactions([]);
    setProcessedFilesCount(0);
    setInsights(null);
    setInsightsError(null);

    try {
      const allTransactions: Transaction[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProcessedFilesCount(i);
        const extractedData = await extractTransactions(file);
        allTransactions.push(...extractedData);
      }
      setProcessedFilesCount(files.length);
      
      const sortedTransactions = allTransactions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      setTransactions(sortedTransactions);

      // After transactions are extracted, generate insights
      if(sortedTransactions.length > 0) {
        setIsGeneratingInsights(true);
        try {
            const generatedInsights = await generateFinancialInsights(sortedTransactions);
            setInsights(generatedInsights);
        } catch (insightErr) {
            console.error("Error generating insights:", insightErr);
            setInsightsError("Could not generate AI insights for this statement.");
        } finally {
            setIsGeneratingInsights(false);
        }
      }

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`An error occurred during extraction: ${err.message}. Please try again.`);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const resetState = () => {
    setFiles(null);
    setTransactions([]);
    setError(null);
    setIsLoading(false);
    setProcessedFilesCount(0);
    setInsights(null);
    setInsightsError(null);
    setIsGeneratingInsights(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ProgressDisplay
          processedCount={processedFilesCount}
          totalCount={files?.length || 0}
          currentFileName={files?.[processedFilesCount]?.name}
        />
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 flex flex-col items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-lg">
          <FileWarning className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-700 dark:text-red-400">Extraction Failed</p>
          <p className="text-sm text-red-600 dark:text-red-500 mt-2">{error}</p>
          <button
            onClick={resetState}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    if (transactions.length > 0) {
      return (
        <div className="w-full space-y-8">
          <TransactionSummary transactions={transactions} />
          
          <FinancialInsights 
            insights={insights} 
            isLoading={isGeneratingInsights}
            error={insightsError}
          />
          
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Spending Breakdown</h2>
            <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <CategoryChart transactions={transactions} />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Transaction Details</h2>
            <TransactionTable transactions={transactions} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <DownloadButton transactions={transactions} />
            <button
              onClick={resetState}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Process Another Statement
            </button>
          </div>
        </div>
      );
    }

    return (
      <FileUpload onFileChange={handleFileChange} onExtract={handleExtract} files={files} />
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-3">
             <WalletCards className="w-10 h-10 text-sky-500"/>
            <h1 className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              Bank Statement OCR
            </h1>
          </div>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload a PDF or image of your bank statement to instantly extract and categorize your transactions.
          </p>
        </header>

        <main className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 md:p-8 min-h-[300px] flex items-center justify-center transition-all duration-300">
          {renderContent()}
        </main>
        
        <footer className="text-center mt-8">
            <p className="text-sm text-slate-500 dark:text-slate-500">Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;