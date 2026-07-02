def calculate_overall_risk(password_score: int, url_score: int, website_score: int):
    overall_score = round((password_score + url_score + website_score) / 3)

    if overall_score >= 70:
        risk_level = "High Risk"
    elif overall_score >= 40:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    return {
        "overall_score": overall_score,
        "risk_level": risk_level,
        "components": {
            "password_score": password_score,
            "url_score": url_score,
            "website_score": website_score
        }
    }