import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Buy from "./components/Buy";
import Sell from "./components/Sell";
import Reports from "./components/Reports";
import Sales from "./components/Sales";
import Calendar from "./components/Calendar";
import Signup from "./components/Signup";
import Account from "./components/Account";
import Settings from "./components/Settings";
import History from "./components/History";
import Logo from "./components/Logo";
import { AuthContext } from "./context/AuthContext";

const App = () => {
    const { token } = useContext(AuthContext);

    return (
        <>
        <Routes>
            <Route
                path="/"
                element={token ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
            <Route
                path="/sales"
                element={token ? <Sales /> : <Navigate to="/login" />}
            />
            <Route
                path="/calendar"
                element={token ? <Calendar /> : <Navigate to="/login" />}
            />
            <Route
                path="/settings"
                element={token ? <Settings /> : <Navigate to="/login" />}
            />
            <Route
                path="/account"
                element={token ? <Account /> : <Navigate to="/login" />}
            />
            <Route
                path="/history"
                element={token ? <History /> : <Navigate to="/login" />}
            />
        </Routes>
        <Logo />
        </>
    );
};

export default App;
