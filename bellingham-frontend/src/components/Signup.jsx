import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Button from "./ui/Button";
import api from "../utils/api";

const Signup = () => {
    const [form, setForm] = useState({
        username: "",
        password: "",
        legalBusinessName: "",
        name: "",
        countryOfIncorporation: "",
        taxId: "",
        companyRegistrationNumber: "",
        primaryContactName: "",
        primaryContactEmail: "",
        primaryContactPhone: "",
        technicalContactName: "",
        technicalContactEmail: "",
        technicalContactPhone: "",
        companyDescription: "",
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const fieldConfig = useMemo(
        () => [
            {
                name: "username",
                type: "text",
                label: "Username",
                placeholder: "Username",
                helpText: "Must be at least 3 characters long.",
                validate: (value) => {
                    if (!value.trim()) return "Username is required.";
                    if (value.trim().length < 3) return "Username must be at least 3 characters.";
                    return "";
                },
            },
            {
                name: "password",
                type: "password",
                label: "Password",
                placeholder: "Password",
                helpText: "Use 8+ characters with a mix of letters and numbers.",
                validate: (value) => {
                    if (!value) return "Password is required.";
                    if (value.length < 8) return "Password must be at least 8 characters.";
                    if (!/[A-Za-z]/.test(value) || !/\d/.test(value))
                        return "Password must include both letters and numbers.";
                    return "";
                },
            },
            {
                name: "legalBusinessName",
                type: "text",
                label: "Legal Business Name",
                placeholder: "Legal Business Name",
                helpText: "Enter the registered legal name of your company.",
                validate: (value) => {
                    if (!value.trim()) return "Legal business name is required.";
                    return "";
                },
            },
            {
                name: "name",
                type: "text",
                label: "Your Name",
                placeholder: "Your Name",
                helpText: "Provide the name of the person completing this form.",
                validate: (value) => {
                    if (!value.trim()) return "Your name is required.";
                    return "";
                },
            },
            {
                name: "countryOfIncorporation",
                type: "text",
                label: "Country of Incorporation",
                placeholder: "Country of Incorporation",
                helpText: "Specify the country where the company is incorporated.",
                validate: (value) => {
                    if (!value.trim()) return "Country of incorporation is required.";
                    return "";
                },
            },
            {
                name: "taxId",
                type: "text",
                label: "UK or US Tax ID Code",
                placeholder: "UK or US Tax ID Code",
                helpText: "Provide a valid tax identification number (e.g., EIN or UTR).",
                validate: (value) => {
                    if (!value.trim()) return "Tax ID is required.";
                    if (!/[A-Za-z0-9-]{6,}/.test(value.trim()))
                        return "Enter a valid tax identification number.";
                    return "";
                },
            },
            {
                name: "companyRegistrationNumber",
                type: "text",
                label: "Company Registration Number",
                placeholder: "Company Registration Number",
                helpText: "Include any leading zeros from the official registration.",
                validate: (value) => {
                    if (!value.trim()) return "Company registration number is required.";
                    return "";
                },
            },
            {
                name: "primaryContactName",
                type: "text",
                label: "Primary Contact Name",
                placeholder: "Primary Contact Name",
                helpText: "This person will be our main point of contact.",
                validate: (value) => {
                    if (!value.trim()) return "Primary contact name is required.";
                    return "";
                },
            },
            {
                name: "primaryContactEmail",
                type: "email",
                label: "Primary Contact Email",
                placeholder: "Primary Contact Email",
                helpText: "We will send onboarding details to this address.",
                validate: (value) => {
                    if (!value.trim()) return "Primary contact email is required.";
                    if (!/^\S+@\S+\.\S+$/.test(value.trim()))
                        return "Enter a valid email address.";
                    return "";
                },
            },
            {
                name: "primaryContactPhone",
                type: "tel",
                label: "Primary Contact Phone",
                placeholder: "Primary Contact Phone",
                helpText: "Include country code, e.g., +1 555 123 4567.",
                validate: (value) => {
                    if (!value.trim()) return "Primary contact phone is required.";
                    if (!/^\+?[0-9 ()-]{7,}$/.test(value.trim()))
                        return "Enter a valid phone number.";
                    return "";
                },
            },
            {
                name: "technicalContactName",
                type: "text",
                label: "Technical Contact Name",
                placeholder: "Technical Contact Name",
                helpText: "Person responsible for integration and technical queries.",
                validate: (value) => {
                    if (!value.trim()) return "Technical contact name is required.";
                    return "";
                },
            },
            {
                name: "technicalContactEmail",
                type: "email",
                label: "Technical Contact Email",
                placeholder: "Technical Contact Email",
                helpText: "We will share API credentials with this address.",
                validate: (value) => {
                    if (!value.trim()) return "Technical contact email is required.";
                    if (!/^\S+@\S+\.\S+$/.test(value.trim()))
                        return "Enter a valid email address.";
                    return "";
                },
            },
            {
                name: "technicalContactPhone",
                type: "tel",
                label: "Technical Contact Phone",
                placeholder: "Technical Contact Phone",
                helpText: "Best number for urgent technical notifications.",
                validate: (value) => {
                    if (!value.trim()) return "Technical contact phone is required.";
                    if (!/^\+?[0-9 ()-]{7,}$/.test(value.trim()))
                        return "Enter a valid phone number.";
                    return "";
                },
            },
            {
                name: "companyDescription",
                type: "text",
                label: "One line company description",
                placeholder: "One line company description",
                helpText: "Share a short description for partner listings (max 160 characters).",
                validate: (value) => {
                    if (!value.trim()) return "Company description is required.";
                    if (value.trim().length > 160)
                        return "Description must be 160 characters or fewer.";
                    return "";
                },
            },
        ],
        []
    );

    const validateField = (name, value, currentForm) => {
        const field = fieldConfig.find((item) => item.name === name);
        if (!field) return "";
        return field.validate(value, currentForm ?? form);
    };

    const validateForm = (currentForm) => {
        const validationResult = {};
        fieldConfig.forEach((field) => {
            validationResult[field.name] = validateField(field.name, currentForm[field.name], currentForm);
        });
        return validationResult;
    };

    const handleBlur = (fieldName) => {
        setTouched((prev) => ({ ...prev, [fieldName]: true }));
        setErrors((prev) => ({ ...prev, [fieldName]: validateField(fieldName, form[fieldName], form) }));
    };

    const handleChange = (fieldName, value) => {
        const updatedForm = { ...form, [fieldName]: value };
        setForm(updatedForm);
        setErrors((prev) => ({ ...prev, [fieldName]: validateField(fieldName, value, updatedForm) }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        const currentErrors = validateForm(form);
        setErrors(currentErrors);
        const hasErrors = Object.values(currentErrors).some((value) => value);
        if (hasErrors) {
            const allTouched = fieldConfig.reduce((acc, field) => ({ ...acc, [field.name]: true }), {});
            setTouched(allTouched);
            return;
        }

        try {
            await api.post(`/api/register`, form);
            setMessage("Registration successful. Please log in.");
            setForm({
                username: "",
                password: "",
                legalBusinessName: "",
                name: "",
                countryOfIncorporation: "",
                taxId: "",
                companyRegistrationNumber: "",
                primaryContactName: "",
                primaryContactEmail: "",
                primaryContactPhone: "",
                technicalContactName: "",
                technicalContactEmail: "",
                technicalContactPhone: "",
                companyDescription: "",
            });
            setTouched({});
            setErrors({});
        } catch (err) {
            console.error(err);
            setError("Registration failed.");
        }
    };

    return (
        <div
            className="flex flex-col min-h-screen text-contrast font-sans"
            style={{
                backgroundColor: 'var(--bg-color)',
                backgroundImage: 'var(--bg-gradient)',
            }}
        >
            <Header />
            <div className="relative flex flex-col flex-1 items-center justify-center">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 px-3 py-1"
                >
                    Back
                </Button>
                <form onSubmit={handleSignup} className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl" noValidate>
                    <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
                    {message && <div className="text-green-600 mb-2">{message}</div>}
                    {error && <div className="text-red-600 mb-2">{error}</div>}
                    <div className="grid gap-6">
                        {fieldConfig.map((field) => {
                            const fieldId = `signup-${field.name}`;
                            const helpId = `${fieldId}-help`;
                            const errorId = `${fieldId}-error`;
                            const showError = touched[field.name] && errors[field.name];
                            const describedBy = `${helpId}${showError ? ` ${errorId}` : ""}`;

                            return (
                                <div key={field.name} className="flex flex-col">
                                    <label htmlFor={fieldId} className="font-medium text-sm text-gray-700 mb-1">
                                        {field.label}
                                    </label>
                                    <input
                                        id={fieldId}
                                        name={field.name}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={form[field.name]}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        onBlur={() => handleBlur(field.name)}
                                        aria-describedby={describedBy}
                                        aria-invalid={showError ? "true" : "false"}
                                        className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            showError ? "border-red-500" : "border-gray-300"
                                        }`}
                                    />
                                    <p id={helpId} className="text-xs text-gray-500 mt-1">
                                        {field.helpText}
                                    </p>
                                    {showError && (
                                        <p id={errorId} className="text-xs text-red-600 mt-1" role="alert">
                                            {errors[field.name]}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <Button type="submit" className="w-full mt-6 rounded-lg" variant="primary">
                        Register
                    </Button>
                    <Button
                        type="button"
                        variant="link"
                        className="w-full mt-2"
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
