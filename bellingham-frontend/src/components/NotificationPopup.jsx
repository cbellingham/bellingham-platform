import React, { useEffect, useState } from "react";
import axios from "axios";
import Button from "./ui/Button";

const NotificationPopup = () => {
    const [notification, setNotification] = useState(null);
    const [visible, setVisible] = useState(false);

    const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/notifications`, config);
            const unread = res.data.find((n) => !n.readFlag);
            if (unread && (!notification || unread.id !== notification.id)) {
                setNotification(unread);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (notification) {
            setVisible(true);
        }
    }, [notification]);

    const markRead = async (id) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/notifications/${id}/read`, {}, config);
        } catch (err) {
            console.error("Failed to mark notification read", err);
        }
    };

    const handleClose = async () => {
        if (notification) {
            await markRead(notification.id);
            setVisible(false);
            setTimeout(() => setNotification(null), 300);
        }
    };

    const handleAccept = async () => {
        if (!notification) return;
        const token = localStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/contracts/${notification.contractId}/bids/${notification.bidId}/accept`,
                {},
                config
            );
            await markRead(notification.id);
            setVisible(false);
            setTimeout(() => setNotification(null), 300);
            alert("Bid accepted");
        } catch (err) {
            console.error("Failed to accept bid", err);
            alert("Failed to accept bid");
        }
    };

    const handleDecline = async () => {
        if (!notification) return;
        const token = localStorage.getItem("token");
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/contracts/${notification.contractId}/bids/${notification.bidId}/reject`,
                {},
                config
            );
            await markRead(notification.id);
            setVisible(false);
            setTimeout(() => setNotification(null), 300);
        } catch (err) {
            console.error("Failed to reject bid", err);
            alert("Failed to decline bid");
        }
    };

    if (!notification) return null;

    const showBidActions =
        notification.bidId &&
        notification.contractId &&
        notification.message.toLowerCase().includes("new bid");

    return (
        <div
            className={`fixed bottom-0 left-0 w-full h-1/4 bg-gray-300 text-black p-4 rounded-t-lg shadow-lg z-50 transform transition-transform duration-300 ${visible ? "translate-y-0" : "translate-y-full"}`}
        >
            <p className="mb-2">{notification.message}</p>
            <div className="flex gap-2 justify-end">
                {showBidActions && (
                    <>
                        <Button
                            variant="success"
                            className="px-2 py-1"
                            onClick={handleAccept}
                        >
                            Accept
                        </Button>
                        <Button
                            variant="danger"
                            className="px-2 py-1"
                            onClick={handleDecline}
                        >
                            Decline
                        </Button>
                    </>
                )}
                <Button
                    variant="ghost"
                    className="px-2 py-1"
                    onClick={handleClose}
                >
                    Dismiss
                </Button>
            </div>
        </div>
    );
};

export default NotificationPopup;
