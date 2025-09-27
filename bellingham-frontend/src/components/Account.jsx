import React, { useEffect, useState, useContext } from "react";
import Layout from "./Layout";
import Button from "./ui/Button";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from '../context';

const inputClasses =
    "w-full max-w-lg rounded-lg border border-slate-800/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 focus:border-[#00D1FF] focus:outline-none";
const labelClasses = "block w-full max-w-lg text-xs font-semibold uppercase tracking-[0.18em] text-slate-400";
const fieldGroupClasses = "space-y-4";
const controlStackClasses = "space-y-2";

const Account = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    const { isAuthenticated, logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!isAuthenticated) {
                    navigate("/login");
                    return;
                }
                const res = await api.get(`/api/profile`);
                setProfile(res.data);
                setFormData(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load profile");
            }
        };
        fetchProfile();
    }, [isAuthenticated, navigate]);

    if (error) {
        return (
            <Layout onLogout={handleLogout}>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-red-400 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    {error}
                </div>
            </Layout>
        );
    }

    if (!profile) {
        return (
            <Layout onLogout={handleLogout}>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                    Loading account details...
                </div>
            </Layout>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const res = await api.put(`/api/profile`, formData);
            setProfile(res.data);
            setEditing(false);
        } catch (err) {
            console.error(err);
            setError("Failed to save profile");
        }
    };

    const details = [
        { label: "Username", value: profile.username },
        { label: "Legal Business Name", value: profile.legalBusinessName },
        { label: "Name", value: profile.name },
        { label: "Country of Incorporation", value: profile.countryOfIncorporation },
        { label: "Tax ID", value: profile.taxId },
        { label: "Company Registration Number", value: profile.companyRegistrationNumber },
        { label: "Primary Contact Name", value: profile.primaryContactName },
        { label: "Primary Contact Email", value: profile.primaryContactEmail },
        { label: "Primary Contact Phone", value: profile.primaryContactPhone },
        { label: "Technical Contact Name", value: profile.technicalContactName },
        { label: "Technical Contact Email", value: profile.technicalContactEmail },
        { label: "Technical Contact Phone", value: profile.technicalContactPhone },
        { label: "Company Description", value: profile.companyDescription },
    ];

    return (
        <Layout onLogout={handleLogout}>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                <div className="space-y-6">
                    <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Profile</p>
                        <h1 className="text-3xl font-bold text-white">Account Details</h1>
                        <p className="text-sm text-slate-400">
                            Review and maintain your organisation information used across settlements and compliance processes.
                        </p>
                    </div>

                    {editing ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-username" className={labelClasses}>
                                        Username
                                    </label>
                                    <input
                                        id="account-username"
                                        value={profile.username}
                                        disabled
                                        className={`${inputClasses} cursor-not-allowed opacity-60`}
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-legalBusinessName" className={labelClasses}>
                                        Legal Business Name
                                    </label>
                                    <input
                                        id="account-legalBusinessName"
                                        className={inputClasses}
                                        name="legalBusinessName"
                                        value={formData.legalBusinessName || ""}
                                        onChange={handleChange}
                                        placeholder="Legal Business Name"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-name" className={labelClasses}>
                                        Name
                                    </label>
                                    <input
                                        id="account-name"
                                        className={inputClasses}
                                        name="name"
                                        value={formData.name || ""}
                                        onChange={handleChange}
                                        placeholder="Name"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-countryOfIncorporation" className={labelClasses}>
                                        Country of Incorporation
                                    </label>
                                    <input
                                        id="account-countryOfIncorporation"
                                        className={inputClasses}
                                        name="countryOfIncorporation"
                                        value={formData.countryOfIncorporation || ""}
                                        onChange={handleChange}
                                        placeholder="Country of Incorporation"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-taxId" className={labelClasses}>
                                        Tax ID
                                    </label>
                                    <input
                                        id="account-taxId"
                                        className={inputClasses}
                                        name="taxId"
                                        value={formData.taxId || ""}
                                        onChange={handleChange}
                                        placeholder="Tax ID"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-companyRegistrationNumber" className={labelClasses}>
                                        Company Registration Number
                                    </label>
                                    <input
                                        id="account-companyRegistrationNumber"
                                        className={inputClasses}
                                        name="companyRegistrationNumber"
                                        value={formData.companyRegistrationNumber || ""}
                                        onChange={handleChange}
                                        placeholder="Company Registration Number"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-primaryContactName" className={labelClasses}>
                                        Primary Contact Name
                                    </label>
                                    <input
                                        id="account-primaryContactName"
                                        className={inputClasses}
                                        name="primaryContactName"
                                        value={formData.primaryContactName || ""}
                                        onChange={handleChange}
                                        placeholder="Primary Contact Name"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-primaryContactEmail" className={labelClasses}>
                                        Primary Contact Email
                                    </label>
                                    <input
                                        id="account-primaryContactEmail"
                                        className={inputClasses}
                                        name="primaryContactEmail"
                                        value={formData.primaryContactEmail || ""}
                                        onChange={handleChange}
                                        placeholder="Primary Contact Email"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-primaryContactPhone" className={labelClasses}>
                                        Primary Contact Phone
                                    </label>
                                    <input
                                        id="account-primaryContactPhone"
                                        className={inputClasses}
                                        name="primaryContactPhone"
                                        value={formData.primaryContactPhone || ""}
                                        onChange={handleChange}
                                        placeholder="Primary Contact Phone"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-technicalContactName" className={labelClasses}>
                                        Technical Contact Name
                                    </label>
                                    <input
                                        id="account-technicalContactName"
                                        className={inputClasses}
                                        name="technicalContactName"
                                        value={formData.technicalContactName || ""}
                                        onChange={handleChange}
                                        placeholder="Technical Contact Name"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-technicalContactEmail" className={labelClasses}>
                                        Technical Contact Email
                                    </label>
                                    <input
                                        id="account-technicalContactEmail"
                                        className={inputClasses}
                                        name="technicalContactEmail"
                                        value={formData.technicalContactEmail || ""}
                                        onChange={handleChange}
                                        placeholder="Technical Contact Email"
                                    />
                                </div>
                            </div>
                            <div className={fieldGroupClasses}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-technicalContactPhone" className={labelClasses}>
                                        Technical Contact Phone
                                    </label>
                                    <input
                                        id="account-technicalContactPhone"
                                        className={inputClasses}
                                        name="technicalContactPhone"
                                        value={formData.technicalContactPhone || ""}
                                        onChange={handleChange}
                                        placeholder="Technical Contact Phone"
                                    />
                                </div>
                            </div>
                            <div className={`${fieldGroupClasses} md:col-span-2`}>
                                <div className={controlStackClasses}>
                                    <label htmlFor="account-companyDescription" className={labelClasses}>
                                        Company Description
                                    </label>
                                    <textarea
                                        id="account-companyDescription"
                                        className={`${inputClasses} min-h-[120px]`}
                                        name="companyDescription"
                                        value={formData.companyDescription || ""}
                                        onChange={handleChange}
                                        placeholder="Company Description"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                                <Button variant="success" onClick={handleSave} className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                    Save
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setEditing(false);
                                        setFormData(profile);
                                    }}
                                    className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {details.map((detail) => (
                                <div
                                    key={detail.label}
                                    className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/50 px-4 py-3"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{detail.label}</p>
                                    <p className="text-sm font-semibold text-slate-200">{detail.value || "-"}</p>
                                </div>
                            ))}
                            <div className="md:col-span-2 flex justify-end">
                                <Button onClick={() => setEditing(true)} className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default Account;
