import React from 'react';
import { Transaction } from '../types';
import { ArrowDownCircle, ArrowUpCircle, List } from './icons';

interface TransactionSummaryProps {
  transactions: Transaction[];
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({ transactions }) => {
  const totalTransactions = transactions.length;
  const totalSpending = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const summaryData = [
    {
      title: 'Total Transactions',
      value: totalTransactions,
      icon: List,
      color: 'text-sky-500',
    },
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: ArrowUpCircle,
      color: 'text-green-500',
    },
    {
      title: 'Total Spending',
      value: formatCurrency(totalSpending),
      icon: ArrowDownCircle,
      color: 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {summaryData.map((item, index) => (
        <div key={index} className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center shadow-sm">
          <div className={`mr-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-full`}>
             <item.icon className={`w-6 h-6 ${item.color}`} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.title}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionSummary;
