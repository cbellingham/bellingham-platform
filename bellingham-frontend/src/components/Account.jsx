import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";
import { safeSetItem } from "../utils/storage";

const Account = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("profilePicture");
        navigate("/login");
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/profile`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setProfile(res.data);
                setFormData(res.data);
                if (res.data.profilePicture) {
                    if (!safeSetItem("profilePicture", res.data.profilePicture)) {
                        console.warn("Unable to cache profile picture");
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load profile");
            }
        };
        fetchProfile();
    }, [navigate]);

    if (error) {
        return (
            <div className="flex flex-col min-h-screen font-poppins bg-black text-white">
                <Header />
                <div className="flex flex-1">
                    <Sidebar onLogout={handleLogout} />
                    <main className="flex-1 p-8">
                        <p className="text-red-500">{error}</p>
                    </main>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col min-h-screen font-poppins bg-black text-white">
                <Header />
                <div className="flex flex-1">
                    <Sidebar onLogout={handleLogout} />
                    <main className="flex-1 p-8">
                        <p>Loading...</p>
                    </main>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/api/profile`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setProfile(res.data);
            if (res.data.profilePicture) {
                if (!safeSetItem("profilePicture", res.data.profilePicture)) {
                    console.warn("Unable to cache profile picture");
                }
            }
            setEditing(false);
        } catch (err) {
            console.error(err);
            setError("Failed to save profile");
        }
    };

    return (
        <div className="flex flex-col min-h-screen font-poppins bg-black text-white">
            <Header />
            <div className="flex flex-1 relative gap-6">
                <Sidebar onLogout={handleLogout} />
                <main className="flex-1 p-8">
                    <h1 className="text-3xl font-bold mb-6">Account Details</h1>
                    {editing ? (
                        <div className="space-y-2">
                    <p><strong>Username:</strong> {profile.username}</p>
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="legalBusinessName"
                        value={formData.legalBusinessName || ""}
                        onChange={handleChange}
                        placeholder="Legal Business Name"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        placeholder="Name"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="countryOfIncorporation"
                        value={formData.countryOfIncorporation || ""}
                        onChange={handleChange}
                        placeholder="Country of Incorporation"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="taxId"
                        value={formData.taxId || ""}
                        onChange={handleChange}
                        placeholder="Tax ID"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="companyRegistrationNumber"
                        value={formData.companyRegistrationNumber || ""}
                        onChange={handleChange}
                        placeholder="Company Registration Number"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="primaryContactName"
                        value={formData.primaryContactName || ""}
                        onChange={handleChange}
                        placeholder="Primary Contact Name"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="primaryContactEmail"
                        value={formData.primaryContactEmail || ""}
                        onChange={handleChange}
                        placeholder="Primary Contact Email"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="primaryContactPhone"
                        value={formData.primaryContactPhone || ""}
                        onChange={handleChange}
                        placeholder="Primary Contact Phone"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="technicalContactName"
                        value={formData.technicalContactName || ""}
                        onChange={handleChange}
                        placeholder="Technical Contact Name"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="technicalContactEmail"
                        value={formData.technicalContactEmail || ""}
                        onChange={handleChange}
                        placeholder="Technical Contact Email"
                    />
                    <input
                        className="w-full p-2 bg-gray-800 rounded"
                        name="technicalContactPhone"
                        value={formData.technicalContactPhone || ""}
                        onChange={handleChange}
                        placeholder="Technical Contact Phone"
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setFormData({ ...formData, profilePicture: reader.result });
                            };
                            reader.readAsDataURL(file);
                        }}
                        className="w-full p-2 bg-gray-800 rounded"
                    />
                    {formData.profilePicture && (
                        <img src={formData.profilePicture} alt="Preview" className="h-20 w-20 rounded-full" />
                    )}
                    <textarea
                        className="w-full p-2 bg-gray-800 rounded"
                        name="companyDescription"
                        value={formData.companyDescription || ""}
                        onChange={handleChange}
                        placeholder="Company Description"
                    />
                    <div className="space-x-2 mt-4">
                        <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setEditing(false);
                                setFormData(profile);
                            }}
                            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    <p><strong>Username:</strong> {profile.username}</p>
                    <p><strong>Legal Business Name:</strong> {profile.legalBusinessName}</p>
                    <p><strong>Name:</strong> {profile.name}</p>
                    <p><strong>Country of Incorporation:</strong> {profile.countryOfIncorporation}</p>
                    <p><strong>Tax ID:</strong> {profile.taxId}</p>
                    <p><strong>Company Registration Number:</strong> {profile.companyRegistrationNumber}</p>
                    <p><strong>Primary Contact Name:</strong> {profile.primaryContactName}</p>
                    <p><strong>Primary Contact Email:</strong> {profile.primaryContactEmail}</p>
                    <p><strong>Primary Contact Phone:</strong> {profile.primaryContactPhone}</p>
                    <p><strong>Technical Contact Name:</strong> {profile.technicalContactName}</p>
                    <p><strong>Technical Contact Email:</strong> {profile.technicalContactEmail}</p>
                    <p><strong>Technical Contact Phone:</strong> {profile.technicalContactPhone}</p>
                    <p><strong>Company Description:</strong> {profile.companyDescription}</p>
                    {profile.profilePicture && (
                        <img src={profile.profilePicture} alt="Profile" className="h-20 w-20 rounded-full" />
                    )}
                    <button
                        onClick={() => setEditing(true)}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                    >
                        Edit
                    </button>
                </div>
            )}
                </main>
            </div>
        </div>
    );
};

export default Account;
