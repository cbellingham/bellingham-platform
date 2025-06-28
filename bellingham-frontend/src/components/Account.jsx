import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "./Header";
import { useNavigate } from "react-router-dom";

const Account = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const navigate = useNavigate();

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
            } catch (err) {
                console.error(err);
                setError("Failed to load profile");
            }
        };
        fetchProfile();
    }, [navigate]);

    if (error) {
        return (
            <div className="p-8 bg-black min-h-screen text-white font-poppins">
                <Header />
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="p-8 bg-black min-h-screen text-white font-poppins">
                <Header />
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="p-8 bg-black min-h-screen text-white font-poppins">
            <Header />
            <h1 className="text-3xl font-bold mb-6">Account Details</h1>
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
            </div>
        </div>
    );
};

export default Account;
