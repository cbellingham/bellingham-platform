import React, { useEffect, useMemo, useState } from "react";
import Button from "./ui/Button";
import api from "../utils/api";

const FIELD_GUIDANCE = {
    title: {
        label: "Contract Title",
        weight: 3,
        suggestion: "Use a succinct, descriptive title that highlights the core deliverable.",
    },
    dataDescription: {
        label: "Data Description",
        weight: 4,
        validator: (value) => String(value).length >= 120,
        improvement:
            "Expand on coverage, refresh cadence, and any enrichment to help enterprise buyers assess fit.",
        suggestion: "Provide a narrative describing dataset scope, update cadence, and sourcing methodology.",
    },
    platformName: {
        label: "Platform",
        weight: 1,
        suggestion: "List the marketplace or delivery platform where the dataset is fulfilled.",
    },
    deliveryFormat: {
        label: "Delivery Format",
        weight: 2,
        suggestion: "Call out the file formats, API methods, and delivery cadence buyers receive.",
    },
    termsFileName: {
        label: "Supporting Terms",
        weight: 1,
        suggestion: "Attach the latest order form, SLA, or data processing agreement for quick review.",
    },
    price: {
        label: "Contract Value",
        weight: 2,
        suggestion: "Detail pricing (total value, per-seat, or usage metrics) for procurement clarity.",
    },
    seller: {
        label: "Seller Username",
        weight: 1,
        suggestion: "Ensure the seller handle matches the storefront for easy buyer follow-up.",
    },
    sellerFullName: {
        label: "Seller Name",
        weight: 1,
        suggestion: "Include the full legal name for procurement documentation.",
    },
    sellerEntityType: {
        label: "Seller Entity Type",
        weight: 1,
        suggestion: "Clarify if the seller is a corporation, LLC, or individual for diligence checks.",
    },
    sellerAddress: {
        label: "Seller Address",
        weight: 2,
        suggestion: "List the registered address for invoicing and compliance screening.",
    },
    buyerUsername: {
        label: "Buyer Username",
        weight: 1,
        suggestion: "Confirm the buyer handle so account teams can collaborate easily.",
    },
    buyerFullName: {
        label: "Buyer Name",
        weight: 1,
        suggestion: "Add the full buyer contact for procurement records.",
    },
    buyerEntityType: {
        label: "Buyer Entity Type",
        weight: 1,
        suggestion: "Clarify the buyer organization type for downstream paperwork.",
    },
    buyerAddress: {
        label: "Buyer Address",
        weight: 1,
        suggestion: "Provide the buyer headquarters address to keep records audit-ready.",
    },
    creatorUsername: {
        label: "Created By",
        weight: 1,
        suggestion: "Record which teammate drafted the listing for accountability.",
    },
    legalBusinessName: {
        label: "Legal Business Name",
        weight: 2,
        suggestion: "Match the registered business name to avoid delays in contracting.",
    },
    name: {
        label: "Business DBA",
        weight: 1,
        suggestion: "Include the DBA buyers recognize if different from the legal entity.",
    },
    countryOfIncorporation: {
        label: "Country of Incorporation",
        weight: 2,
        suggestion: "Identify the country of incorporation for compliance and taxation reviews.",
    },
    taxId: {
        label: "Tax ID",
        weight: 2,
        suggestion: "Provide the tax identifier (EIN, VAT, etc.) to streamline vendor onboarding.",
    },
    companyRegistrationNumber: {
        label: "Registration Number",
        weight: 1,
        suggestion: "Add the corporate registration number to accelerate diligence.",
    },
    companyDescription: {
        label: "Company Description",
        weight: 3,
        validator: (value) => String(value).length >= 80,
        improvement: "Add differentiators like proprietary sources, certifications, and target industries.",
        suggestion: "Summarize what the company does and why the data is trustworthy.",
    },
    primaryContactName: {
        label: "Primary Contact Name",
        weight: 1,
        suggestion: "List the main business contact buyers can reach quickly.",
    },
    primaryContactEmail: {
        label: "Primary Contact Email",
        weight: 2,
        validator: (value) => /.+@.+\..+/.test(String(value)),
        improvement: "Use a monitored inbox rather than a personal email.",
        suggestion: "Add a business email alias for consistent responses.",
    },
    primaryContactPhone: {
        label: "Primary Contact Phone",
        weight: 1,
        suggestion: "Add a phone number for urgent buyer escalations.",
    },
    technicalContactName: {
        label: "Technical Contact Name",
        weight: 1,
        suggestion: "Identify who can answer integration and schema questions.",
    },
    technicalContactEmail: {
        label: "Technical Contact Email",
        weight: 2,
        validator: (value) => /.+@.+\..+/.test(String(value)),
        improvement: "Provide a group alias that routes to the support squad.",
        suggestion: "Share the email for the team managing delivery infrastructure.",
    },
    technicalContactPhone: {
        label: "Technical Contact Phone",
        weight: 1,
        suggestion: "Offer a backup phone line for launch-critical incidents.",
    },
    agreementText: {
        label: "Agreement Text",
        weight: 4,
        validator: (value) => String(value).length >= 400,
        improvement: "Strengthen your agreement with security, usage, and escalation clauses.",
        suggestion: "Paste the complete terms buyers agree to, including usage rights and SLAs.",
        partialWeight: 2.5,
    },
};

const BEST_PRACTICES = [
    "Keep contact information and entity details synchronized with your vendor record.",
    "Highlight certifications (SOC 2, ISO 27001) and data provenance for enterprise buyers.",
    "State delivery cadence, format, and change management expectations up front.",
    "Attach supporting terms, policies, and SLAs so procurement can complete reviews faster.",
];

const CLAUSE_TEMPLATES = [
    {
        id: "usage-rights",
        title: "Usage & License Rights",
        description:
            "Clarify how buyers may access, use, and redistribute the dataset to prevent downstream disputes.",
        keywords: ["usage rights", "license"],
        template: `Usage Rights. Buyer is granted a non-exclusive, non-transferable license to access and use the Data Products solely for Buyer's internal business purposes. Buyer shall not resell, sublicense, or disclose the Data Products to any third party except as expressly permitted in this Agreement. Any derived works must include attribution to Seller's data sources.`,
    },
    {
        id: "security-standards",
        title: "Security & Compliance",
        description:
            "Enterprise buyers expect clarity on the technical and organizational controls protecting the data.",
        keywords: ["security", "compliance", "breach"],
        template: `Security Standards. Seller maintains industry-standard administrative, physical, and technical safeguards designed to protect the confidentiality, integrity, and availability of the Data Products. Seller will notify Buyer within 48 hours of any confirmed breach affecting Buyer's data. Upon request, Seller will provide summaries of SOC 2 or equivalent audits.`,
    },
    {
        id: "support-escalation",
        title: "Support & Escalation",
        description:
            "Set expectations for response times and escalation paths when delivery issues arise.",
        keywords: ["support", "escalation", "response"],
        template: `Support and Escalation. Seller provides support via email at support@example.com Monday through Friday, 8am–6pm PT. P1 incidents impacting delivery are acknowledged within 1 business hour and resolved within 8 business hours. Buyer may escalate unresolved issues to the Seller's Head of Customer Success at success@example.com.`,
    },
];

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

    return <span className="font-mono tabular-nums">{formatted}</span>;
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
    const [copiedClauseId, setCopiedClauseId] = useState(null);

    useEffect(() => {
        if (contract) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [contract]);

    useEffect(() => {
        if (!contract) {
            setCopiedClauseId(null);
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

    const metadataInsights = useMemo(() => {
        if (!contract) {
            return {
                score: 0,
                readinessLabel: "No contract selected",
                readinessTone: "text-slate-400",
                readinessBadge: "bg-slate-800/70 text-slate-300",
                missingFields: [],
                improvementFields: [],
                bestPractices: BEST_PRACTICES,
            };
        }

        const entries = Object.entries(FIELD_GUIDANCE);
        const totalWeight = entries.reduce((sum, [, meta]) => sum + (meta.weight ?? 1), 0) || 1;
        let earned = 0;
        const missingFields = [];
        const improvementFields = [];

        entries.forEach(([key, meta]) => {
            const value = contract[key];
            const hasValue = !(value === undefined || value === null || value === "");

            if (!hasValue) {
                missingFields.push({
                    key,
                    label: meta.label,
                    suggestion: meta.suggestion,
                });
                return;
            }

            if (meta.validator && !meta.validator(value)) {
                improvementFields.push({
                    key,
                    label: meta.label,
                    suggestion: meta.improvement || meta.suggestion,
                });
                earned += meta.partialWeight ?? (meta.weight ?? 1) * 0.5;
                return;
            }

            earned += meta.weight ?? 1;
        });

        const score = Math.round((earned / totalWeight) * 100);

        let readinessLabel = "Draft";
        let readinessTone = "text-amber-300";
        let readinessBadge = "bg-amber-500/10 text-amber-300 border border-amber-400/40";

        if (score >= 85) {
            readinessLabel = "Enterprise Ready";
            readinessTone = "text-emerald-300";
            readinessBadge = "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40";
        } else if (score < 60) {
            readinessLabel = "Needs Attention";
            readinessTone = "text-rose-300";
            readinessBadge = "bg-rose-500/10 text-rose-300 border border-rose-400/40";
        }

        return {
            score,
            readinessLabel,
            readinessTone,
            readinessBadge,
            missingFields,
            improvementFields,
            bestPractices: BEST_PRACTICES,
        };
    }, [contract]);

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

    const clauseSuggestions = useMemo(() => {
        if (!contract) {
            return { recommended: [], all: CLAUSE_TEMPLATES };
        }

        const agreementText = String(contract.agreementText || "").toLowerCase();
        const resolved = CLAUSE_TEMPLATES.map((clause) => {
            const isPresent = clause.keywords.some((keyword) => agreementText.includes(keyword.toLowerCase()));
            return { ...clause, isPresent };
        });

        return {
            recommended: resolved.filter((clause) => !clause.isPresent),
            all: resolved,
        };
    }, [contract]);

    const handleClauseCopy = async (clause) => {
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(clause.template);
            } else {
                const temp = document.createElement("textarea");
                temp.value = clause.template;
                temp.setAttribute("readonly", "");
                temp.style.position = "absolute";
                temp.style.left = "-9999px";
                document.body.appendChild(temp);
                temp.select();
                document.execCommand("copy");
                document.body.removeChild(temp);
            }
            setCopiedClauseId(clause.id);
            setTimeout(() => {
                setCopiedClauseId((current) => (current === clause.id ? null : current));
            }, 2000);
        } catch (error) {
            console.error("Failed to copy clause", error);
            setCopiedClauseId("error");
        }
    };

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
                        const guidance = FIELD_GUIDANCE[field.key] || {};
                        const hasValue = !(rawValue === undefined || rawValue === null || rawValue === "");
                        const validator = guidance.validator;
                        const isValid = !validator || !hasValue || validator(rawValue);
                        const needsImprovement = hasValue && validator && !validator(rawValue);
                        const baseField = {
                            ...field,
                            suggestion: needsImprovement
                                ? guidance.improvement || guidance.suggestion
                                : guidance.suggestion,
                            isMissing: !hasValue,
                            needsImprovement,
                        };

                        if (!hasValue) {
                            return {
                                ...baseField,
                                value: (
                                    <span className="text-slate-400">
                                        Not provided. {guidance.suggestion || "Add this detail to complete the listing."}
                                    </span>
                                ),
                            };
                        }

                        if (field.render) {
                            return {
                                ...baseField,
                                value: field.render(rawValue),
                                isMissing: false,
                            };
                        }

                        if (field.formatter) {
                            const formatted = field.formatter(rawValue);
                            if (!formatted) {
                                return {
                                    ...baseField,
                                    value: (
                                        <span className="text-slate-400">
                                            Unable to format value. {guidance.suggestion || "Update this field."}
                                        </span>
                                    ),
                                    needsImprovement: true,
                                };
                            }

                            return {
                                ...baseField,
                                value: formatted,
                                isMissing: false,
                            };
                        }

                        return {
                            ...baseField,
                            value: String(rawValue),
                            isMissing: false,
                            needsImprovement: !isValid,
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

                    {contract && (
                        <section className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 shadow-inner">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Metadata score
                                    </p>
                                    <p className={`text-2xl font-semibold ${metadataInsights.readinessTone}`}>
                                        {metadataInsights.score}%
                                    </p>
                                </div>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${metadataInsights.readinessBadge}`}>
                                    {metadataInsights.readinessLabel}
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-800">
                                <div
                                    className="h-2 rounded-full bg-gradient-to-r from-[#3BAEAB] via-[#00D1FF] to-[#7465A8]"
                                    style={{ width: `${Math.min(metadataInsights.score, 100)}%` }}
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Quick wins
                                    </p>
                                    {metadataInsights.missingFields.length === 0 &&
                                    metadataInsights.improvementFields.length === 0 ? (
                                        <p className="text-sm text-slate-300">
                                            All critical metadata is in place. Review best practices to add polish.
                                        </p>
                                    ) : (
                                        <ul className="space-y-2 text-sm">
                                            {[...metadataInsights.missingFields, ...metadataInsights.improvementFields]
                                                .slice(0, 4)
                                                .map((item) => (
                                                    <li key={item.key} className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-2">
                                                        <p className="font-semibold text-slate-200">{item.label}</p>
                                                        <p className="text-xs text-slate-400">{item.suggestion}</p>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Best practices
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        {metadataInsights.bestPractices.map((practice) => (
                                            <li key={practice} className="rounded-lg border border-slate-800/70 bg-slate-900/60 p-2">
                                                {practice}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}

                    {clauseSuggestions.recommended.length > 0 && (
                        <section className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4 shadow-inner">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Agreement upgrades
                                    </p>
                                    <p className="text-base font-semibold text-slate-100">
                                        Add enterprise-friendly clauses in one click
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {clauseSuggestions.recommended.map((clause) => (
                                    <article
                                        key={clause.id}
                                        className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/30 p-3"
                                    >
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-100">{clause.title}</h3>
                                                <p className="text-xs text-slate-400">{clause.description}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
                                                onClick={() => handleClauseCopy(clause)}
                                            >
                                                {copiedClauseId === clause.id ? "Copied" : "Copy clause"}
                                            </Button>
                                        </div>
                                        <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-800/70 bg-slate-950/60 p-3 text-xs text-slate-300">
                                            {clause.template}
                                        </pre>
                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

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
                                            {section.fields.map(({
                                                key,
                                                label,
                                                value,
                                                isMissing,
                                                needsImprovement,
                                                suggestion,
                                            }) => (
                                                <div
                                                    key={key}
                                                    className={`flex flex-col gap-1 rounded-xl border p-4 ${
                                                        isMissing
                                                            ? "border-amber-400/60 bg-amber-500/5"
                                                            : needsImprovement
                                                            ? "border-sky-400/60 bg-sky-500/5"
                                                            : "border-slate-800 bg-slate-950/30"
                                                    }`}
                                                >
                                                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                        {label}
                                                    </dt>
                                                    <dd className="space-y-2 font-semibold text-slate-100">
                                                        {value}
                                                        {(isMissing || needsImprovement) && suggestion && (
                                                            <p
                                                                className={`text-xs font-normal ${
                                                                    isMissing ? "text-amber-200" : "text-sky-200"
                                                                }`}
                                                            >
                                                                {suggestion}
                                                            </p>
                                                        )}
                                                    </dd>
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
