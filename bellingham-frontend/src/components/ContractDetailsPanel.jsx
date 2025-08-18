import React, { useEffect, useState } from "react";
import axios from "axios";
import BidChart from "./BidChart";

const ContractDetailsPanel = ({
    contract,
    onClose,
    inline = false,
    inlineWidth = "w-full max-w-md",
}) => {
    const [visible, setVisible] = useState(false);
    const [bids, setBids] = useState([]);

    useEffect(() => {
        if (contract) {
            setVisible(true);
            const token = localStorage.getItem("token");
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            axios
                .get(`${import.meta.env.VITE_API_BASE_URL}/api/contracts/${contract.id}/bids`, config)
                .then((res) => setBids(res.data))
                .catch(() => setBids([]));
        } else {
            setVisible(false);
            setBids([]);
        }
    }, [contract]);

    if (!contract && !visible) return null;

    const panelClasses = inline
        ? `${inlineWidth} bg-base text-contrast p-6 overflow-auto shadow-lg z-20 mt-4 transform transition-transform duration-300 flex flex-col ${visible ? "translate-x-0" : "translate-x-full"}`
        : `fixed top-0 right-0 w-full sm:w-1/3 h-full bg-base text-contrast p-6 shadow-lg z-20 transform transition-transform duration-300 flex flex-col ${visible ? "translate-x-0" : "translate-x-full"}`;

    const handleDownload = async () => {
        const token = localStorage.getItem("token");
        const res = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/contracts/${contract.id}/pdf`,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
        );
        if (!res.ok) return;
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contract-${contract.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    return (
        <div className={panelClasses}>
            <h2 className="text-xl font-bold mb-4">{contract.title}</h2>
            <button
                className="mb-4 bg-primary hover:bg-primary-dark px-3 py-1 rounded"
                onClick={handleDownload}
            >
                Download PDF
            </button>
            <ul className="space-y-1">
                {Object.entries(contract).map(([key, value]) => (
                    <li key={key}>
                        <span className="font-semibold capitalize mr-2">{key}:</span>
                        {key === "agreementText" ? (
                            <pre className="whitespace-pre-wrap">{value}</pre>
                        ) : (
                            String(value)
                        )}
                    </li>
                ))}
            </ul>
            {bids.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Bids</h3>
                    <ul className="space-y-1">
                        {bids.map((b) => (
                            <li key={b.id}>
                                {b.bidderUsername}: ${b.amount} - {b.status}
                            </li>
                        ))}
                    </ul>
                    <BidChart bids={bids} />
                </div>
            )}
            <button
                className="mt-auto bg-danger hover:bg-danger-dark px-3 py-1 rounded self-end"
                onClick={handleClose}
            >
                Close
            </button>
        </div>
    );
};

export default ContractDetailsPanel;
