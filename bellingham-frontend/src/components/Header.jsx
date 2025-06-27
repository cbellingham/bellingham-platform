import React from "react";

const Header = () => {
    const username = localStorage.getItem("username");
    return (
        <header className="bg-gray-800 p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Bellingham Data Futures</h1>
            {username && (
                <span className="text-sm text-white">Logged in as: {username}</span>
            )}
        </header>
    );
};

export default Header;
