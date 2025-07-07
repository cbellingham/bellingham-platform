import React from "react";

const ContractDetailsPanel = ({ contract, onClose, inline = false }) => {
    if (!contract) return null;

    const panelClasses = inline
        ? "w-full bg-gray-900 text-white p-6 overflow-auto shadow-lg z-20 max-w-md mt-4"
        : "absolute top-0 right-0 w-full sm:w-96 h-full bg-gray-900 text-white p-6 overflow-auto shadow-lg z-20 max-w-md";

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

    return (
        <div className={panelClasses}>
            <button
                className="mb-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                onClick={onClose}
            >
                Close
            </button>
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
        </div>
    );
};

export default ContractDetailsPanel;
