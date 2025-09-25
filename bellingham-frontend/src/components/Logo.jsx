import React from "react";
import logoImage from "../assets/login.png";

const Logo = () => {
    const isLogin = window.location.pathname === "/login";
    const style = isLogin ? { right: "calc(1rem + 10px)" } : {};
    const sizeClass = isLogin
        ? "h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
        : "h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9";
    const positionClass = isLogin ? "bottom-5 right-5" : "bottom-3 right-3";

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
