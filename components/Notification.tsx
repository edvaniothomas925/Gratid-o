import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
// Fix: The NotificationType type is defined in types.ts, not App.tsx.
import { NotificationType } from '../types';

interface NotificationProps {
    notification: {
        message: string;
        type: NotificationType;
    } | null;
    onClose: () => void;
}

const icons = {
    success: <CheckCircle className="w-6 h-6 text-emerald-500" />,
    error: <AlertTriangle className="w-6 h-6 text-red-500" />,
    info: <Info className="w-6 h-6 text-sky-500" />,
};

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // A notificação desaparece após 5 segundos

            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification) {
        return null;
    }

    return (
        <div 
          className="fixed bottom-5 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-[100] animate-toast-in"
          role="alert"
        >
            <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-md rounded-xl shadow-2xl p-4 flex items-start gap-4 border border-stone-200 dark:border-stone-700">
                <div className="flex-shrink-0">
                    {icons[notification.type]}
                </div>
                <div className="flex-grow text-stone-700 dark:text-stone-200 text-sm">
                    {notification.message}
                </div>
                <button 
                  onClick={onClose} 
                  className="flex-shrink-0 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                  aria-label="Fechar notificação"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            <style>{`
                @keyframes toast-in {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                .animate-toast-in {
                    animation: toast-in 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default Notification;