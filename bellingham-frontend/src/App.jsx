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
import Notifications from "./components/Notifications";
import { AuthContext } from './context';

const App = () => {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <>
        <Routes>
            <Route
                path="/"
                element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                path="/buy"
                element={isAuthenticated ? <Buy /> : <Navigate to="/login" />}
            />
            <Route
                path="/sell"
                element={isAuthenticated ? <Sell /> : <Navigate to="/login" />}
            />
            <Route
                path="/reports"
                element={isAuthenticated ? <Reports /> : <Navigate to="/login" />}
            />
            <Route
                path="/sales"
                element={isAuthenticated ? <Sales /> : <Navigate to="/login" />}
            />
            <Route
                path="/calendar"
                element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />}
            />
            <Route
                path="/settings"
                element={isAuthenticated ? <Settings /> : <Navigate to="/login" />}
            />
            <Route
                path="/account"
                element={isAuthenticated ? <Account /> : <Navigate to="/login" />}
            />
            <Route
                path="/history"
                element={isAuthenticated ? <History /> : <Navigate to="/login" />}
            />
            <Route
                path="/notifications"
                element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />}
            />
        </Routes>
        <Logo />
        </>
    );
};

export default App;
