# 🛡️ ThreatLens

> **A Modern Cybersecurity Analysis Suite built with React + FastAPI**
>
> Analyze websites, detect phishing URLs, and evaluate password strength through an intuitive security dashboard.

---

## 📖 Overview

ThreatLens is a full-stack cybersecurity analysis platform that combines multiple security assessment tools into a single, modern interface.

It enables users to:

- 🌐 Analyze website security configurations
- 🎣 Detect suspicious and phishing URLs
- 🔐 Evaluate password strength and estimated cracking difficulty
- 📊 View security insights through interactive dashboards

ThreatLens was built to demonstrate practical cybersecurity concepts, networking fundamentals, API integration, and full-stack development.

---

# ✨ Features

## 🌍 Website Security Analyzer

Perform a security assessment of any website.

Checks include:

- SSL/TLS Certificate Analysis
- WHOIS Information
- DNS Records
- Security Headers
- Cookie Security
- Technology Detection
- HTTP Methods
- robots.txt Detection
- security.txt Detection
- Risk Scoring

---

## 🎣 URL Phishing Analyzer

Analyze suspicious URLs and detect potential phishing attempts.

Features include:

- HTTPS Validation
- Suspicious Keyword Detection
- Domain Age
- Registrar Information
- Country Detection
- IP Resolution
- Top-Level Domain (TLD) Analysis
- Risk Classification
- Security Findings

---

## 🔐 Password Strength Analyzer

Evaluate password security using multiple parameters.

Checks include:

- Length
- Uppercase Letters
- Lowercase Letters
- Numbers
- Symbols
- Estimated Crack Time
- Password Score
- Security Recommendations

---

# 🖥️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide Icons

### Backend

- FastAPI
- Python
- Pydantic
- python-whois
- Requests
- Socket
- SSL

---

# 📁 Project Structure

```
ThreatLens/
│
├── backend/
│   ├── analyzers/
│   ├── models/
│   ├── utils/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/srshwrkrthk/ThreatLensV1.git

cd ThreatLensV1
```

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on

```
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on

```
http://localhost:5173
```

---

# 🔌 API Endpoints

## Password Analyzer

```
POST /check-password
```

Example

```json
{
  "password": "MyPassword@123"
}
```

---

## URL Analyzer

```
POST /analyze-url
```

Example

```json
{
  "url": "https://github.com"
}
```

---

## Website Scanner

```
POST /scan-website
```

Example

```json
{
  "url": "https://github.com"
}
```

---

## Risk Engine

```
POST /calculate-risk
```

---

# 🎯 Future Improvements

- ASN Lookup
- Redirect Chain Detection
- VirusTotal Integration
- Shodan Integration
- PDF Report Generation
- User Authentication
- Scan History
- Dark/Light Theme
- Docker Support
- CI/CD Pipeline

---

# 📚 Learning Outcomes

This project demonstrates practical experience with:

- Full Stack Development
- REST API Design
- React State Management
- FastAPI
- Networking
- DNS
- SSL/TLS
- WHOIS
- Security Headers
- Password Security
- Cybersecurity Fundamentals

---

# 👨‍💻 Author

**Srishwar Karthik**

B.Tech Computer Science (Cyber Security)

VIT Chennai

GitHub:
https://github.com/srshwrkrthk

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.