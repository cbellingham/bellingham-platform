import React, { useCallback, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from "../context";

const NotificationPopup = () => {
    const [notifications, setNotifications] = useState([]);

    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchNotifications = useCallback(async () => {
        if (!token) return;
        try {
            const res = await api.get(`/api/notifications`);
            setNotifications(res.data || []);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    }, [token]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markRead = async (id) => {
        if (!token) return;
        try {
            await api.post(`/api/notifications/${id}/read`);
        } catch (err) {
            console.error("Failed to mark notification read", err);
        }
    };

    const outstandingBids = notifications.filter((notification) => {
        if (notification.readFlag) return false;
        if (!notification.message) return false;
        const message = notification.message.toLowerCase();
        return (
            notification.bidId &&
            notification.contractId &&
            (message.includes("new bid") || message.includes("outstanding bid"))
        );
    });

    const handleDismiss = async () => {
        const outstandingIds = outstandingBids.map((n) => n.id);
        await Promise.all(outstandingIds.map((id) => markRead(id)));
        setNotifications((prev) =>
            prev.map((notification) =>
                outstandingIds.includes(notification.id)
                    ? { ...notification, readFlag: true }
                    : notification
            )
        );
    };

    if (!outstandingBids.length) return null;

    const bidCount = outstandingBids.length;
    const contractCount = new Set(outstandingBids.map((n) => n.contractId)).size;
    const bidText = bidCount === 1 ? "1 outstanding bid" : `${bidCount} outstanding bids`;
    const contractText =
        contractCount === 1 ? "1 contract" : `${contractCount} contracts`;

    const handleReviewBids = () => {
        navigate("/sell");
    };

    return (
        <div className="fixed top-24 left-4 right-4 md:left-72 md:right-8 bg-gray-800 text-white p-4 rounded shadow-lg z-40 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="font-semibold">
                You have {bidText} awaiting action across {contractText}.
            </p>
            <div className="flex gap-2 flex-wrap">
                <Button variant="success" className="px-3 py-1" onClick={handleReviewBids}>
                    Review bids
                </Button>
                <Button variant="ghost" className="px-3 py-1" onClick={handleDismiss}>
                    Dismiss
                </Button>
            </div>
        </div>
    );
};

export default NotificationPopup;
