import React, { useEffect, useState, useContext } from "react";
import Calendar from "react-calendar";
import "./CalendarOverrides.css";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from '../context';

const TYPE_INFO = {
    Bought: { color: "bg-[#00D1FF]", initial: "B" },
    Ends: { color: "bg-[#FF4D9B]", initial: "E" },
};

const ContractCalendar = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const { logout } = useContext(AuthContext);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const res = await api.get(`/api/contracts/purchased`);
                setContracts(res.data.content);
            } catch (err) {
                console.error(err);
                navigate("/login");
            }
        };
        fetchContracts();
    }, [navigate]);

    const eventsByDate = contracts.reduce((acc, contract) => {
        if (contract.purchaseDate) {
            const key = contract.purchaseDate;
            if (!acc[key]) acc[key] = [];
            acc[key].push({ type: "Bought", title: contract.title });
        }
        if (contract.deliveryDate) {
            const key = contract.deliveryDate;
            if (!acc[key]) acc[key] = [];
            acc[key].push({ type: "Ends", title: contract.title });
        }
        return acc;
    }, {});

    const tileContent = ({ date, view }) => {
        if (view === "month") {
            const key = date.toISOString().split("T")[0];
            const events = eventsByDate[key];
            if (events && events.length > 0) {
                const uniqueTypes = Array.from(new Set(events.map((ev) => ev.type)));
                return (
                    <div className="mt-1 flex justify-center space-x-1">
                        {uniqueTypes.map((type) => (
                            <span
                                key={type}
                                className={`h-2 w-2 rounded-full ${TYPE_INFO[type]?.color ?? "bg-slate-400"}`}
                                aria-hidden="true"
                            />
                        ))}
                    </div>
                );
            }
        }
        return null;
    };

    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            const key = date.toISOString().split("T")[0];
            if (eventsByDate[key]?.length) {
                return "calendar-has-event";
            }
        }
        return null;
    };

    const formattedSelected = selectedDate.toISOString().split("T")[0];
    const events = eventsByDate[formattedSelected] || [];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Layout onLogout={handleLogout}>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Operations</p>
                    <h1 className="text-3xl font-bold text-white">Contract Calendar</h1>
                    <p className="text-sm text-slate-400">
                        Visualise purchase and delivery events to plan workloads, handovers, and client communications.
                    </p>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]">
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate}
                            tileContent={tileContent}
                            tileClassName={tileClassName}
                        />
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                            {Object.entries(TYPE_INFO).map(([type, info]) => (
                                <div key={type} className="flex items-center gap-2">
                                    <span className={`h-3 w-3 rounded-full ${info.color}`} aria-hidden="true" />
                                    <span>{type}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
                        <h2 className="text-lg font-semibold text-white">Events on {formattedSelected}</h2>
                        {events.length === 0 ? (
                            <p className="mt-3 text-sm text-slate-400">No scheduled milestones for this date.</p>
                        ) : (
                            <ul className="mt-3 space-y-2 text-sm">
                                {events.map((ev, idx) => (
                                    <li key={`${ev.title}-${idx}`} className="flex items-center gap-2">
                                        <span
                                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-semibold text-slate-900 ${TYPE_INFO[ev.type]?.color ?? "bg-slate-400"}`}
                                        >
                                            {TYPE_INFO[ev.type]?.initial ?? "?"}
                                        </span>
                                        <span className="text-slate-200">{ev.type}:</span>
                                        <span className="font-semibold text-white">{ev.title}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ContractCalendar;
