import { useState, useEffect } from 'react';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isServerUp, setIsServerUp] = useState(true);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Heartbeat check for server
        const checkServer = async () => {
            try {
                const res = await fetch('/api/status');
                setIsServerUp(res.ok);
            } catch (e) {
                setIsServerUp(false);
            }
        };

        checkServer();
        const interval = setInterval(checkServer, 10000); // Check every 10s

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    return isOnline && isServerUp;
}
