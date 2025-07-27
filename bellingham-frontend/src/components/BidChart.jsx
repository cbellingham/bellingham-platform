import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BidChart = ({ bids = [] }) => {
    if (!bids.length) return null;

    const data = {
        labels: bids.map((b) => b.bidderUsername),
        datasets: [
            {
                label: 'Bid Amount',
                data: bids.map((b) => b.amount),
                backgroundColor: 'rgba(37,99,235,0.6)', // tailwind blue-600
            },
        ],
    };

    const options = {
        plugins: {
            legend: { display: false },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: { beginAtZero: true },
        },
    };

    return (
        <div className="h-64 mt-4">
            <Bar data={data} options={options} />
        </div>
    );
};

export default BidChart;
