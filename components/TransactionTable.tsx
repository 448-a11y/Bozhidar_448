import React from 'react';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
          <tr>
            <th scope="col" className="py-3 px-6">Date</th>
            <th scope="col" className="py-3 px-6">Description</th>
            <th scope="col" className="py-3 px-6">Category</th>
            <th scope="col" className="py-3 px-6 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, index) => (
            <tr key={index} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/30">
              <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-300">{t.date}</td>
              <td className="py-4 px-6 font-medium text-slate-900 dark:text-white whitespace-nowrap">{t.description}</td>
              <td className="py-4 px-6">
                 <span className="px-2 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300">
                    {t.category}
                </span>
              </td>
              <td className={`py-4 px-6 text-right font-semibold font-mono ${t.amount < 0 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                {formatCurrency(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
