from pydantic import BaseModel
from typing import List, Union


class URLRequest(BaseModel):
    url: str


class RedirectInfo(BaseModel):
    hop: int
    url: str
    code: Union[int, str]


class URLResponse(BaseModel):
    score: int
    risk_level: str
    findings: List[str]

    suspicious_keywords: List[str] = []
    redirects: List[RedirectInfo] = []

    domain_age: str = "Unknown"
    registrar: str = "Unknown"
    whois_privacy: str = "Unknown"
    ip_address: str = "Unknown"
    country: str = "Unknown"
    tld: str = "Unknown"
    asn: str = "Unknown"