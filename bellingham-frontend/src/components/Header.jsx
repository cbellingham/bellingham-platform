import React from "react";
import logoImage from "../assets/login.png";

const Header = () => {
    const username = localStorage.getItem("username");
    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center">
            <img
                src={logoImage}
                alt="Bellingham Data Futures logo"
                className="h-[150px] w-[150px]"
            />
            {username && (
                <span className="text-sm text-white">Logged in as: {username}</span>
            )}
        </header>
    );
};

export default Header;
