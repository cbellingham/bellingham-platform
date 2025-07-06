import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import axios from "axios";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useNavigate } from "react-router-dom";

const ContractCalendar = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/contracts/purchased`,
                    config
                );
                setContracts(res.data);
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
                return <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full mx-auto"/>;
            }
        }
        return null;
    };

    const formattedSelected = selectedDate.toISOString().split('T')[0];
    const events = eventsByDate[formattedSelected] || [];

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("profilePicture");
        navigate("/login");
    };

    return (
        <div className="flex flex-col min-h-screen font-poppins bg-black text-white">
            <Header />
            <div className="flex flex-1 gap-6 relative">
                <Sidebar onLogout={handleLogout} />
                <main className="flex-1 p-8 overflow-auto">
                    <h1 className="text-3xl font-bold mb-6">Contract Calendar</h1>
                    <Calendar
                        onChange={setSelectedDate}
                        value={selectedDate}
                        tileContent={tileContent}
                    />
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold mb-2">Events on {formattedSelected}</h2>
                        {events.length === 0 && <p>No events.</p>}
                        <ul className="space-y-1">
                            {events.map((ev, idx) => (
                                <li key={idx} className="text-sm">
                                    {ev.type}: {ev.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ContractCalendar;
