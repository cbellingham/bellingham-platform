import React, { useEffect, useState } from "react";
import Button from "./ui/Button";

const AgreementEditorModal = ({ initialValue, onSave, onCancel }) => {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    const handleSave = () => {
        onSave(value);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
            <div className="w-full max-w-3xl rounded-lg bg-gray-900 p-6 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Edit agreement terms</h2>
                <textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="h-80 w-full rounded border border-gray-700 bg-gray-800 p-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="mt-4 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="button" variant="success" onClick={handleSave}>
                        Save changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AgreementEditorModal;
