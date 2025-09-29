import { useEffect, useRef } from "react";

const createStreamUrl = () => {
    if (typeof window === "undefined") {
        return null;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    try {
        return new URL("/api/contracts/stream", baseUrl || window.location.origin).toString();
    } catch (error) {
        console.error("Failed to construct market stream URL", error);
        return "/api/contracts/stream";
    }
};

const useMarketStream = ({ enabled, onSnapshot }) => {
    const callbackRef = useRef(onSnapshot);

    useEffect(() => {
        callbackRef.current = onSnapshot;
    }, [onSnapshot]);

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        if (typeof window === "undefined" || typeof window.EventSource === "undefined") {
            console.warn("EventSource is not supported in this environment; real-time market updates disabled.");
            return undefined;
        }

        const streamUrl = createStreamUrl();
        if (!streamUrl) {
            return undefined;
        }

        const eventSource = new EventSource(streamUrl, { withCredentials: true });

        const handleEvent = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (callbackRef.current) {
                    callbackRef.current(data);
                }
            } catch (error) {
                console.error("Failed to parse market update event", error);
            }
        };

        eventSource.addEventListener("market-update", handleEvent);
        eventSource.onerror = (error) => {
            console.error("Market data stream error", error);
        };

        return () => {
            eventSource.removeEventListener("market-update", handleEvent);
            eventSource.close();
        };
    }, [enabled]);
};

export default useMarketStream;
