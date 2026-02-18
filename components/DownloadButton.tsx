import React from 'react';
import { Transaction } from '../types';
import { Download } from './icons';

interface DownloadButtonProps {
  transactions: Transaction[];
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ transactions }) => {
  const downloadCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => [
        `"${t.date}"`,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        `"${t.category}"`,
        `"${t.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={downloadCSV}
      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors dark:focus:ring-offset-slate-900"
    >
      <Download className="w-5 h-5" />
      Download CSV
    </button>
  );
};

export default DownloadButton;
