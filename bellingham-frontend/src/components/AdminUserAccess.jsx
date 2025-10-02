import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import Button from "./ui/Button";
import api from "../utils/api";
import { AuthContext } from "../context";

const PERMISSION_OPTIONS = [
    { key: "BUY", label: "Buy" },
    { key: "SELL", label: "Sell" },
];

const createRow = (user) => {
    const original = new Set(user.permissions ?? []);
    return {
        id: user.id,
        username: user.username,
        role: user.role,
        permissions: new Set(original),
        originalPermissions: original,
    };
};

const setsAreEqual = (a, b) => {
    if (a.size !== b.size) {
        return false;
    }
    for (const value of a) {
        if (!b.has(value)) {
            return false;
        }
    }
    return true;
};

const AdminUserAccess = () => {
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [banner, setBanner] = useState(null);
    const [saving, setSaving] = useState({});

    const handleLogout = useCallback(() => {
        logout();
        navigate("/login");
    }, [logout, navigate]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setLoadError("");
        try {
            const res = await api.get("/api/admin/users");
            const data = Array.isArray(res.data) ? res.data : [];
            setRows(data.map(createRow));
        } catch (error) {
            console.error("Failed to load users", error);
            setLoadError("Unable to load user permissions. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const togglePermission = (userId, permission) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.id !== userId) {
                    return row;
                }
                const nextPermissions = new Set(row.permissions);
                if (nextPermissions.has(permission)) {
                    nextPermissions.delete(permission);
                } else {
                    nextPermissions.add(permission);
                }
                return { ...row, permissions: nextPermissions };
            })
        );
        setBanner(null);
    };

    const handleSave = async (userId) => {
        const row = rows.find((r) => r.id === userId);
        if (!row) {
            return;
        }
        setSaving((prev) => ({ ...prev, [userId]: true }));
        setBanner(null);
        try {
            const res = await api.put(`/api/admin/users/${userId}/permissions`, {
                permissions: Array.from(row.permissions),
            });
            const updated = createRow(res.data);
            setRows((prev) => prev.map((existing) => (existing.id === userId ? updated : existing)));
            setBanner({ type: "success", message: `Updated access for ${updated.username}.` });
        } catch (error) {
            console.error("Failed to update permissions", error);
            const message = error?.response?.data?.message || "Unable to update permissions for this user.";
            setBanner({ type: "error", message });
        } finally {
            setSaving((prev) => ({ ...prev, [userId]: false }));
        }
    };

    const loadingContent = (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-sm text-slate-300 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
            Loading user permissions…
        </div>
    );

    const errorContent = (
        <div className="rounded-2xl border border-red-500/40 bg-red-900/20 p-6 text-sm text-red-200 shadow-[0_20px_45px_rgba(64,0,0,0.45)]">
            {loadError}
        </div>
    );

    const bannerContent = useMemo(() => {
        if (!banner) {
            return null;
        }
        const baseClasses = "rounded-xl border px-4 py-3 text-sm";
        const styles =
            banner.type === "success"
                ? "border-emerald-500/40 bg-emerald-900/20 text-emerald-200"
                : "border-red-500/40 bg-red-900/20 text-red-200";
        return (
            <div role="status" className={`${baseClasses} ${styles}`}>
                {banner.message}
            </div>
        );
    }, [banner]);

    return (
        <Layout onLogout={handleLogout}>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-[0_20px_45px_rgba(2,12,32,0.55)]">
                <div className="space-y-6">
                    <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#00D1FF]/80">Administration</p>
                        <h1 className="text-3xl font-bold text-white">User Marketplace Access</h1>
                        <p className="text-sm text-slate-400">
                            Grant or revoke marketplace actions for any participant. Changes apply immediately after saving.
                        </p>
                    </div>

                    {bannerContent}

                    {loading && loadingContent}
                    {!loading && loadError && errorContent}

                    {!loading && !loadError && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
                                <thead className="bg-slate-900/50 text-xs uppercase tracking-[0.2em] text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">User</th>
                                        <th scope="col" className="px-4 py-3">Role</th>
                                        {PERMISSION_OPTIONS.map((option) => (
                                            <th key={option.key} scope="col" className="px-4 py-3 text-center">
                                                {option.label} Access
                                            </th>
                                        ))}
                                        <th scope="col" className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/70">
                                    {rows.map((row) => {
                                        const pending = saving[row.id];
                                        const hasChanges = !setsAreEqual(row.permissions, row.originalPermissions);
                                        return (
                                            <tr key={row.id} className="bg-slate-950/40">
                                                <td className="px-4 py-3 font-semibold text-white">{row.username}</td>
                                                <td className="px-4 py-3 text-slate-300">{row.role?.replace("ROLE_", "") || ""}</td>
                                                {PERMISSION_OPTIONS.map((option) => (
                                                    <td key={option.key} className="px-4 py-3 text-center">
                                                        <label className="inline-flex items-center gap-2 text-slate-200">
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[#00D1FF] focus:ring-[#00D1FF]"
                                                                checked={row.permissions.has(option.key)}
                                                                onChange={() => togglePermission(row.id, option.key)}
                                                            />
                                                            <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                                                {option.label}
                                                            </span>
                                                        </label>
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3 text-center">
                                                    <Button
                                                        variant="primary"
                                                        className="text-xs uppercase tracking-[0.24em]"
                                                        isLoading={Boolean(pending)}
                                                        disabled={!hasChanges}
                                                        onClick={() => handleSave(row.id)}
                                                    >
                                                        Save
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

export default AdminUserAccess;
