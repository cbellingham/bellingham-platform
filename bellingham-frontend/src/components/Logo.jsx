import React from "react";
import logoImage from "../assets/login.png";

const Logo = () => {
    const isLogin = window.location.pathname === "/login";
    const style = isLogin ? { right: "calc(1rem + 10px)" } : {};
    const sizeClass = isLogin
        ? "h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20"
        : "h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12";
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
