from pydantic import BaseModel
from typing import Dict, List, Optional


class WebsiteRequest(BaseModel):
    url: str


class WebsiteInfo(BaseModel):
    input_url: str
    final_url: Optional[str]
    domain: Optional[str]
    ip_address: Optional[str]
    status_code: Optional[int]
    https_enabled: bool
    redirected: bool
    server: Optional[str]
    response_time_ms: Optional[int]


class SSLInfo(BaseModel):
    issuer: Optional[str]
    valid_from: Optional[str]
    valid_until: Optional[str]
    days_remaining: Optional[int]
    certificate_valid: bool

class HeaderInfo(BaseModel):
    present: bool
    value: Optional[str]
    security_rating: str
    description: str
    risk_impact: str
    recommendation: str

class WebsiteSummary(BaseModel):
    score: int
    risk_level: str
    findings: List[str]


class WebsiteResponse(BaseModel):
    website: WebsiteInfo
    ssl: SSLInfo
    security_headers: Dict[str, HeaderInfo]
    summary: WebsiteSummary