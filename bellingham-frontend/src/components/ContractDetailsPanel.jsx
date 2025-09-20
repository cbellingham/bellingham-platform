import React, { useEffect, useState } from "react";
import Button from "./ui/Button";
import api from "../utils/api";

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
        ? `${inlineWidth} rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-slate-100 shadow-[0_20px_45px_rgba(2,12,32,0.55)] transition-transform duration-300 backdrop-blur`
        : `fixed top-0 right-0 z-20 h-full w-full transform bg-slate-900/95 p-6 text-slate-100 shadow-lg transition-transform duration-300 sm:w-1/3`;

    const handleDownload = async () => {
        const res = await api.get(`/api/contracts/${contract.id}/pdf`, { responseType: "blob" });
        const blob = res.data;
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
        <div className={`${panelClasses} ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <h2 className="text-xl font-semibold text-white">{contract?.title || "Contract details"}</h2>
                <Button
                    variant="ghost"
                    className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]"
                    onClick={handleClose}
                >
                    Close
                </Button>
            </div>
            <div className="mt-4 flex flex-col gap-4 text-sm text-slate-300">
                <Button
                    className="self-start border border-emerald-400/50 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 hover:bg-emerald-500/20"
                    onClick={handleDownload}
                >
                    Download PDF
                </Button>
                <ul className="space-y-3">
                    {Object.entries(contract || {}).map(([key, value]) => (
                        <li key={key} className="flex flex-col gap-1">
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{key}</span>
                            {key === "agreementText" ? (
                                <pre className="whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-slate-200">
                                    {value}
                                </pre>
                            ) : (
                                <span className="font-semibold text-slate-100">{String(value)}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ContractDetailsPanel;
