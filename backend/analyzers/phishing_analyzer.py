from urllib.parse import urlparse
import socket
from datetime import datetime
from utils.asn_utils import get_asn_info
from utils.whois_utils import get_whois_info


def analyze_url(url: str):
    score = 0
    findings = []

    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    parsed_url = urlparse(url)
    domain = parsed_url.netloc

    whois_data = get_whois_info(domain)
    domain_age = "Unknown"

    try:
        creation = whois_data["creation_date"]

        if creation:
            if isinstance(creation, list):
                creation = creation[0]

            creation = datetime.fromisoformat(str(creation).split("+")[0])
            years = (datetime.now() - creation).days // 365
            domain_age = f"{years} years"

            if years < 1:
                score += 25
                findings.append("Very new domain.")
            elif years < 2:
                score += 15
                findings.append("Recently registered domain.")
    except Exception:
        pass

    suspicious_words = [
        "login", "verify", "update", "secure",
        "account", "bank", "payment", "confirm"
    ]

    detected_keywords = [
        word for word in suspicious_words
        if word in url.lower()
    ]

    try:
        ip_address = socket.gethostbyname(domain)
    except Exception:
        ip_address = "Unknown"
    asn_info = get_asn_info(ip_address)
    tld = "." + domain.split(".")[-1] if "." in domain else "Unknown"

    if parsed_url.scheme != "https":
        score += 25
        findings.append("URL does not use HTTPS.")

    if any(ch.isdigit() for ch in domain):
        score += 15
        findings.append("Domain contains numbers.")

    if "-" in domain:
        score += 15
        findings.append("Domain contains hyphens.")

    if len(url) > 75:
        score += 20
        findings.append("URL is unusually long.")

    if detected_keywords:
        score += 25
        findings.append("URL contains suspicious keywords.")

    if tld in [".xyz", ".top", ".click", ".work", ".zip"]:
        score += 15
        findings.append("URL uses a commonly abused or low-trust TLD.")

    score = min(score, 100)

    if score >= 60:
        risk_level = "High Risk"
    elif score >= 30:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    return {
        "score": score,
        "risk_level": risk_level,
        "findings": findings,
        "suspicious_keywords": detected_keywords,
        "redirects": [],
        "domain_age": domain_age,
        "registrar": whois_data["registrar"] or "Unknown",
        "whois_privacy": "Unknown",
        "ip_address": ip_address,
        "country": whois_data["country"] or "Unknown",
        "tld": tld,
        "asn": f"{asn_info['asn']} — {asn_info['organization']}"
    }