import React, { useEffect, useMemo, useState } from "react";
import Button from "./ui/Button";
import api from "../utils/api";

const STATUS_STYLES = {
    open: "border-[#00D1FF]/50 bg-[#00D1FF]/10 text-[#00D1FF]",
    purchased: "border-[#7465A8]/50 bg-[#7465A8]/12 text-[#C5BEE4]",
    closed: "border-slate-500/40 bg-slate-600/10 text-slate-200",
    default: "border-[#3BAEAB]/50 bg-[#3BAEAB]/12 text-[#9CD8D6]",
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return String(value);
    const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
    }).format(numericValue);

    return <span className="numeric-text">{formatted}</span>;
};

const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const ContractDetailsPanel = ({
    contract,
    onClose,
    inline = false,
    inlineWidth = "w-full max-w-md",
}) => {
    const [visible, setVisible] = useState(false);
    const [openSections, setOpenSections] = useState({});

    useEffect(() => {
        if (contract) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [contract]);

    const panelClasses = inline
        ? `${inlineWidth} rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-6 text-slate-100 shadow-[0_20px_45px_rgba(2,12,32,0.55)] transition-transform duration-300 backdrop-blur sm:px-6 lg:px-8`
        : `fixed top-0 right-0 z-20 h-full w-full transform bg-slate-900/95 px-4 py-6 text-slate-100 shadow-lg transition-transform duration-300 sm:w-1/3 sm:px-6 lg:px-8`;

    const handleDownload = async () => {
        if (!contract) return;
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

    const headerChips = useMemo(() => {
        if (!contract) return [];

        const chips = [];

        if (contract.status) {
            const key = contract.status.toLowerCase();
            chips.push({
                key: "status",
                label: contract.status,
                className: STATUS_STYLES[key] || STATUS_STYLES.default,
            });
        }

        [
            { key: "effectiveDate", label: "Effective" },
            { key: "deliveryDate", label: "Delivery" },
            { key: "purchaseDate", label: "Purchased" },
        ].forEach(({ key, label }) => {
            const formatted = formatDate(contract[key]);
            if (formatted) {
                chips.push({
                    key,
                    label: `${label}: ${formatted}`,
                    className: "border-slate-700 bg-slate-800/60 text-slate-200",
                });
            }
        });

        return chips;
    }, [contract]);

    const sections = useMemo(() => {
        if (!contract) return [];

        return [
            {
                title: "Contract Overview",
                fields: [
                    { key: "title", label: "Contract Title" },
                    { key: "dataDescription", label: "Data Description" },
                    { key: "platformName", label: "Platform" },
                    { key: "deliveryFormat", label: "Delivery Format" },
                    { key: "termsFileName", label: "Supporting Terms" },
                ],
            },
            {
                title: "Financials",
                fields: [
                    {
                        key: "price",
                        label: "Contract Value",
                        formatter: formatCurrency,
                    },
                ],
            },
            {
                title: "Participants",
                fields: [
                    { key: "seller", label: "Seller Username" },
                    { key: "sellerFullName", label: "Seller Name" },
                    { key: "sellerEntityType", label: "Seller Entity Type" },
                    { key: "sellerAddress", label: "Seller Address" },
                    { key: "buyerUsername", label: "Buyer Username" },
                    { key: "buyerFullName", label: "Buyer Name" },
                    { key: "buyerEntityType", label: "Buyer Entity Type" },
                    { key: "buyerAddress", label: "Buyer Address" },
                    { key: "creatorUsername", label: "Created By" },
                ],
            },
            {
                title: "Corporate Profile",
                fields: [
                    { key: "legalBusinessName", label: "Legal Business Name" },
                    { key: "name", label: "Business DBA" },
                    { key: "countryOfIncorporation", label: "Country of Incorporation" },
                    { key: "taxId", label: "Tax ID" },
                    {
                        key: "companyRegistrationNumber",
                        label: "Registration Number",
                    },
                    { key: "companyDescription", label: "Company Description" },
                ],
            },
            {
                title: "Primary Contact",
                fields: [
                    { key: "primaryContactName", label: "Name" },
                    { key: "primaryContactEmail", label: "Email" },
                    { key: "primaryContactPhone", label: "Phone" },
                ],
            },
            {
                title: "Technical Contact",
                fields: [
                    { key: "technicalContactName", label: "Name" },
                    { key: "technicalContactEmail", label: "Email" },
                    { key: "technicalContactPhone", label: "Phone" },
                ],
            },
            {
                title: "Agreement",
                fields: [
                    {
                        key: "agreementText",
                        label: "Agreement Text",
                        render: (value) => (
                            <pre className="whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-slate-200">
                                {value}
                            </pre>
                        ),
                    },
                ],
            },
        ]
            .map((section) => ({
                ...section,
                fields: section.fields
                    .map((field) => {
                        const rawValue = contract[field.key];
                        if (rawValue === undefined || rawValue === null || rawValue === "") {
                            return null;
                        }

                        if (field.render) {
                            return {
                                ...field,
                                value: field.render(rawValue),
                            };
                        }

                        if (field.formatter) {
                            const formatted = field.formatter(rawValue);
                            if (!formatted) {
                                return null;
                            }

                            return {
                                ...field,
                                value: formatted,
                            };
                        }

                        return {
                            ...field,
                            value: String(rawValue),
                        };
                    })
                    .filter(Boolean),
            }))
            .filter((section) => section.fields.length > 0);
    }, [contract]);

    useEffect(() => {
        if (!sections.length) {
            setOpenSections({});
            return;
        }

        setOpenSections((prev) => {
            const next = {};
            sections.forEach((section, index) => {
                next[section.title] = prev[section.title] ?? index === 0;
            });
            return next;
        });
    }, [sections]);

    const toggleSection = (title) => {
        setOpenSections((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    if (!contract && inline) {
        return (
            <div
                className={`${inlineWidth} flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-800/70 bg-slate-900/40 px-4 py-6 text-center text-slate-400 sm:px-6 lg:px-8`}
            >
                <div className="space-y-2 text-center">
                    <h2 className="text-lg font-semibold text-slate-200">Select a contract</h2>
                    <p className="max-w-xs text-sm text-slate-400">
                        Choose a contract from the list to see its key dates, participants, and agreement details here.
                    </p>
                </div>
            </div>
        );
    }

    if (!contract && !visible) return null;

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
            <div className="mt-4 space-y-5 text-sm text-slate-300">
                <div className="space-y-5">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            className="border border-[#7465A8]/50 bg-[#7465A8]/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C5BEE4] hover:bg-[#7465A8]/20"
                            onClick={handleDownload}
                        >
                            Download PDF
                        </Button>
                        {headerChips.map(({ key, label, className }) => (
                            <span
                                key={key}
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${className}`}
                            >
                                {label}
                            </span>
                        ))}
                    </div>

                    <div className="space-y-5">
                        {sections.map((section, index) => {
                            const isOpen = openSections[section.title];
                            const contentId = `contract-section-${index}`;

                            return (
                                <section
                                    key={section.title}
                                    className="space-y-5 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 shadow-inner"
                                >
                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between gap-4 text-left text-slate-200"
                                        onClick={() => toggleSection(section.title)}
                                        aria-expanded={isOpen}
                                        aria-controls={contentId}
                                    >
                                        <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                                            {section.title}
                                        </span>
                                    </button>
                                    <div
                                        id={contentId}
                                        className={`${isOpen ? "mt-4 space-y-5" : "mt-0 hidden"}`}
                                    >
                                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            {section.fields.map(({ key, label, value }) => (
                                                <div
                                                    key={key}
                                                    className="flex flex-col gap-1 rounded-xl border border-slate-800 bg-slate-950/30 p-4"
                                                >
                                                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        {label}
                                                    </dt>
                                                    <dd className="font-semibold text-slate-100">{value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContractDetailsPanel;
