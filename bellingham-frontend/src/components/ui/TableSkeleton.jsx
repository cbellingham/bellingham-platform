import React from "react";

const widths = ["w-3/4", "w-2/3", "w-1/2", "w-5/6", "w-1/3"];

const TableSkeleton = ({ columns = 4, rows = 5 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr
                    key={`skeleton-row-${rowIndex}`}
                    className="animate-pulse bg-slate-950/30"
                >
                    {Array.from({ length: columns }).map((__, columnIndex) => (
                        <td key={`skeleton-cell-${rowIndex}-${columnIndex}`} className="px-4 py-3">
                            <div
                                className={`h-4 rounded-full bg-slate-800/80 ${widths[columnIndex % widths.length]}`}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
};

export default TableSkeleton;
