import React from "react";
import logoImage from "../assets/login.png";

const Logo = () => {
    const isLogin = window.location.pathname === "/login";
    const style = isLogin ? { right: "calc(1rem + 10px)" } : {};
    const sizeClass = isLogin
        ? "h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
        : "h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14";
    const positionClass = isLogin ? "bottom-6 right-6" : "bottom-4 right-4";

    return (
        <img
            src={logoImage}
            alt="Bellingham Data Futures logo"
            className={`fixed ${positionClass} ${sizeClass} pointer-events-none rounded-xl object-contain drop-shadow-lg`}
            style={style}
        />
    );
};

export default Logo;
