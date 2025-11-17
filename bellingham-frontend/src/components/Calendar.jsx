import React, { useEffect, useMemo, useState, useContext } from "react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context";

const palette = {
    slate50: "#f8fafc",
    slate200: "#e2e8f0",
    slate300: "#cbd5f5",
    slate400: "#94a3b8",
    slate800: "#1e293b",
    slate950: "#020617",
};

const TYPE_INFO = {
    Bought: { label: "Bought", color: "#00D1FF", initial: "B" },
    Ends: { label: "Ends", color: "#7465A8", initial: "E" },
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const styles = {
    section: {
        borderRadius: "1rem",
        border: `1px solid ${palette.slate800}`,
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        padding: "1.5rem",
        boxShadow: "0 20px 45px rgba(2, 12, 32, 0.55)",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
    },
    header: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        borderBottom: `1px solid ${palette.slate800}`,
        paddingBottom: "1rem",
    },
    heroLabel: {
        fontSize: "0.75rem",
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        color: "rgba(0, 209, 255, 0.8)",
        fontWeight: 600,
    },
    heroTitle: {
        fontSize: "1.875rem",
        fontWeight: 700,
        color: palette.slate50,
    },
    heroDescription: {
        fontSize: "0.875rem",
        color: palette.slate400,
        lineHeight: 1.5,
    },
    grid: {
        display: "grid",
        gap: "1.5rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    },
    panel: {
        borderRadius: "0.75rem",
        border: "1px solid rgba(30, 41, 59, 0.8)",
        backgroundColor: "rgba(2, 6, 23, 0.5)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    navBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
    },
    navButtonGroup: {
        display: "flex",
        gap: "0.5rem",
        flexWrap: "wrap",
    },
    navButton: {
        backgroundColor: "rgba(15, 23, 42, 0.85)",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: "0.5rem",
        padding: "0.35rem 0.85rem",
        color: palette.slate200,
        fontWeight: 600,
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "background-color 0.2s ease, border-color 0.2s ease",
    },
    monthLabel: {
        color: palette.slate50,
        fontSize: "1rem",
        fontWeight: 600,
    },
    weekdayRow: {
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        fontSize: "0.75rem",
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        color: palette.slate400,
    },
    weekdayCell: {
        textAlign: "center",
        paddingBottom: "0.35rem",
    },
    dayGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
        gap: "0.4rem",
    },
    dayNumber: {
        fontSize: "0.9rem",
        fontWeight: 600,
    },
    indicatorRow: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.35rem",
        marginTop: "0.35rem",
    },
    indicatorDot: {
        width: "0.4rem",
        height: "0.4rem",
        borderRadius: "999px",
    },
    legendRow: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "1rem",
        color: palette.slate200,
        fontSize: "0.875rem",
    },
    legendItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    legendDot: {
        width: "0.75rem",
        height: "0.75rem",
        borderRadius: "999px",
    },
    eventsPanel: {
        borderRadius: "0.75rem",
        border: "1px solid rgba(30, 41, 59, 0.8)",
        backgroundColor: "rgba(2, 6, 23, 0.5)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    eventsTitle: {
        fontSize: "1.125rem",
        fontWeight: 600,
        color: palette.slate50,
    },
    eventsEmpty: {
        fontSize: "0.875rem",
        color: palette.slate400,
    },
    eventsList: {
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    eventRow: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.9rem",
        color: palette.slate200,
    },
    eventBadge: {
        width: "1.5rem",
        height: "1.5rem",
        borderRadius: "999px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.65rem",
        fontWeight: 600,
        color: palette.slate950,
    },
    eventLabel: {
        color: palette.slate300,
    },
    eventTitle: {
        fontWeight: 600,
        color: palette.slate50,
    },
};

const addDays = (date, amount) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);

const isSameDay = (first, second) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate();

const buildCalendarMatrix = (referenceDate) => {
    const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const startOffset = startOfMonth.getDay();
    const calendarStart = addDays(startOfMonth, -startOffset);

    const days = Array.from({ length: 42 }, (_, index) => addDays(calendarStart, index));
    const weeks = [];

    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return weeks;
};

const getDayButtonStyles = ({ isCurrentMonth, isSelected, isToday, hasEvents }) => {
    const base = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "0.75rem",
        border: "1px solid transparent",
        padding: "0.65rem 0.25rem",
        minHeight: "3.5rem",
        fontFamily: "inherit",
        fontSize: "0.85rem",
        cursor: "pointer",
        backgroundColor: "transparent",
        color: isCurrentMonth ? palette.slate200 : "rgba(148, 163, 184, 0.5)",
        transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease",
        outline: "none",
    };

    if (isSelected) {
        base.backgroundColor = "#2563eb";
        base.borderColor = "#1d4ed8";
        base.color = palette.slate50;
        base.boxShadow = "0 12px 28px rgba(37, 99, 235, 0.35)";
    } else if (isToday) {
        base.borderColor = "rgba(37, 99, 235, 0.4)";
        base.backgroundColor = "rgba(37, 99, 235, 0.15)";
    } else if (hasEvents) {
        base.borderColor = "rgba(148, 163, 184, 0.35)";
        base.backgroundColor = "rgba(15, 23, 42, 0.4)";
    }

    return base;
};

const ContractCalendar = () => {
    const navigate = useNavigate();
    const [contracts, setContracts] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => new Date());
    const [currentMonth, setCurrentMonth] = useState(() => new Date());

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

    const eventsByDate = useMemo(() => {
        return contracts.reduce((acc, contract) => {
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
    }, [contracts]);

    const formattedSelected = selectedDate.toISOString().split("T")[0];
    const events = eventsByDate[formattedSelected] || [];

    const calendarWeeks = useMemo(() => buildCalendarMatrix(currentMonth), [currentMonth]);
    const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(currentMonth);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSelectDate = (date) => {
        setSelectedDate(date);
        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    };

    const goToPrevMonth = () => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        setSelectedDate(today);
    };

    return (
        <Layout onLogout={handleLogout}>
            <section style={styles.section}>
                <div style={styles.content}>
                    <div style={styles.header}>
                        <p style={styles.heroLabel}>Operations</p>
                        <h1 style={styles.heroTitle}>Contract Calendar</h1>
                        <p style={styles.heroDescription}>
                            Visualise purchase and delivery events to plan workloads, handovers, and client communications.
                        </p>
                    </div>
                    <div style={styles.grid}>
                        <div style={styles.panel}>
                            <div style={styles.navBar}>
                                <span style={styles.monthLabel}>{monthLabel}</span>
                                <div style={styles.navButtonGroup}>
                                    <button
                                        type="button"
                                        style={styles.navButton}
                                        onClick={goToPrevMonth}
                                        aria-label="Go to previous month"
                                    >
                                        Prev
                                    </button>
                                    <button
                                        type="button"
                                        style={styles.navButton}
                                        onClick={goToToday}
                                        aria-label="Jump to today"
                                    >
                                        Today
                                    </button>
                                    <button
                                        type="button"
                                        style={styles.navButton}
                                        onClick={goToNextMonth}
                                        aria-label="Go to next month"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                            <div style={styles.weekdayRow}>
                                {WEEKDAY_LABELS.map((weekday) => (
                                    <div key={weekday} style={styles.weekdayCell}>
                                        {weekday}
                                    </div>
                                ))}
                            </div>
                            <div style={styles.dayGrid}>
                                {calendarWeeks.flat().map((day) => {
                                    const key = day.toISOString().split("T")[0];
                                    const eventsForDay = eventsByDate[key] || [];
                                    const uniqueTypes = Array.from(new Set(eventsForDay.map((ev) => ev.type)));
                                    const hasEvents = uniqueTypes.length > 0;
                                    const selected = isSameDay(day, selectedDate);
                                    const today = isSameDay(day, new Date());
                                    const currentMonthDay = day.getMonth() === currentMonth.getMonth();

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            style={getDayButtonStyles({
                                                isCurrentMonth: currentMonthDay,
                                                isSelected: selected,
                                                isToday: today,
                                                hasEvents,
                                            })}
                                            onClick={() => handleSelectDate(day)}
                                            aria-pressed={selected}
                                            aria-label={`Events on ${day.toDateString()}`}
                                        >
                                            <span style={styles.dayNumber}>{day.getDate()}</span>
                                            {hasEvents && (
                                                <div style={styles.indicatorRow}>
                                                    {uniqueTypes.map((type) => (
                                                        <span
                                                            key={`${key}-${type}`}
                                                            style={{
                                                                ...styles.indicatorDot,
                                                                backgroundColor: TYPE_INFO[type]?.color || palette.slate400,
                                                            }}
                                                            aria-hidden="true"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            <div style={styles.legendRow}>
                                {Object.entries(TYPE_INFO).map(([type, info]) => (
                                    <div key={type} style={styles.legendItem}>
                                        <span
                                            style={{
                                                ...styles.legendDot,
                                                backgroundColor: info.color,
                                            }}
                                            aria-hidden="true"
                                        />
                                        <span>{info.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={styles.eventsPanel}>
                            <h2 style={styles.eventsTitle}>Events on {formattedSelected}</h2>
                            {events.length === 0 ? (
                                <p style={styles.eventsEmpty}>No scheduled milestones for this date.</p>
                            ) : (
                                <ul style={styles.eventsList}>
                                    {events.map((event, index) => (
                                        <li key={`${event.title}-${index}`} style={styles.eventRow}>
                                            <span
                                                style={{
                                                    ...styles.eventBadge,
                                                    backgroundColor: TYPE_INFO[event.type]?.color || palette.slate400,
                                                }}
                                            >
                                                {TYPE_INFO[event.type]?.initial || "?"}
                                            </span>
                                            <span style={styles.eventLabel}>{event.type}:</span>
                                            <span style={styles.eventTitle}>{event.title}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default ContractCalendar;
