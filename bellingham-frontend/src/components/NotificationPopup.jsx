import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import { useNotifications } from "../context";

const NotificationPopup = () => {
    const navigate = useNavigate();
    const { unreadNotifications, markRead } = useNotifications();

    const handleViewContracts = useCallback(
        async (id) => {
            await markRead(id);
            navigate("/sell");
        },
        [markRead, navigate]
    );

    const handleDismiss = useCallback(
        (id) => {
            markRead(id);
        },
        [markRead]
    );

    if (!unreadNotifications.length) return null;

    return (
        <div className="pointer-events-none fixed top-28 right-6 z-40 flex max-w-xs flex-col gap-3">
            {unreadNotifications.map((notification) => (
                <div
                    key={notification.id}
                    className="pointer-events-auto w-full rounded-lg bg-gray-800 p-4 text-white shadow-xl"
                >
                    <p className="text-sm font-semibold">
                        {notification.title || "New activity"}
                    </p>
                    {notification.message && (
                        <p className="mt-1 text-sm text-gray-300">
                            {notification.message}
                        </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                            variant="success"
                            className="px-3 py-1 text-sm"
                            onClick={() => handleViewContracts(notification.id)}
                        >
                            View contracts
                        </Button>
                        <Button
                            variant="ghost"
                            className="px-3 py-1 text-sm"
                            onClick={() => handleDismiss(notification.id)}
                        >
                            Dismiss
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NotificationPopup;
