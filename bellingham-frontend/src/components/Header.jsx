import React, { useContext } from "react";
import { Link } from "react-router-dom";

import logoImage from "../assets/login.png";
import { AuthContext } from '../context';

const Header = () => {
    const { username } = useContext(AuthContext);

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
                <div className="flex items-center gap-3 text-white text-sm">
                    <Link
                        to="/notifications"
                        className="rounded bg-green-600 px-3 py-1 font-semibold text-white transition-colors hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
                    >
                        Notifications
                    </Link>
                    <span>Logged in as: {username}</span>
                </div>
            )}
        </header>
    );
};

export default Header;
