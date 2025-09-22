import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from "../context";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { isAuthenticated, logout } = useContext(AuthContext);

    const handleLogout = useCallback(() => {
        logout();
        navigate("/login");
    }, [logout, navigate]);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
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

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        fetchNotifications();
    }, [fetchNotifications, isAuthenticated, navigate]);

    const markRead = useCallback(
        async (id) => {
            if (!isAuthenticated) return;
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
        const unreadIds = notifications
            .filter((notification) => !notification.readFlag)
            .map((notification) => notification.id);

        if (!unreadIds.length) return;

        await Promise.all(unreadIds.map((id) => markRead(id)));
    }, [markRead, notifications]);

    const unreadCount = notifications.filter(
        (notification) => !notification.readFlag
    ).length;

    return (
        <Layout onLogout={handleLogout}>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                <div className="flex flex-col gap-4 border-b border-slate-800 pb-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Inbox</p>
                        <h1 className="text-3xl font-bold text-white">Notifications</h1>
                        <p className="text-sm text-slate-400">
                            Review trade events, approvals, and operational alerts from across the platform.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="ghost"
                            className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                            onClick={fetchNotifications}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="success"
                            className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                            onClick={markAllRead}
                            disabled={unreadCount === 0}
                        >
                            Mark all read
                        </Button>
                    </div>
                </div>
                <div className="mt-6 space-y-4">
                    {loading ? (
                        <p className="text-sm text-slate-300">Loading notifications…</p>
                    ) : error ? (
                        <p className="text-sm text-red-400">{error}</p>
                    ) : notifications.length === 0 ? (
                        <p className="text-sm text-slate-300">You do not have any notifications yet.</p>
                    ) : (
                        <ul className="space-y-4">
                            {notifications.map((notification) => (
                                <li
                                    key={notification.id}
                                    className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 shadow-sm"
                                >
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {notification.title || "Notification"}
                                            </p>
                                            {notification.message && (
                                                <p className="text-sm text-slate-300">
                                                    {notification.message}
                                                </p>
                                            )}
                                            {(notification.timestamp || notification.createdAt) && (
                                                <p className="text-xs text-slate-500">
                                                    {new Date(
                                                        notification.timestamp || notification.createdAt
                                                    ).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {!notification.readFlag ? (
                                                <Button
                                                    variant="success"
                                                    className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                                                    onClick={() => markRead(notification.id)}
                                                >
                                                    Mark read
                                                </Button>
                                            ) : (
                                                <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                                                    Read
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default Notifications;
