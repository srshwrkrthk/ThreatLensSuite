def analyze_password(password: str):
    score = 0
    findings = []

    if len(password) >= 8:
        score += 25
    else:
        findings.append("Password should be at least 8 characters long.")

    if any(ch.isupper() for ch in password):
        score += 20
    else:
        findings.append("Add at least one uppercase letter.")

    if any(ch.islower() for ch in password):
        score += 20
    else:
        findings.append("Add at least one lowercase letter.")

    if any(ch.isdigit() for ch in password):
        score += 20
    else:
        findings.append("Add at least one number.")

    if any(not ch.isalnum() for ch in password):
        score += 15
    else:
        findings.append("Add at least one symbol.")

    if score >= 80:
        risk_level = "Low Risk"
    elif score >= 50:
        risk_level = "Moderate Risk"
    else:
        risk_level = "High Risk"

    return {
        "score": score,
        "risk_level": risk_level,
        "findings": findings
    }