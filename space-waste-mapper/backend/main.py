from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.errors import InvalidId
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
from math import degrees, atan2, sqrt
from sgp4.api import Satrec, jday
import numpy as np
import joblib

# -----------------------------
# Pydantic Model
# -----------------------------
class Satellite(BaseModel):
    name: str
    norad_id: int
    tle_line1: str
    tle_line2: str
    status: str

# -----------------------------
# App Initialization
# -----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = MongoClient("mongodb://localhost:27017/")
db = client["space_waste_db"]
satellite_collection = db["satellites"]

# -----------------------------
# Load Anomaly Model
# -----------------------------
try:
    anomaly_model = joblib.load("ml_model/anomaly_model.pkl")
except Exception as e:
    anomaly_model = None
    print("⚠️ Failed to load anomaly model:", e)

@app.get("/")
def root():
    return {"message": "MongoDB connected!"}

# -----------------------------
# Utilities
# -----------------------------
def tle_to_latlon_alt(tle1, tle2):
    try:
        satellite = Satrec.twoline2rv(tle1.strip(), tle2.strip())
        now = datetime.utcnow()
        jd, fr = jday(now.year, now.month, now.day, now.hour, now.minute, now.second)
        error_code, position, velocity = satellite.sgp4(jd, fr)
        if error_code == 0:
            x, y, z = position
            lat = degrees(atan2(z, sqrt(x**2 + y**2)))
            lon = degrees(atan2(y, x))
            alt = sqrt(x**2 + y**2 + z**2) - 6371
            return lat, lon, round(alt, 2)
    except Exception as e:
        print("❌ Error in tle_to_latlon_alt:", e)
    return None, None, None

def get_mean_motion_derivative(tle1):
    try:
        raw = tle1[33:43].strip().replace(" ", "")
        if '-' in raw or '+' in raw:
            base = raw[:5]
            exponent = raw[5:]
            return float(f"{base}e{exponent}")
        return float(raw)
    except Exception as e:
        print(f"[mm_dot parse error]: {tle1[33:43]} | {e}")
        return 0.0

def tle_to_epoch_date(tle1):
    try:
        year = int(tle1[18:20])
        year += 2000 if year < 57 else 1900
        day_str = tle1[20:32].strip().replace('..', '.').replace(' .', '').rstrip('.')
        day_of_year = float(day_str)
        return datetime(year, 1, 1) + timedelta(days=day_of_year - 1)
    except Exception as e:
        print("❌ Epoch parsing error:", e)
        return None

def estimate_lifetime_from_tle(tle1):
    try:
        mm_dot = get_mean_motion_derivative(tle1)
        return round(1 / (2 * mm_dot), 2) if mm_dot > 0 else None
    except:
        return None

def get_decay_status(lifetime):
    if lifetime is None:
        return "Unknown"
    elif lifetime < 30:
        return "⚠️ Warning"
    else:
        return "✅ Stable"

# -----------------------------
# API Routes
# -----------------------------
@app.post("/api/satellite/add")
def add_satellite(data: Satellite):
    lat, lon, alt = tle_to_latlon_alt(data.tle_line1, data.tle_line2)
    satellite_data = data.dict()
    satellite_data.update({"latitude": lat, "longitude": lon, "altitude_km": alt})

    try:
        epoch = tle_to_epoch_date(data.tle_line1)
        mm_dot = get_mean_motion_derivative(data.tle_line1)
        lifetime = round(1 / abs(mm_dot), 2) if mm_dot != 0 else "N/A"
        days_remaining = (epoch + timedelta(days=float(lifetime)) - datetime.utcnow()).days if isinstance(lifetime, float) else "N/A"
        decay_status = "⚠️ Soon" if isinstance(days_remaining, int) and days_remaining <= 30 else "✅ Stable"
        satellite_data.update({
            "epoch_date": epoch.strftime("%Y-%m-%d") if epoch else "N/A",
            "lifetime_days": lifetime,
            "decay_status": decay_status
        })
    except Exception as e:
        print("❌ Add satellite parsing error:", e)
        satellite_data.update({
            "epoch_date": "N/A",
            "lifetime_days": "N/A",
            "decay_status": "Unknown"
        })

    result = satellite_collection.insert_one(satellite_data)
    return {"message": "Satellite added", "id": str(result.inserted_id)}

@app.get("/api/satellite/all")
def get_all_satellites():
    satellites = list(satellite_collection.find())
    for sat in satellites:
        sat["_id"] = str(sat["_id"])
        try:
            epoch = tle_to_epoch_date(sat["tle_line1"])
            mm_dot = get_mean_motion_derivative(sat["tle_line1"])
            lifetime = round(1 / abs(mm_dot), 2) if mm_dot != 0 else "N/A"
            days_remaining = (epoch + timedelta(days=float(lifetime)) - datetime.utcnow()).days if isinstance(lifetime, float) else "N/A"
            decay_warning = "⚠️ Soon" if isinstance(days_remaining, int) and days_remaining <= 30 else "✅ Stable"
            sat.update({
                "epoch_date": epoch.strftime("%Y-%m-%d") if epoch else "N/A",
                "lifetime_est_days": lifetime,
                "days_remaining": days_remaining,
                "decay_warning": decay_warning
            })
        except Exception as e:
            print("❌ Error while enriching satellite data:", e)
            sat.update({
                "epoch_date": "N/A",
                "lifetime_est_days": "N/A",
                "days_remaining": "N/A",
                "decay_warning": "Unknown"
            })
    return satellites

@app.get("/api/satellite/position/{id}")
def get_live_position(id: str):
    try:
        satellite = satellite_collection.find_one({"_id": ObjectId(id)})
        if not satellite:
            raise HTTPException(status_code=404, detail="Satellite not found")

        tle1, tle2 = satellite["tle_line1"], satellite["tle_line2"]
        lat, lon, alt = tle_to_latlon_alt(tle1, tle2)
        epoch = tle_to_epoch_date(tle1)
        lifetime = estimate_lifetime_from_tle(tle1)
        decay_status = get_decay_status(lifetime)

        return {
            "name": satellite["name"],
            "norad_id": satellite["norad_id"],
            "latitude": round(lat, 2) if lat else None,
            "longitude": round(lon, 2) if lon else None,
            "altitude_km": round(alt, 2) if alt else None,
            "epoch": epoch.strftime("%Y-%m-%d") if epoch else "N/A",
            "lifetime_days": lifetime if lifetime else "N/A",
            "decay_status": decay_status,
            "last_updated_utc": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }
    except Exception as e:
        print("❌ ERROR in position API:", e)
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/satellite/delete/{id}")
def delete_satellite(id: str):
    result = satellite_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Satellite not found")
    return {"message": "Satellite deleted"}

@app.get("/api/satellite/anomaly-check/{id}")
def detect_satellite_anomaly(id: str):
    try:
        obj_id = ObjectId(id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid satellite ID format")

    satellite = satellite_collection.find_one({"_id": obj_id})
    if not satellite:
        raise HTTPException(status_code=404, detail="Satellite not found")

    if anomaly_model is None:
        raise HTTPException(status_code=500, detail="Anomaly model not loaded")

    try:
        features = np.array([[  
            float(satellite.get("mean_motion", 15.0)),
            float(get_mean_motion_derivative(satellite["tle_line1"])),
            float(satellite.get("altitude_km", 500.0)),
            float(satellite.get("inclination", 98.0)),
            float(satellite.get("eccentricity", 0.01))
        ]])
        prediction = anomaly_model.predict(features)
        status = "⚠️ Anomaly Detected" if prediction[0] == -1 else "✅ Normal"

        return {
            "satellite": satellite["name"],
            "norad_id": satellite["norad_id"],
            "anomaly_status": status
        }

    except Exception as e:
        print("❌ ERROR in anomaly-check API:", e)
        raise HTTPException(status_code=500, detail="Anomaly check failed: " + str(e))
