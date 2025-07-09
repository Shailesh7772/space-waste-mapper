import React from 'react';
import { Line } from 'react-chartjs-2';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

// ✅ Import and register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function RiskTimelineModal({ open, onClose, satellite }) {
  if (!satellite) return null;

  const { name, altitude_km, lifetime_days } = satellite;

  // 🧠 Generate fake decay data linearly
  const labels = Array.from({ length: 10 }, (_, i) =>
    Math.round((i / 9) * lifetime_days)
  );

  const dataPoints = labels.map((day) =>
    parseFloat((altitude_km - (altitude_km * day) / lifetime_days).toFixed(2))
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: `Estimated Altitude Decay for ${name}`,
        data: dataPoints,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Satellite Altitude vs Lifetime',
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days Since Launch',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Altitude (km)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Modal open={open} onClose={onClose} center>
      <h3>📉 Lifetime Decay Prediction</h3>
      <div style={{ width: '500px', height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </Modal>
  );
}

export default RiskTimelineModal;
