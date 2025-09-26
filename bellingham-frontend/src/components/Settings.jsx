import React, { useContext } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context';

const Settings = () => {
    const navigate = useNavigate();

    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const settings = [
        {
            title: "Notification Preferences",
            description: "Control which trade alerts and operational updates are delivered to you and your team.",
        },
        {
            title: "Security",
            description: "Manage credential rotation, multi-factor authentication, and API access tokens.",
        },
        {
            title: "Integrations",
            description: "Configure downstream systems that consume executed trades or compliance reports.",
        },
    ];

    return (
        <Layout onLogout={handleLogout}>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Configuration</p>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-sm text-slate-400">
                        Tailor the platform to your institution’s policies. Modules below will be populated as features are rolled out.
                    </p>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {settings.map((item) => (
                        <div key={item.title} className="rounded-xl border border-slate-800/80 bg-slate-950/50 px-4 py-3">
                            <p className="text-base font-semibold text-white">{item.title}</p>
                            <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                        </div>
                    ))}
                    <div className="md:col-span-2 rounded-xl border border-dashed border-slate-700/60 bg-slate-950/40 px-4 py-6 text-sm text-slate-400">
                        Additional configuration options will appear here as new services come online.
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Settings;
