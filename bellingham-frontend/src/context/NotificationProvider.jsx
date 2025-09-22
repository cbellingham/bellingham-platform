import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import AuthContext from "./AuthContext";
import NotificationContext from "./NotificationContext";
import api from "../utils/api";

const createStreamUrl = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    try {
        return new URL(
            "/api/notifications/stream",
            baseUrl || window.location.origin
        ).toString();
    } catch (error) {
        console.error("Failed to construct notification stream URL", error);
        return "/api/notifications/stream";
    }
};

const NotificationProvider = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const eventSourceRef = useRef(null);

    const handleNotificationEvent = useCallback((event) => {
        try {
            const notification = JSON.parse(event.data);
            setNotifications((prev) => {
                const existingIndex = prev.findIndex(
                    (item) => item.id === notification.id
                );

                if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = {
                        ...prev[existingIndex],
                        ...notification,
                    };
                    return updated;
                }

                return [notification, ...prev];
            });
        } catch (err) {
            console.error("Failed to parse notification event", err);
        }
    }, []);

    const closeEventSource = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.removeEventListener(
                "notification",
                handleNotificationEvent
            );
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
    }, [handleNotificationEvent]);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            setNotifications([]);
            setLoading(false);
            setError("");
            return;
        }

        setLoading(true);
        setError("");
        try {
            const res = await api.get(`/api/notifications`);
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to load notifications", err);
            setError("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const markRead = useCallback(
        async (id) => {
            if (!isAuthenticated || !id) return;
            try {
                await api.post(`/api/notifications/${id}/read`);
                setNotifications((prev) =>
                    prev.map((notification) =>
                        notification.id === id
                            ? { ...notification, readFlag: true }
                            : notification
                    )
                );
            } catch (err) {
                console.error("Failed to mark notification read", err);
            }
        },
        [isAuthenticated]
    );

    const markAllRead = useCallback(async () => {
        if (!isAuthenticated) return;
        const unreadIds = notifications
            .filter((notification) => !notification.readFlag)
            .map((notification) => notification.id);

        if (!unreadIds.length) return;

        try {
            await Promise.all(
                unreadIds.map((id) => api.post(`/api/notifications/${id}/read`))
            );
            setNotifications((prev) =>
                prev.map((notification) =>
                    unreadIds.includes(notification.id)
                        ? { ...notification, readFlag: true }
                        : notification
                )
            );
        } catch (err) {
            console.error("Failed to mark all notifications read", err);
        }
    }, [isAuthenticated, notifications]);

    useEffect(() => {
        if (!isAuthenticated) {
            closeEventSource();
            setNotifications([]);
            setLoading(false);
            setError("");
            return undefined;
        }

        fetchNotifications();

        if (
            typeof window === "undefined" ||
            typeof window.EventSource === "undefined"
        ) {
            return undefined;
        }

        const streamUrl = createStreamUrl();
        if (!streamUrl) {
            return undefined;
        }

        const eventSource = new EventSource(streamUrl, {
            withCredentials: true,
        });

        eventSource.addEventListener("notification", handleNotificationEvent);

        eventSource.onerror = (err) => {
            console.error("Notification stream error", err);
        };

        eventSourceRef.current = eventSource;

        return () => {
            eventSource.removeEventListener(
                "notification",
                handleNotificationEvent
            );
            eventSource.close();
            eventSourceRef.current = null;
        };
    }, [closeEventSource, fetchNotifications, handleNotificationEvent, isAuthenticated]);

    useEffect(
        () => () => {
            closeEventSource();
        },
        [closeEventSource]
    );

    const unreadNotifications = useMemo(
        () => notifications.filter((notification) => !notification.readFlag),
        [notifications]
    );

    const unreadCount = unreadNotifications.length;

    const value = useMemo(
        () => ({
            notifications,
            unreadNotifications,
            unreadCount,
            loading,
            error,
            refresh: fetchNotifications,
            markRead,
            markAllRead,
        }),
        [
            notifications,
            unreadNotifications,
            unreadCount,
            loading,
            error,
            fetchNotifications,
            markRead,
            markAllRead,
        ]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
