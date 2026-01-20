// Notification helper functions

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            ...options,
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    }
};

export const hasNotificationPermission = (): boolean => {
    return 'Notification' in window && Notification.permission === 'granted';
};

export const isNotificationDenied = (): boolean => {
    return 'Notification' in window && Notification.permission === 'denied';
};

export const getNotificationPermissionState = (): 'granted' | 'denied' | 'default' | 'unsupported' => {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
};

// LocalStorage helpers
const NOTIFICATION_PROMPT_KEY = 'notification_prompt_shown';

export const hasShownNotificationPrompt = (): boolean => {
    return localStorage.getItem(NOTIFICATION_PROMPT_KEY) === 'true';
};

export const markNotificationPromptShown = () => {
    localStorage.setItem(NOTIFICATION_PROMPT_KEY, 'true');
};
