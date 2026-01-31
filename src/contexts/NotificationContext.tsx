import { createContext, useContext, useState, ReactNode } from 'react';

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    timestamp: string;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
    clearNotifications: () => void;
    markAsRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
        const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            message,
            type,
            timestamp: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotification, ...prev]);
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const markAsRead = (_id: string) => {
        // Ideally update read status, for now just keeping track
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
