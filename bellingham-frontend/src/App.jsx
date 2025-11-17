import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Buy from "./components/Buy";
import Sell from "./components/Sell";
import Reports from "./components/Reports";
import Sales from "./components/Sales";
import ContractCalendar from "./components/Calendar";
import Signup from "./components/Signup";
import Account from "./components/Account";
import Settings from "./components/Settings";
import History from "./components/History";
import Logo from "./components/Logo";
import Notifications from "./components/Notifications";
import AdminUserAccess from "./components/AdminUserAccess";
import Layout from "./components/Layout";
import { AuthContext } from './context';

const App = () => {
    const { isAuthenticated, permissions, role, profile, isProfileLoading } = useContext(AuthContext);

    const renderGuarded = (Component, options = {}) => {
        if (!isAuthenticated) {
            return <Navigate to="/login" />;
        }

        if (!profile && isProfileLoading) {
            return (
                <Layout>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                        Checking your access…
                    </div>
                </Layout>
            );
        }

        if (options.requiresRole && role !== options.requiresRole) {
            return <Navigate to="/" />;
        }

        if (options.requiresPermission && !permissions.includes(options.requiresPermission)) {
            return <Navigate to="/" />;
        }

        return <Component />;
    };

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
                element={renderGuarded(Buy)}
            />
            <Route
                path="/sell"
                element={renderGuarded(Sell, { requiresPermission: "SELL" })}
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
                element={isAuthenticated ? <ContractCalendar /> : <Navigate to="/login" />}
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
            <Route
                path="/admin/users"
                element={renderGuarded(AdminUserAccess, { requiresRole: "ROLE_ADMIN" })}
            />
        </Routes>
        <Logo />
        </>
    );
};

export default App;
