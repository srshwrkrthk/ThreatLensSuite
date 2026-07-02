from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Importing request and response models from models folder to keep API schemas separate from route logic
from models.password_models import PasswordRequest, PasswordResponse
from analyzers.password_analyzer import analyze_password
from analyzers.phishing_analyzer import analyze_url
from models.phishing_models import URLRequest, URLResponse
from analyzers.risk_engine import calculate_overall_risk
from models.risk_models import RiskRequest, RiskResponse
from analyzers.website_analyzer import analyze_website
from models.website_models import WebsiteRequest, WebsiteResponse


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


@app.post("/check-password", response_model=PasswordResponse)
def check_password(data: PasswordRequest):
    return analyze_password(data.password)

@app.post("/analyze-url", response_model=URLResponse)
def check_url(data: URLRequest):
    return analyze_url(data.url)

@app.post("/calculate-risk", response_model=RiskResponse)
def calculate_risk(data: RiskRequest):
    return calculate_overall_risk(
        data.password_score,
        data.url_score,
        data.website_score
    )

@app.post("/scan-website", response_model=WebsiteResponse)
def scan_website(data: WebsiteRequest):
    return analyze_website(data.url)