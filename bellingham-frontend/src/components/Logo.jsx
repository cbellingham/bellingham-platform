import React from "react";
import logoImage from "../assets/login.png";

const Logo = () => {
    const style =
        window.location.pathname === "/login"
            ? { right: "calc(1rem + 10px)" }
            : {};

    return (
        <img
            src={logoImage}
            alt="Logo"
            className="fixed bottom-4 right-4 w-24 h-24 pointer-events-none"
            style={style}
        />
    );
};

export default Logo;
