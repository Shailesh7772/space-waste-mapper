# 🛰️ Space Waste Mapper

A full-stack web application to visualize, track, and analyze space debris and satellites in real time.  
Built as a student project to demonstrate skills in modern web development, data visualization, and backend APIs.

---

## 🚀 Project Overview

**Space Waste Mapper** helps users:
- Visualize satellites and space debris on an interactive map
- Track live positions and orbital data
- Predict satellite decay and risk using machine learning
- Export data as CSV or PDF reports

This project combines a React frontend with a Python FastAPI backend, integrating real satellite data and ML models for anomaly detection and risk analysis.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Material UI, Leaflet, Chart.js, Cesium, Resium
- **Backend:** Python, FastAPI, scikit-learn, Pandas, Numpy
- **Database:** (Add your DB here, e.g., MongoDB, SQLite, etc.)
- **Other:** Axios, jsPDF, CSV export

---

## ✨ Features

- 🌍 Interactive satellite map (2D/3D)
- 📡 Live satellite position updates
- 📈 Risk timeline and anomaly detection (ML-powered)
- 🧾 Export satellite data (CSV, PDF)
- 🛰️ Add/delete satellites with TLE data
- 🛡️ Decay and lifetime prediction

---

## 📂 Folder Structure

```
space-waste-mapper/
│
├── frontend/                # React app (UI, map, charts)
│   ├── src/
│   ├── public/
│   └── ...
│
├── space-waste-mapper/
│   └── backend/             # FastAPI backend (API, ML, DB)
│       ├── ml_model/
│       ├── routes/
│       ├── services/
│       └── ...
│
├── package.json             # Project-level dependencies
└── README.md
```

---

## 🏁 Getting Started

### 1. Clone the repository
```sh
git clone https://github.com/Shailesh7772/space-waste-mapper.git
cd space-waste-mapper
```

### 2. Frontend Setup
```sh
cd frontend
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

### 3. Backend Setup
```sh
cd space-waste-mapper/backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
API runs at [http://localhost:8000](http://localhost:8000)

---

## 📊 Screenshots

*(Add screenshots here to showcase your UI and features!)*

---

## 👨‍💻 Author

- **Name:** Shailesh K R
- **Role:** Full Stack Developer (Student)
- **LinkedIn:** [@https://www.linkedin.com/in/shailesh-kr-1a7a06256/](https://www.linkedin.com/in/shailesh-kr-1a7a06256/)
- **Email:** krshailesh627@gmail.com

---

## 📄 License

This project is for educational purposes.

---

## ⭐️ Why this project?

- Demonstrates full-stack development (React + FastAPI)
- Integrates real-world data and ML models
- Showcases data visualization, API design, and deployment skills
- Great for resumes, portfolios, and learning! 