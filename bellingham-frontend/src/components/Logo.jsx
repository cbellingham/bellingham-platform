import React from "react";
import logoImage from "../assets/login.png";

const Logo = () => {
    const isLogin = window.location.pathname === "/login";
    const style = isLogin ? { right: "calc(1rem + 10px)" } : {};
    const sizeClass = isLogin ? "w-[150px] h-[150px]" : "w-[180px] h-[180px]";

    return (
        <img
            src={logoImage}
            alt="Logo"
            className={`fixed bottom-4 right-4 ${sizeClass} pointer-events-none`}
            style={style}
        />
    );
};

export default Logo;
