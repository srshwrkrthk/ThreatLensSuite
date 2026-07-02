import requests


SECURITY_HEADERS = {
    "Strict-Transport-Security": {
        "description": "Forces browsers to use HTTPS instead of HTTP.",
        "recommendation": "Enable HSTS to protect users from protocol downgrade attacks."
    },
    "Content-Security-Policy": {
        "description": "Helps prevent Cross-Site Scripting attacks.",
        "recommendation": "Add a CSP header to control which resources can load."
    },
    "X-Frame-Options": {
        "description": "Protects against clickjacking attacks.",
        "recommendation": "Set X-Frame-Options to DENY or SAMEORIGIN."
    },
    "X-Content-Type-Options": {
        "description": "Prevents browsers from MIME-sniffing files.",
        "recommendation": "Set X-Content-Type-Options to nosniff."
    }
}


def analyze_website(url: str):
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    try:
        response = requests.get(url, timeout=5)
        final_url = response.url
        headers = response.headers

        score = 0
        findings = []
        header_report = {}

        https_enabled = final_url.startswith("https://")

        if not https_enabled:
            score += 25
            findings.append("Website does not use HTTPS.")

        for header, info in SECURITY_HEADERS.items():
            if header in headers:
                header_report[header] = {
                    "present": True,
                    "value": headers[header],
                    "description": info["description"],
                    "recommendation": "No action needed."
                }
            else:
                score += 15
                findings.append(f"Missing {header} header.")
                header_report[header] = {
                    "present": False,
                    "value": None,
                    "description": info["description"],
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
                "status_code": response.status_code,
                "https_enabled": https_enabled
            },
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
                "status_code": None,
                "https_enabled": False
            },
            "security_headers": {},
            "summary": {
                "score": 100,
                "risk_level": "High Risk",
                "findings": ["Unable to reach website."]
            }
        }