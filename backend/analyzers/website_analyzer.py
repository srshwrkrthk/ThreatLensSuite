import time
import requests

from utils.network_utils import get_domain, get_ip_address, get_ssl_info


SECURITY_HEADERS = {
    "Strict-Transport-Security": {
        "description": "Forces browsers to use HTTPS instead of HTTP.",
        "risk_impact": "Without HSTS, users may be vulnerable to protocol downgrade attacks.",
        "recommendation": "Enable HSTS to protect users from protocol downgrade attacks."
    },
    "Content-Security-Policy": {
        "description": "Helps prevent Cross-Site Scripting attacks.",
        "risk_impact": "Without CSP, injected scripts may run more easily in the browser.",
        "recommendation": "Add a CSP header to control which resources can load."
    },
    "X-Frame-Options": {
        "description": "Protects against clickjacking attacks.",
        "risk_impact": "Without this header, attackers may embed the site in hidden iframes.",
        "recommendation": "Set X-Frame-Options to DENY or SAMEORIGIN."
    },
    "X-Content-Type-Options": {
        "description": "Prevents browsers from MIME-sniffing files.",
        "risk_impact": "Without this header, browsers may incorrectly interpret file types.",
        "recommendation": "Set X-Content-Type-Options to nosniff."
    }
}


def analyze_website(url: str):
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    try:
        start_time = time.time()
        response = requests.get(url, timeout=5)
        end_time = time.time()

        response_time_ms = round((end_time - start_time) * 1000)

        final_url = response.url
        headers = response.headers
        domain = get_domain(final_url)
        ip_address = get_ip_address(domain)

        https_enabled = final_url.startswith("https://")
        redirected = url != final_url
        server = headers.get("Server", "Not disclosed")

        ssl_info = get_ssl_info(domain) if https_enabled else {
            "issuer": None,
            "valid_from": None,
            "valid_until": None,
            "days_remaining": None,
            "certificate_valid": False
        }

        score = 0
        findings = []
        header_report = {}

        if not https_enabled:
            score += 25
            findings.append("Website does not use HTTPS.")

        if not ssl_info["certificate_valid"]:
            score += 25
            findings.append("SSL certificate is invalid or unavailable.")

        for header, info in SECURITY_HEADERS.items():
            if header in headers:
                header_report[header] = {
                    "present": True,
                    "value": headers[header],
                    "security_rating": "Good",
                    "description": info["description"],
                    "risk_impact": info["risk_impact"],
                    "recommendation": "No action needed."
                }
            else:
                score += 15
                findings.append(f"Missing {header} header.")
                header_report[header] = {
                "present": False,
                "value": None,
                "security_rating": "Critical",
                "description": info["description"],
                "risk_impact": info["risk_impact"],
                "recommendation": info["recommendation"]
                }

        if score >= 60:
            risk_level = "High Risk"
        elif score >= 30:
            risk_level = "Moderate Risk"
        else:
            risk_level = "Low Risk"

        return {
            "website": {
                "input_url": url,
                "final_url": final_url,
                "domain": domain,
                "ip_address": ip_address,
                "status_code": response.status_code,
                "https_enabled": https_enabled,
                "redirected": redirected,
                "server": server,
                "response_time_ms": response_time_ms
            },
            "ssl": ssl_info,
            "security_headers": header_report,
            "summary": {
                "score": score,
                "risk_level": risk_level,
                "findings": findings
            }
        }

    except requests.exceptions.RequestException:
        return {
            "website": {
                "input_url": url,
                "final_url": None,
                "domain": None,
                "ip_address": None,
                "status_code": None,
                "https_enabled": False,
                "redirected": False,
                "server": None,
                "response_time_ms": None
            },
            "ssl": {
                "issuer": None,
                "valid_from": None,
                "valid_until": None,
                "days_remaining": None,
                "certificate_valid": False
            },
            "security_headers": {},
            "summary": {
                "score": 100,
                "risk_level": "High Risk",
                "findings": ["Unable to reach website."]
            }
        }