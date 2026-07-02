from pydantic import BaseModel
from typing import Dict, List, Optional


class WebsiteRequest(BaseModel):
    url: str


class WebsiteInfo(BaseModel):
    input_url: str
    final_url: Optional[str]
    status_code: Optional[int]
    https_enabled: bool


class HeaderInfo(BaseModel):
    present: bool
    value: Optional[str]
    description: str
    recommendation: str


class WebsiteSummary(BaseModel):
    score: int
    risk_level: str
    findings: List[str]


class WebsiteResponse(BaseModel):
    website: WebsiteInfo
    security_headers: Dict[str, HeaderInfo]
    summary: WebsiteSummary