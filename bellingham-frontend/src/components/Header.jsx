import React from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/login.png";

const Header = () => {
    const username = localStorage.getItem("username");
    const navigate = useNavigate();

    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
                >
                    Back
                </button>
                <img
                    src={logoImage}
                    alt="Bellingham Data Futures logo"
                    className="h-[150px] w-[150px]"
                />
            </div>
            {username && (
                <span className="text-sm text-white">Logged in as: {username}</span>
            )}
        </header>
    );
};

export default Header;
