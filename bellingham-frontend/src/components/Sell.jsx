import React, { useState, useEffect, useContext, useCallback } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from '../context';
import AgreementEditorModal from "./AgreementEditorModal";
import contractTemplate from "../config/contractTemplate";
import DataSampleAnalyzer from "./DataSampleAnalyzer";

const inputClasses =
    "w-full max-w-lg rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none";
const labelClasses = "block w-full max-w-lg text-xs font-semibold uppercase tracking-[0.18em] text-slate-400";
const fieldGroupClasses = "space-y-4 md:max-w-lg md:place-self-start";
const controlStackClasses = "space-y-2";

const Sell = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [form, setForm] = useState({
        effectiveDate: "",
        sellerFullName: "",
        sellerEntityType: "",
        sellerAddress: "",
        deliveryDate: "",
        deliveryFormat: "",
        platformName: "",
        title: "",
        price: "",
        dataDescription: "",
        agreementText: contractTemplate,
    });
    const steps = [
        { id: "readiness", title: "Seller Readiness" },
        { id: "sample", title: "Data Sample" },
        { id: "listing", title: "Listing Details" },
        { id: "delivery", title: "Delivery & Legal" },
        { id: "review", title: "Review" },
    ];
    const flowStages = [
        {
            title: "Align with your buyer",
            description:
                "Confirm you have clean, sale-ready data and know the buyer needs you want to meet.",
        },
        {
            title: "Share a safe sample",
            description:
                "Upload or reference a non-sensitive snippet so we can help verify quality before sale.",
        },
        {
            title: "Describe the listing",
            description:
                "Give the offer a name, price, and narrative buyers can review before reaching out.",
        },
        {
            title: "Set delivery & terms",
            description:
                "Clarify how the dataset will be transferred, when it’s due, and attach any supporting terms.",
        },
        {
            title: "Publish & manage",
            description:
                "Review the summary, submit the contract, and monitor performance in your portfolio.",
        },
    ];
    const [currentStep, setCurrentStep] = useState(0);
    const [snippet, setSnippet] = useState(null);
    const [supportingTermsFile, setSupportingTermsFile] = useState(null);
    const [message, setMessage] = useState("");
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAgreementModalOpen, setAgreementModalOpen] = useState(false);
    const [analysisReport, setAnalysisReport] = useState(null);
    const [analysisError, setAnalysisError] = useState("");
    const [isAnalyzingSample, setIsAnalyzingSample] = useState(false);

    const loadContracts = useCallback(async () => {
        try {
            const res = await api.get(`/api/contracts/my`);
            setContracts(res.data.content);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load contracts.");
        }
    }, []);

    useEffect(() => {
        loadContracts();
    }, [loadContracts]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const applyReportToDescription = useCallback((report) => {
        if (!report) {
            return;
        }

        setForm((prev) => {
            if (prev.dataDescription) {
                return prev;
            }

            const highlightedColumns = (report.columns || [])
                .filter((column) => column?.name)
                .slice(0, 4)
                .map((column) => column.name);

            const summaryParts = [report.summary];
            if (highlightedColumns.length > 0) {
                summaryParts.push(`Key fields: ${highlightedColumns.join(", ")}.`);
            }

            if (report.contractRecommendations?.length) {
                summaryParts.push(report.contractRecommendations[0]);
            }

            const generatedDescription = summaryParts
                .filter(Boolean)
                .join(" ")
                .trim();

            if (!generatedDescription) {
                return prev;
            }

            return { ...prev, dataDescription: generatedDescription };
        });
    }, []);

    const analyzeSample = useCallback(async (file) => {
        if (!file) {
            return;
        }

        setIsAnalyzingSample(true);
        setAnalysisError("");
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post(`/api/data/analyze`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            const report = response?.data;
            setAnalysisReport(report);
            applyReportToDescription(report);
            if (report?.summary) {
                setMessage(`📊 ${report.summary}`);
            }
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || "Unable to analyse the sample.";
            setAnalysisError(
                status ? `Unable to analyse the sample (${status}): ${message}` : `Unable to analyse the sample: ${message}`
            );
        } finally {
            setIsAnalyzingSample(false);
        }
    }, [applyReportToDescription]);

    const handleSampleSelect = useCallback((file) => {
        setSnippet(file || null);
        if (!file) {
            setAnalysisReport(null);
            setAnalysisError("");
        }
    }, []);

    const handleSupportingTermsChange = useCallback((event) => {
        const file = event.target.files?.[0] || null;
        setSupportingTermsFile(file);
        if (event.target) {
            event.target.value = "";
        }
    }, []);

    const handleRemoveSupportingTerms = useCallback(() => {
        setSupportingTermsFile(null);
    }, []);

    const goToNextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const goToPreviousStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const openAgreementModal = () => {
        setAgreementModalOpen(true);
    };

    const handleAgreementSave = (updatedText) => {
        setForm((prev) => ({ ...prev, agreementText: updatedText }));
        setAgreementModalOpen(false);
    };

    const handleAgreementCancel = () => {
        setAgreementModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (currentStep < steps.length - 1) {
            goToNextStep();
            return;
        }
        if (isSubmitting) return;

        const data = {
            title: form.title,
            deliveryDate: form.deliveryDate,
            deliveryFormat: form.deliveryFormat,
            platformName: form.platformName,
            price: parseFloat(form.price || 0),
            dataDescription: form.dataDescription,
            agreementText: form.agreementText,
            effectiveDate: form.effectiveDate,
            sellerFullName: form.sellerFullName,
            sellerEntityType: form.sellerEntityType,
            sellerAddress: form.sellerAddress,
        };
        if (supportingTermsFile) {
            data.termsFileName = supportingTermsFile.name;
        }
        setMessage("");
        setIsSubmitting(true);
        try {
            const response = await api.post(`/api/contracts`, data);
            const savedContract = response?.data;
            if (savedContract) {
                setContracts((prev) => [savedContract, ...prev]);
            } else {
                await loadContracts();
            }
            setMessage(
                savedContract?.title
                    ? `✅ "${savedContract.title}" has been listed successfully!`
                    : "✅ Data contract submitted!"
            );
            setForm({
                effectiveDate: "",
                sellerFullName: "",
                sellerEntityType: "",
                sellerAddress: "",
                deliveryDate: "",
                deliveryFormat: "",
                platformName: "",
                title: "",
                price: "",
                dataDescription: "",
                agreementText: contractTemplate,
            });
            setSnippet(null);
            setSupportingTermsFile(null);
            setAnalysisReport(null);
            setAnalysisError("");
            setCurrentStep(0);
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const defaultMessage = err.response?.data?.message || err.message || "Submission failed.";

            let friendlyMessage = defaultMessage;
            if (status === 401) {
                friendlyMessage =
                    "Your session has expired. Please sign in again to list your data contract.";
            } else if (status === 403) {
                friendlyMessage =
                    "We couldn't verify your access. Make sure you're signed in—data samples are optional.";
            }

            setMessage(
                status
                    ? `❌ Submission failed (${status}): ${friendlyMessage}`
                    : `❌ Submission failed: ${friendlyMessage}`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const progressPercentage = ((currentStep + 1) / steps.length) * 100;

    const renderStepContent = () => {
        const stepId = steps[currentStep]?.id;
        switch (stepId) {
            case "readiness":
                return (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-sm text-slate-300">
                            <p>
                                Capture the essentials about you as the seller so the marketplace knows who is offering
                                the data. These details stay attached to the contract you publish.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="effectiveDate" className={labelClasses}>
                                        Effective Date
                                    </label>
                                    <input
                                        id="effectiveDate"
                                        type="date"
                                        name="effectiveDate"
                                        value={form.effectiveDate}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="platformName" className={labelClasses}>
                                        Platform Name
                                    </label>
                                    <input
                                        id="platformName"
                                        type="text"
                                        name="platformName"
                                        value={form.platformName}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="sellerFullName" className={labelClasses}>
                                        Seller Full Name
                                    </label>
                                    <input
                                        id="sellerFullName"
                                        type="text"
                                        name="sellerFullName"
                                        value={form.sellerFullName}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="sellerEntityType" className={labelClasses}>
                                        Seller Entity Type
                                    </label>
                                    <input
                                        id="sellerEntityType"
                                        type="text"
                                        name="sellerEntityType"
                                        value={form.sellerEntityType}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={fieldGroupClasses}>
                            <div className={controlStackClasses}>
                                <label htmlFor="sellerAddress" className={labelClasses}>
                                    Seller Address
                                </label>
                                <textarea
                                    id="sellerAddress"
                                    name="sellerAddress"
                                    value={form.sellerAddress}
                                    onChange={handleChange}
                                    className={`${inputClasses} min-h-[100px]`}
                                />
                            </div>
                        </div>
                    </div>
                );
            case "sample":
                return (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-[#3BAEAB]/40 bg-[#3BAEAB]/5 p-4 text-sm text-slate-200">
                            <p className="font-semibold uppercase tracking-[0.18em] text-[#3BAEAB]">
                                Optional confidence boost
                            </p>
                            <p className="mt-2 text-slate-100">
                                Upload a representative slice of your dataset. We will analyse it to highlight key fields
                                and help you pre-fill the description buyers see.
                            </p>
                        </div>
                        <DataSampleAnalyzer
                            selectedFile={snippet}
                            onSelectFile={handleSampleSelect}
                            onRemoveFile={() => handleSampleSelect(null)}
                            onAnalyze={analyzeSample}
                            isAnalyzing={isAnalyzingSample}
                            analysisError={analysisError}
                            report={analysisReport}
                        />
                        {analysisReport && (
                            <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-sm text-slate-300">
                                <p className="font-semibold text-slate-200">Analysis Summary</p>
                                <p className="mt-1 text-slate-300">{analysisReport.summary}</p>
                                {analysisReport.columns?.length ? (
                                    <ul className="mt-3 list-inside list-disc space-y-1 text-slate-400">
                                        {analysisReport.columns.slice(0, 5).map((column) => (
                                            <li key={column?.name || column?.field}>
                                                <span className="font-medium text-slate-200">{column?.name}</span>
                                                {column?.description ? ` — ${column.description}` : ""}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        )}
                    </div>
                );
            case "listing":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="title" className={labelClasses}>
                                        Listing Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="price" className={labelClasses}>
                                        Asking Price
                                    </label>
                                    <input
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="price"
                                        value={form.price}
                                        onChange={handleChange}
                                        className={inputClasses}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={fieldGroupClasses}>
                            <div className={controlStackClasses}>
                                <label htmlFor="dataDescription" className={labelClasses}>
                                    Data Description
                                </label>
                                <textarea
                                    id="dataDescription"
                                    name="dataDescription"
                                    value={form.dataDescription}
                                    onChange={handleChange}
                                    className={`${inputClasses} min-h-[120px]`}
                                    placeholder="Outline the dataset content, granularity, and key attributes"
                                />
                            </div>
                        </div>
                    </div>
                );
            case "delivery":
                return (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-slate-800/70 bg-slate-950/40 p-4 text-sm text-slate-300">
                            <p>
                                Outline how you will deliver the dataset and provide any supporting documentation that helps
                                a buyer complete due diligence quickly.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="deliveryDate" className={labelClasses}>
                                        Delivery Date
                                    </label>
                                    <input
                                        id="deliveryDate"
                                        type="date"
                                        name="deliveryDate"
                                        value={form.deliveryDate}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="deliveryFormat" className={labelClasses}>
                                        Delivery Format
                                    </label>
                                    <input
                                        id="deliveryFormat"
                                        type="text"
                                        name="deliveryFormat"
                                        value={form.deliveryFormat}
                                        onChange={handleChange}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={fieldGroupClasses}>
                            <div className={controlStackClasses}>
                                <label htmlFor="supportingTerms" className={labelClasses}>
                                    Upload Supporting Terms
                                </label>
                                <input
                                    id="supportingTerms"
                                    type="file"
                                    onChange={handleSupportingTermsChange}
                                    className={inputClasses}
                                />
                                <p className="text-xs text-slate-500">
                                    Optional: include an attachment with any additional legal terms or schedules.
                                </p>
                                {supportingTermsFile && (
                                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800/60 bg-slate-950/60 px-3 py-2 text-xs text-slate-200">
                                        <span className="truncate font-medium" title={supportingTermsFile.name}>
                                            {supportingTermsFile.name}
                                        </span>
                                        <Button type="button" variant="ghost" onClick={handleRemoveSupportingTerms} className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
                                            Remove
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Agreement Draft</p>
                            <div className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-sm text-slate-200">
                                <p className="text-slate-300">
                                    Review or update the legal agreement that will govern this contract. Buyers will receive this
                                    text as part of the execution workflow.
                                </p>
                                <Button type="button" onClick={openAgreementModal} className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                    Edit Agreement
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            case "review":
                return (
                    <div className="space-y-6">
                        <div className="rounded-xl border border-[#7465A8]/40 bg-[#7465A8]/10 p-4 text-sm text-slate-100">
                            <p className="font-semibold uppercase tracking-[0.18em] text-[#C1B4FF]">Final review</p>
                            <p className="mt-2 text-slate-200">
                                Check every field before publishing. Use Back to make edits—the submit button will post the
                                contract immediately to your marketplace portfolio.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {[{
                                label: "Listing Title",
                                value: form.title || "Not provided",
                            }, {
                                label: "Asking Price",
                                value: form.price ? `$${Number(form.price).toLocaleString()}` : "Not provided",
                            }, {
                                label: "Delivery Date",
                                value: form.deliveryDate || "Not provided",
                            }, {
                                label: "Delivery Format",
                                value: form.deliveryFormat || "Not provided",
                            }, {
                                label: "Effective Date",
                                value: form.effectiveDate || "Not provided",
                            }, {
                                label: "Platform",
                                value: form.platformName || "Not provided",
                            }, {
                                label: "Seller",
                                value: form.sellerFullName || "Not provided",
                            }, {
                                label: "Entity Type",
                                value: form.sellerEntityType || "Not provided",
                            }].map((item) => (
                                <div key={item.label} className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                                    <p className="mt-2 text-sm text-slate-100">{item.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Data Description</p>
                            <p className="text-sm text-slate-200 whitespace-pre-line">
                                {form.dataDescription || "No description provided yet."}
                            </p>
                        </div>
                        <div className="space-y-4 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Attachments</p>
                            <ul className="space-y-2 text-sm text-slate-200">
                                <li className="flex items-center justify-between gap-3">
                                    <span>Data Sample</span>
                                    <span className="text-slate-400">{snippet ? snippet.name : "Not attached"}</span>
                                </li>
                                <li className="flex items-center justify-between gap-3">
                                    <span>Supporting Terms</span>
                                    <span className="text-slate-400">
                                        {supportingTermsFile ? supportingTermsFile.name : "Not attached"}
                                    </span>
                                </li>
                            </ul>
                            <Button type="button" onClick={openAgreementModal} className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                Preview Agreement
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Layout onLogout={handleLogout}>
                <div className="flex flex-col gap-8">
                    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Primary Listing</p>
                                <h1 className="text-3xl font-bold text-white">Sell Your Data Contract</h1>
                                <p className="text-sm text-slate-400">
                                    Provide the core commercial terms, delivery requirements, and legal agreement to list a new contract.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Flow Overview</p>
                                <ol className="grid gap-4 md:grid-cols-5">
                                    {flowStages.map((stage, index) => (
                                        <li
                                            key={stage.title}
                                            className="relative flex h-full flex-col gap-2 rounded-xl border border-slate-800/70 bg-slate-950/40 p-4"
                                        >
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#00D1FF]">
                                                    Step {index + 1}
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-white">{stage.title}</p>
                                            </div>
                                            <p className="text-xs text-slate-300">{stage.description}</p>
                                            {index < flowStages.length - 1 && (
                                                <span className="absolute right-[-12px] top-1/2 hidden -translate-y-1/2 text-lg text-slate-600 md:block">
                                                    ➝
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            {message && (
                                <p className="rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
                                    {message}
                                </p>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                            Step <span className="font-mono tabular-nums">{currentStep + 1}</span> of{' '}
                                            <span className="font-mono tabular-nums">{steps.length}</span>
                                        </p>
                                        <span className="text-sm font-semibold text-white">{steps[currentStep].title}</span>
                                    </div>
                                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-slate-800/60 bg-slate-950/60">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#3BAEAB] to-[#7465A8] transition-all duration-300"
                                            style={{ width: `${progressPercentage}%` }}
                                        />
                                    </div>
                                </div>

                                {renderStepContent()}

                                <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                                    {currentStep > 0 ? (
                                        <Button type="button" variant="ghost" onClick={goToPreviousStep} className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                            Back
                                        </Button>
                                    ) : (
                                        <span />
                                    )}
                                    {currentStep < steps.length - 1 ? (
                                        <Button type="button" onClick={goToNextStep} className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                            Next
                                        </Button>
                                    ) : (
                                        <Button type="submit" variant="success" disabled={isSubmitting} className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                            {isSubmitting ? "Submitting..." : "Submit Contract"}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Portfolio</p>
                                <h2 className="text-2xl font-bold text-white">My Contracts</h2>
                                <p className="text-sm text-slate-400">
                                    Manage the contracts you currently have listed on the marketplace.
                                </p>
                            </div>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <div className="overflow-hidden rounded-xl border border-slate-800/80">
                                <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                                    <thead className="sticky top-0 z-10 bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                                        <tr>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Title</th>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Buyer</th>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Ask Price</th>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Delivery</th>
                                            <th className="px-4 py-3 md:px-5 md:py-3.5">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/70">
                                        {contracts.map((c) => (
                                            <tr key={c.id} className="bg-slate-950/40">
                                                <td className="px-4 py-3 md:px-5 md:py-3.5 font-semibold text-slate-100">{c.title}</td>
                                                <td className="px-4 py-3 md:px-5 md:py-3.5">{c.buyerUsername || "-"}</td>
                                                <td className="px-4 py-3 md:px-5 md:py-3.5 font-semibold text-[#3BAEAB] font-mono tabular-nums">${c.price}</td>
                                                <td className="px-4 py-3 md:px-5 md:py-3.5 text-slate-300">{c.deliveryDate}</td>
                                                <td className="px-4 py-3 md:px-5 md:py-3.5">
                                                    <span className="rounded-full border border-[#00D1FF]/40 bg-[#00D1FF]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#00D1FF]">
                                                        {c.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {contracts.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-10 text-center text-slate-500">
                                                    You have not listed any contracts yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </Layout>
            {isAgreementModalOpen && (
                <AgreementEditorModal
                    initialValue={form.agreementText}
                    onSave={handleAgreementSave}
                    onCancel={handleAgreementCancel}
                />
            )}
        </>
    );
};

export default Sell;
