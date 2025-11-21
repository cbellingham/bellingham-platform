import React from "react";
import logoMark from "../assets/logo.svg";

const Logo = ({ size = 56, style, className = "", ...props }) => (
    <img
        src={logoMark}
        alt="Bellingham Data Futures logo"
        width={size}
        height={size}
        loading="lazy"
        className={className}
        style={{ display: "block", width: size, height: size, ...style }}
        {...props}
    />
);

export default Logo;
