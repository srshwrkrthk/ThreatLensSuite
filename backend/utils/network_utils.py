import socket
import ssl
from datetime import datetime
from urllib.parse import urlparse


def get_domain(final_url: str):
    parsed_url = urlparse(final_url)
    return parsed_url.netloc


def get_ip_address(domain: str):
    try:
        return socket.gethostbyname(domain)
    except socket.gaierror:
        return None


def get_ssl_info(domain: str):
    try:
        context = ssl.create_default_context()

        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as secure_sock:
                certificate = secure_sock.getpeercert()

        issuer = dict(x[0] for x in certificate.get("issuer", []))
        valid_from = certificate.get("notBefore")
        valid_until = certificate.get("notAfter")

        expiry_date = datetime.strptime(valid_until, "%b %d %H:%M:%S %Y %Z")
        days_remaining = (expiry_date - datetime.utcnow()).days

        return {
            "issuer": issuer.get("organizationName", "Unknown"),
            "valid_from": valid_from,
            "valid_until": valid_until,
            "days_remaining": days_remaining,
            "certificate_valid": days_remaining > 0
        }

    except Exception:
        return {
            "issuer": None,
            "valid_from": None,
            "valid_until": None,
            "days_remaining": None,
            "certificate_valid": False
        }