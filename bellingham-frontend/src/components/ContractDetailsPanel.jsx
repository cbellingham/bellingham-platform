import React, { useEffect, useState } from "react";

const ContractDetailsPanel = ({
    contract,
    onClose,
    inline = false,
    inlineWidth = "w-full max-w-md",
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (contract) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [contract]);

    if (!contract && !visible) return null;

    const panelClasses = inline
        ? `${inlineWidth} bg-gray-900 text-white p-6 overflow-auto shadow-lg z-20 mt-4 transform transition-transform duration-300 flex flex-col ${visible ? "translate-x-0" : "translate-x-full"}`
        : `fixed top-0 right-0 w-full sm:w-1/3 h-full bg-gray-900 text-white p-6 shadow-lg z-20 transform transition-transform duration-300 flex flex-col ${visible ? "translate-x-0" : "translate-x-full"}`;

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
                className="mb-4 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
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
            <button
                className="mt-auto bg-red-600 hover:bg-red-700 px-3 py-1 rounded self-end"
                onClick={handleClose}
            >
                Close
            </button>
        </div>
    );
};

export default ContractDetailsPanel;
