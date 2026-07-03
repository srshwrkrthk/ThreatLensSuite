import requests


def get_asn_info(ip_address: str):
    if not ip_address or ip_address == "Unknown":
        return {
            "asn": "Unknown",
            "organization": "Unknown",
            "country": "Unknown",
            "city": "Unknown",
        }

    try:
        response = requests.get(
            f"https://ipinfo.io/{ip_address}/json",
            timeout=5
        )

        data = response.json()
        org = data.get("org", "Unknown")

        return {
            "asn": org.split(" ")[0] if org != "Unknown" else "Unknown",
            "organization": " ".join(org.split(" ")[1:]) if org != "Unknown" else "Unknown",
            "country": data.get("country", "Unknown"),
            "city": data.get("city", "Unknown"),
        }

    except Exception:
        return {
            "asn": "Unknown",
            "organization": "Unknown",
            "country": "Unknown",
            "city": "Unknown",
        }