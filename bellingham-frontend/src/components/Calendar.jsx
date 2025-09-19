import React, { useEffect, useState, useContext } from "react";
import Calendar from "react-calendar";
import "./CalendarOverrides.css";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from '../context';

const TYPE_INFO = {
    "Bought": { color: "bg-emerald-400", initial: "B" },
    "Ends": { color: "bg-amber-400", initial: "E" }
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
        if (view === 'month') {
            const key = date.toISOString().split('T')[0];
            const events = eventsByDate[key];
            if (events && events.length > 0) {
                const uniqueTypes = Array.from(new Set(events.map((ev) => ev.type)));
                return (
                    <div className="flex justify-center mt-1 space-x-1">
                        {uniqueTypes.map((type) => (
                            <span
                                key={type}
                                className={`w-2 h-2 rounded-full ${TYPE_INFO[type]?.color ?? "bg-slate-400"}`}
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
        if (view === 'month') {
            const key = date.toISOString().split('T')[0];
            if (eventsByDate[key]?.length) {
                return 'calendar-has-event';
            }
        }
        return null;
    };

    const formattedSelected = selectedDate.toISOString().split('T')[0];
    const events = eventsByDate[formattedSelected] || [];

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Layout onLogout={handleLogout}>
            <main className="flex-1 p-8 overflow-auto">
                <h1 className="text-3xl font-bold mb-6">Contract Calendar</h1>
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    tileContent={tileContent}
                    tileClassName={tileClassName}
                />
                <div className="mt-4 flex items-center space-x-4 text-sm text-gray-300">
                    {Object.entries(TYPE_INFO).map(([type, info]) => (
                        <div key={type} className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${info.color}`} aria-hidden="true" />
                            <span>{type}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Events on {formattedSelected}</h2>
                    {events.length === 0 && <p>No events.</p>}
                    <ul className="space-y-1">
                        {events.map((ev, idx) => (
                            <li key={idx} className="text-sm flex items-center space-x-2">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[0.6rem] font-semibold text-gray-900 ${TYPE_INFO[ev.type]?.color ?? 'bg-slate-400'}`}>
                                    {TYPE_INFO[ev.type]?.initial ?? '?'}
                                </span>
                                <span className="text-gray-200">{ev.type}:</span>
                                <span className="text-gray-100">{ev.title}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </main>
        </Layout>
    );
};

export default ContractCalendar;
