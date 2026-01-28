import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { api } from '../lib/api';

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    clientName?: string;
    category: string;
    status: 'paid' | 'pending' | 'overdue';
    dueDate: string;
    paymentMethod?: string;
    date: string;
}

interface TransactionContextType {
    transactions: Transaction[];
    stats: any;
    products: any[];
    analyticsSummary: any;
    loading: boolean;
    refreshData: () => Promise<void>;
    addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
    recentTransactions: Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        refreshData();

        // Socket.io Real-time listener
        const handleUpdate = (data: any) => {
            console.log(`[Real-time] Received update for ${data.type}:`, data.action);
            refreshData();
        };

        const socket = import('../lib/api').then(m => m.socket);
        socket.then(s => s.on('data-updated', handleUpdate));

        // Background interval for polling (fallback)
        const interval = setInterval(refreshData, 60000);

        return () => {
            clearInterval(interval);
            socket.then(s => s.off('data-updated', handleUpdate));
        };
    }, []);

    const refreshData = async () => {
        try {
            const [transData, statsData, productsData, summaryData] = await Promise.all([
                api.transactions.list(),
                api.stats.get(),
                api.analytics.getProducts(),
                api.analytics.getSummary()
            ]);

            setTransactions(Array.isArray(transData) ? transData : []);
            setStats(statsData);
            setProducts(Array.isArray(productsData) ? productsData : []);
            setAnalyticsSummary(summaryData);
        } catch (error) {
            console.error('Error refreshing system data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (data: Omit<Transaction, 'id' | 'date'>) => {
        try {
            const newTransaction = await api.transactions.create(data);
            setTransactions((prev) => [newTransaction, ...(Array.isArray(prev) ? prev : [])]);
            // Refresh stats in background after a transaction
            refreshData();
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    };

    const recentTransactions = useMemo(() =>
        Array.isArray(transactions) ? transactions.slice(0, 10) : [],
        [transactions]);

    return (
        <TransactionContext.Provider value={{
            transactions,
            stats,
            products,
            analyticsSummary,
            loading,
            refreshData,
            addTransaction,
            recentTransactions
        }}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactions() {
    const context = useContext(TransactionContext);
    if (context === undefined) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
}
