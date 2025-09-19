import React, { useState, useEffect, useContext, useCallback } from "react";
import SignatureModal from "./SignatureModal";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from '../context';
import AgreementEditorModal from "./AgreementEditorModal";
import contractTemplate from "../config/contractTemplate";

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

    const [showSignature, setShowSignature] = useState(false);
    const [pendingData, setPendingData] = useState(null);

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
        setPendingData(data);
        setShowSignature(true);
        setMessage("");
    };

    const submitWithSignature = async (signature) => {
        if (isSubmitting) return;
        if (!pendingData) {
            setMessage("❌ Something went wrong while preparing your contract. Please try again.");
            setShowSignature(false);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...pendingData, sellerSignature: signature };
            const response = await api.post(`/api/contracts`, payload);
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
            setShowSignature(false);
            setPendingData(null);
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
                            <div>
                                <label className="block text-sm font-medium">Effective Date</label>
                                <input
                                    type="date"
                                    name="effectiveDate"
                                    value={form.effectiveDate}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Platform Name</label>
                                <input
                                    type="text"
                                    name="platformName"
                                    value={form.platformName}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Ask Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Data Description</label>
                            <input
                                type="text"
                                name="dataDescription"
                                value={form.dataDescription}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 bg-gray-800 rounded"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium">Seller Full Name</label>
                                <input
                                    type="text"
                                    name="sellerFullName"
                                    value={form.sellerFullName}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Seller Entity Type</label>
                                <input
                                    type="text"
                                    name="sellerEntityType"
                                    value={form.sellerEntityType}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Seller Address</label>
                            <input
                                type="text"
                                name="sellerAddress"
                                value={form.sellerAddress}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 bg-gray-800 rounded"
                                required
                            />
                        </div>
                    </div>
                );
            case "buyer":
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium">Buyer Full Name</label>
                                <input
                                    type="text"
                                    name="buyerFullName"
                                    value={form.buyerFullName}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Buyer Entity Type</label>
                                <input
                                    type="text"
                                    name="buyerEntityType"
                                    value={form.buyerEntityType}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Buyer Address</label>
                            <input
                                type="text"
                                name="buyerAddress"
                                value={form.buyerAddress}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 bg-gray-800 rounded"
                                required
                            />
                        </div>
                    </div>
                );
            case "delivery":
            default:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium">Delivery Date</label>
                                <input
                                    type="date"
                                    name="deliveryDate"
                                    value={form.deliveryDate}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Delivery Format</label>
                                <input
                                    type="text"
                                    name="deliveryFormat"
                                    value={form.deliveryFormat}
                                    onChange={handleChange}
                                    className="w-full p-2 mt-1 bg-gray-800 rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Agreement preview</h3>
                                    <p className="text-sm text-gray-400">Review the key terms before submitting.</p>
                                </div>
                                <Button type="button" onClick={openAgreementModal} className="self-start" variant="primary">
                                    Edit terms
                                </Button>
                            </div>
                            <div className="mt-3 text-sm text-gray-300 whitespace-pre-line max-h-56 overflow-y-auto border border-gray-700 rounded p-3 bg-gray-900">
                                {form.agreementText}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Upload Data Snippet</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="w-full p-2 mt-1 bg-gray-800 rounded"
                                accept=".csv,.json,.txt"
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
        <Layout onLogout={handleLogout}>
            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold mb-6">Sell Your Data Contract</h1>
                {message && <p className="mb-4">{message}</p>}
                <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                    <div>
                        <div className="flex items-baseline justify-between mb-2">
                            <p className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</p>
                            <span className="text-base font-medium">{steps[currentStep].title}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>

                    {renderStepContent()}

                    <div className="flex items-center justify-between pt-2">
                        {currentStep > 0 ? (
                            <Button type="button" variant="ghost" onClick={goToPreviousStep}>
                                Back
                            </Button>
                        ) : (
                            <span />
                        )}
                        {currentStep < steps.length - 1 ? (
                            <Button type="button" onClick={goToNextStep}>
                                Next
                            </Button>
                        ) : (
                            <Button type="submit" variant="success" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit Contract"}
                            </Button>
                        )}
                    </div>
                </form>

            <h2 className="text-2xl font-bold mt-10 mb-4">My Contracts</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <table className="w-[90%] mx-auto table-auto border border-collapse border-gray-700 bg-gray-800 text-white shadow rounded">
                <thead>
                    <tr className="bg-gray-700 text-left">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Buyer</th>
                        <th className="border p-2">Ask Price</th>
                        <th className="border p-2">Delivery</th>
                        <th className="border p-2">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {contracts.map((c) => (
                        <tr key={c.id} className="hover:bg-gray-600">
                            <td className="border p-2">{c.title}</td>
                            <td className="border p-2">{c.buyerUsername || "-"}</td>
                            <td className="border p-2">${c.price}</td>
                            <td className="border p-2">{c.deliveryDate}</td>
                            <td className="border p-2">{c.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
        </Layout>
        {isAgreementModalOpen && (
            <AgreementEditorModal
                initialValue={form.agreementText}
                onSave={handleAgreementSave}
                onCancel={handleAgreementCancel}
            />
        )}
        {showSignature && (
            <SignatureModal
                onConfirm={submitWithSignature}
                onCancel={() => setShowSignature(false)}
            />
        )}
        </>
    );
};

export default Sell;
