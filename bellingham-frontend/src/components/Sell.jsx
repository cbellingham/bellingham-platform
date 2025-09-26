import React, { useState, useEffect, useContext, useCallback } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from '../context';
import AgreementEditorModal from "./AgreementEditorModal";
import contractTemplate from "../config/contractTemplate";

const inputClasses =
    "mt-1 w-full rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none";
const labelClasses = "block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400";

const Sell = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);
    const [form, setForm] = useState({
        effectiveDate: "",
        sellerFullName: "",
        sellerEntityType: "",
        sellerAddress: "",
        buyerFullName: "",
        buyerEntityType: "",
        buyerAddress: "",
        deliveryDate: "",
        deliveryFormat: "",
        platformName: "",
        title: "",
        price: "",
        dataDescription: "",
        agreementText: contractTemplate,
    });
    const steps = [
        { id: "listing", title: "Listing & Seller" },
        { id: "buyer", title: "Buyer Information" },
        { id: "delivery", title: "Delivery & Terms" },
    ];
    const [currentStep, setCurrentStep] = useState(0);
    const [snippet, setSnippet] = useState(null);
    const [message, setMessage] = useState("");
    const [contracts, setContracts] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAgreementModalOpen, setAgreementModalOpen] = useState(false);

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

    const handleFileChange = (e) => {
        setSnippet(e.target.files[0]);
    };

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
            buyerFullName: form.buyerFullName,
            buyerEntityType: form.buyerEntityType,
            buyerAddress: form.buyerAddress,
        };
        if (snippet) {
            data.termsFileName = snippet.name;
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
                buyerFullName: "",
                buyerEntityType: "",
                buyerAddress: "",
                deliveryDate: "",
                deliveryFormat: "",
                platformName: "",
                title: "",
                price: "",
                dataDescription: "",
                agreementText: contractTemplate,
            });
            setSnippet(null);
            setCurrentStep(0);
        } catch (err) {
            console.error(err);
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || "Submission failed.";
            setMessage(
                status
                    ? `❌ Submission failed (${status}): ${message}`
                    : `❌ Submission failed: ${message}`
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
            case "listing":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className={labelClasses}>
                                Effective Date
                                <input
                                    type="date"
                                    name="effectiveDate"
                                    value={form.effectiveDate}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </label>
                            <label className={labelClasses}>
                                Platform Name
                                <input
                                    type="text"
                                    name="platformName"
                                    value={form.platformName}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </label>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className={labelClasses}>
                                Listing Title
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </label>
                            <label className={labelClasses}>
                                Asking Price
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </label>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className={labelClasses}>
                                Seller Full Name
                                <input
                                    type="text"
                                    name="sellerFullName"
                                    value={form.sellerFullName}
                                    onChange={handleChange}
                                    className={inputClasses}
                                    required
                                />
                            </label>
                            <label className={labelClasses}>
                                Seller Entity Type
                                <input
                                    type="text"
                                    name="sellerEntityType"
                                    value={form.sellerEntityType}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </label>
                        </div>
                        <label className={labelClasses}>
                            Seller Address
                            <textarea
                                name="sellerAddress"
                                value={form.sellerAddress}
                                onChange={handleChange}
                                className={`${inputClasses} min-h-[100px]`}
                            />
                        </label>
                    </div>
                );
            case "buyer":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className={labelClasses}>
                                Buyer Full Name
                                <input
                                    type="text"
                                    name="buyerFullName"
                                    value={form.buyerFullName}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </label>
                            <label className={labelClasses}>
                                Buyer Entity Type
                                <input
                                    type="text"
                                    name="buyerEntityType"
                                    value={form.buyerEntityType}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </label>
                        </div>
                        <label className={labelClasses}>
                            Buyer Address
                            <textarea
                                name="buyerAddress"
                                value={form.buyerAddress}
                                onChange={handleChange}
                                className={`${inputClasses} min-h-[100px]`}
                            />
                        </label>
                        <label className={labelClasses}>
                            Data Description
                            <textarea
                                name="dataDescription"
                                value={form.dataDescription}
                                onChange={handleChange}
                                className={`${inputClasses} min-h-[120px]`}
                                placeholder="Outline the dataset content, granularity, and key attributes"
                            />
                        </label>
                    </div>
                );
            case "delivery":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <label className={labelClasses}>
                                Delivery Date
                                <input
                                    type="date"
                                    name="deliveryDate"
                                    value={form.deliveryDate}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </label>
                            <label className={labelClasses}>
                                Delivery Format
                                <input
                                    type="text"
                                    name="deliveryFormat"
                                    value={form.deliveryFormat}
                                    onChange={handleChange}
                                    className={inputClasses}
                                />
                            </label>
                        </div>
                        <label className={labelClasses}>
                            Upload Supporting Terms
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className={inputClasses}
                            />
                        </label>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Agreement Draft</p>
                            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-sm text-slate-200">
                                <p className="mb-3 text-slate-300">
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
            default:
                return null;
        }
    };

    return (
        <>
            <Layout onLogout={handleLogout}>
                <div className="flex flex-col gap-8">
                    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                        <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Primary Listing</p>
                            <h1 className="text-3xl font-bold text-white">Sell Your Data Contract</h1>
                            <p className="text-sm text-slate-400">
                                Provide the core commercial terms, delivery requirements, and legal agreement to list a new contract.
                            </p>
                        </div>
                        {message && (
                            <p className="mt-4 rounded-lg border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
                                {message}
                            </p>
                        )}
                        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                        Step {currentStep + 1} of {steps.length}
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
                    </section>

                    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                        <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Portfolio</p>
                            <h2 className="text-2xl font-bold text-white">My Contracts</h2>
                            <p className="text-sm text-slate-400">
                                Manage the contracts you currently have listed on the marketplace.
                            </p>
                        </div>
                        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                        <div className="mt-6 overflow-hidden rounded-xl border border-slate-800/80">
                            <table className="w-full table-auto divide-y divide-slate-800 text-left text-sm text-slate-200">
                                <thead className="sticky top-0 z-10 bg-slate-900/90 text-xs uppercase tracking-[0.18em] text-slate-400 backdrop-blur">
                                    <tr>
                                        <th className="px-4 py-3">Title</th>
                                        <th className="px-4 py-3">Buyer</th>
                                        <th className="px-4 py-3">Ask Price</th>
                                        <th className="px-4 py-3">Delivery</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {contracts.map((c) => (
                                        <tr key={c.id} className="bg-slate-950/40">
                                            <td className="px-4 py-3 font-semibold text-slate-100">{c.title}</td>
                                            <td className="px-4 py-3">{c.buyerUsername || "-"}</td>
                                            <td className="px-4 py-3 font-semibold text-[#3BAEAB]">${c.price}</td>
                                            <td className="px-4 py-3 text-slate-300">{c.deliveryDate}</td>
                                            <td className="px-4 py-3">
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
