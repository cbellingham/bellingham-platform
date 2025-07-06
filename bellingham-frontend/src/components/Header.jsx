import React, { useEffect, useState } from "react";
import axios from "axios";

import logoImage from "../assets/login.png";

const Header = () => {
    const username = localStorage.getItem("username");
    const [picture, setPicture] = useState(localStorage.getItem("profilePicture") || "");

    useEffect(() => {
        const fetchProfilePic = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/profile`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPicture(res.data.profilePicture || "");
            } catch (e) {
                console.error(e);
            }
        };
        fetchProfilePic();
    }, []);

    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <img
                    src={logoImage}
                    alt="Bellingham Data Futures logo"
                    className="h-[150px] w-[150px]"
                />
            </div>
            {username && (
                <div className="flex items-center gap-2 text-white text-sm">
                    {picture && (
                        <img src={picture} alt="Profile" className="h-8 w-8 rounded-full" />
                    )}
                    <span>Logged in as: {username}</span>
                </div>
            )}
        </header>
    );
};

export default Header;
