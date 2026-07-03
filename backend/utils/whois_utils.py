import whois


def safe_string(value):
    if value is None:
        return None

    if isinstance(value, list):
        return str(value[0]) if value else None

    return str(value)


def get_whois_info(domain: str):
    try:
        data = whois.whois(domain)

        return {
            "registrar": safe_string(data.registrar),
            "creation_date": safe_string(data.creation_date),
            "expiration_date": safe_string(data.expiration_date),
            "updated_date": safe_string(data.updated_date),
            "name_servers": list(data.name_servers) if data.name_servers else [],
            "emails": data.emails if isinstance(data.emails, list) else [data.emails] if data.emails else [],
            "country": safe_string(data.country),
        }

    except Exception:
        return {
            "registrar": None,
            "creation_date": None,
            "expiration_date": None,
            "updated_date": None,
            "name_servers": [],
            "emails": [],
            "country": None,
        }