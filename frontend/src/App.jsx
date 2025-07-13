import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import RiskTimelineModal from './components/RiskTimelineModal';
import SatelliteMap from './components/SatelliteMap';

const API_BASE_URL = process.env.REACT_APP_API_URL;

function App() {
  const [satellites, setSatellites] = useState([]);
  const [liveData, setLiveData] = useState({});
  const [anomalyData, setAnomalyData] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    norad_id: '',
    tle_line1: '',
    tle_line2: '',
    status: 'active',
  });

  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 🚀 Fetch all satellites on load
  useEffect(() => {
    fetchSatellites();
  }, []);

  // 🌍 Fetch live position every 30s
  useEffect(() => {
    satellites.forEach((sat) => fetchLivePosition(sat._id));
    const interval = setInterval(() => {
      satellites.forEach((sat) => fetchLivePosition(sat._id));
    }, 30000);
    return () => clearInterval(interval);
  }, [satellites]);

  const fetchSatellites = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/satellite/all`);
      setSatellites(res.data);
    } catch (err) {
      console.error('Fetch satellite error:', err);
    }
  };

  const fetchLivePosition = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/satellite/position/${id}`);
      setLiveData((prev) => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error('Live position fetch error:', err);
    }
  };

  const checkAnomaly = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/satellite/anomaly-check/${id}`);
      setAnomalyData((prev) => ({ ...prev, [id]: res.data.anomaly_status }));
    } catch (err) {
      setAnomalyData((prev) => ({ ...prev, [id]: '❌ Error' }));
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/satellite/add`, formData);
      alert('✅ Satellite added successfully');
      setFormData({ name: '', norad_id: '', tle_line1: '', tle_line2: '', status: 'active' });
      fetchSatellites();
    } catch {
      alert('❌ Error adding satellite');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('❗ Are you sure you want to delete this satellite?')) {
      await axios.delete(`${API_BASE_URL}/api/satellite/delete/${id}`);
      fetchSatellites();
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('🛰️ Satellite Tracker Report', 14, 10);
    const tableData = satellites.map((sat) => {
      const live = liveData[sat._id];
      return [
        sat.name,
        sat.norad_id,
        live?.latitude?.toFixed(2) ?? 'N/A',
        live?.longitude?.toFixed(2) ?? 'N/A',
        live?.altitude_km ?? 'N/A',
        live?.epoch ?? 'N/A',
        live?.lifetime_days ?? 'N/A',
        live?.decay_status ?? 'N/A',
      ];
    });

    autoTable(doc, {
      head: [['Name', 'NORAD ID', 'Lat', 'Lon', 'Alt (km)', 'Epoch', 'Lifetime (days)', 'Decay Status']],
      body: tableData,
      startY: 20,
    });

    doc.save('satellite_report.pdf');
  };

  return (
    <div className="App">
      <h1>🛰️ Satellite Live Tracker</h1>

      {/* 📥 Add Satellite Form */}
      <form className="sat-form" onSubmit={handleSubmit}>
        <h2>Add Satellite</h2>
        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Name" required />
        <input name="norad_id" value={formData.norad_id} onChange={handleInputChange} placeholder="NORAD ID" required />
        <input name="tle_line1" value={formData.tle_line1} onChange={handleInputChange} placeholder="TLE Line 1" required />
        <input name="tle_line2" value={formData.tle_line2} onChange={handleInputChange} placeholder="TLE Line 2" required />
        <select name="status" value={formData.status} onChange={handleInputChange}>
          <option value="active">Active</option>
          <option value="decayed">Decayed</option>
        </select>
        <button type="submit">➕ Add Satellite</button>
      </form>

      {/* 📤 Export Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', margin: '20px' }}>
        <CSVLink
          filename={'satellite_data.csv'}
          data={satellites.map((sat) => {
            const live = liveData[sat._id];
            return {
              Name: sat.name,
              NORAD_ID: sat.norad_id,
              Latitude: live?.latitude ?? 'N/A',
              Longitude: live?.longitude ?? 'N/A',
              Altitude_km: live?.altitude_km ?? 'N/A',
              Epoch: live?.epoch ?? 'N/A',
              Lifetime_Days: live?.lifetime_days ?? 'N/A',
              Decay_Status: live?.decay_status ?? 'N/A',
              Last_Updated: live?.last_updated_utc ?? 'N/A',
            };
          })}
          className="btn"
        >
          📄 Download CSV
        </CSVLink>
        <button onClick={generatePDF} className="btn">🧾 Download PDF</button>
      </div>

      {/* 🌍 Globe or Map View */}
      <SatelliteMap satellites={satellites} liveData={liveData} />

      {/* 📊 Satellite Table */}
      <table className="tracker-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>NORAD ID</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Altitude (km)</th>
            <th>Epoch</th>
            <th>Lifetime (days)</th>
            <th>Decay Status</th>
            <th>Anomaly</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
            <th>Timeline</th>
          </tr>
        </thead>
        <tbody>
          {satellites.map((sat) => {
            const live = liveData[sat._id];
            const anomaly = anomalyData[sat._id];
            return (
              <tr key={sat._id}>
                <td>{sat.name}</td>
                <td>{sat.norad_id}</td>
                <td>{live ? live.latitude?.toFixed(2) : 'Loading...'}</td>
                <td>{live ? live.longitude?.toFixed(2) : 'Loading...'}</td>
                <td>{live ? live.altitude_km ?? '...' : '...'}</td>
                <td>{live?.epoch || "N/A"}</td>
                <td>{live?.lifetime_days ?? "N/A"}</td>
                <td>
                  <span className={`badge ${live?.decay_status?.includes("Warning") ? "danger" : "safe"}`}>
                    {live?.decay_status || "Unknown"}
                  </span>
                </td>
                <td>
                  <button onClick={() => checkAnomaly(sat._id)}>🧠 Check</button>
                  {anomaly && (
                    <div className={`anomaly-badge ${anomaly.includes("✅") ? "safe" : "danger"}`}>
                      {anomaly}
                    </div>
                  )}
                </td>
                <td><span className="status-badge">🟢 In Orbit</span></td>
                <td>{live?.last_updated_utc || "..."}</td>
                <td>
                  <button onClick={() => handleDelete(sat._id)}>🗑️ Delete</button>
                </td>
                <td>
                  <button
                    onClick={() => {
                      if (live?.altitude_km && live?.lifetime_days) {
                        setSelectedSatellite({
                          name: sat.name,
                          altitude_km: live.altitude_km,
                          lifetime_days: live.lifetime_days,
                        });
                        setModalOpen(true);
                      } else {
                        alert("Missing data for chart");
                      }
                    }}
                  >
                    📉 Risk Chart
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 📈 Modal for Risk Chart */}
      <RiskTimelineModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        satellite={selectedSatellite}
      />
    </div>
  );
}

export default App;
