import { createContext } from "react";

const NotificationContext = createContext({
    notifications: [],
    unreadNotifications: [],
    unreadCount: 0,
    loading: true,
    error: "",
    refresh: async () => {},
    markRead: async () => {},
    markAllRead: async () => {},
});

export default NotificationContext;
