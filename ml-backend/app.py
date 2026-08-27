# Placeholder ML service — replace with the real model/inference code.
import os
from fastapi import FastAPI
import psycopg2

app = FastAPI()

DATABASE_URL = os.environ.get("DATABASE_URL")


@app.get("/health")
def health():
    return {"status": "ok", "service": "nursing-care-lebnexis ml-backend"}


@app.get("/health/db")
def health_db():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        cur.execute("SELECT NOW();")
        now = cur.fetchone()[0]
        cur.close()
        conn.close()
        return {"db": "connected", "time": str(now)}
    except Exception as e:
        return {"db": "error", "message": str(e)}


@app.post("/predict")
def predict(payload: dict):
    # Replace with real model inference.
    return {"received": payload, "prediction": "placeholder"}
