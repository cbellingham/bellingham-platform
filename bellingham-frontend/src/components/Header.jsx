import React from "react";

import logoImage from "../assets/login.png";

const Header = () => {
    const username = localStorage.getItem("username");

    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center gap-4">
                <img
                    src={logoImage}
                    alt="Bellingham Data Futures logo"
                    className="h-[150px] w-[150px]"
                />
            </div>
            {username && (
                <div className="flex items-center gap-2 text-white text-sm">
                    <span>Logged in as: {username}</span>
                </div>
            )}
        </header>
    );
};

export default Header;
