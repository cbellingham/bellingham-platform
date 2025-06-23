import React from "react";

const ContractDetailsPanel = ({ contract, onClose }) => {
    if (!contract) return null;

    return (
        <div className="ml-auto w-full sm:w-96 max-w-md h-full bg-gray-900 text-white p-6 overflow-auto shadow-lg">
            <button
                className="mb-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                onClick={onClose}
            >
                Close
            </button>
            <h2 className="text-xl font-bold mb-4">{contract.title}</h2>
            <ul className="space-y-1">
                {Object.entries(contract).map(([key, value]) => (
                    <li key={key}>
                        <span className="font-semibold capitalize mr-2">{key}:</span>
                        {String(value)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ContractDetailsPanel;
