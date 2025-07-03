import React from "react";
import logoImage from "../assets/login.png";

const Logo = () => (
    <img
        src={logoImage}
        alt="Logo"
        className="fixed bottom-4 right-4 w-24 h-24 pointer-events-none"
    />
);

export default Logo;
