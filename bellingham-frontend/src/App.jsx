import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Buy from "./components/Buy";
import Sell from "./components/Sell";
import Reports from "./components/Reports";

const App = () => {
    const token = localStorage.getItem("token");

    return (
        <Routes>
            <Route
                path="/"
                element={token ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route path="/login" element={<Login />} />
            <Route
                path="/buy"
                element={token ? <Buy /> : <Navigate to="/login" />}
            />
            <Route
                path="/sell"
                element={token ? <Sell /> : <Navigate to="/login" />}
            />
            <Route
                path="/reports"
                element={token ? <Reports /> : <Navigate to="/login" />}
            />
        </Routes>
    );
};

export default App;
