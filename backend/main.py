from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from analyzers.password_analyzer import analyze_password

app = FastAPI(
    title="ThreatLens API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PasswordRequest(BaseModel):
    password: str


@app.get("/")
def home():
    return {
        "message": "ThreatLens API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "threatlens-api"
    }


@app.post("/check-password")
def check_password(data: PasswordRequest):
    return analyze_password(data.password)