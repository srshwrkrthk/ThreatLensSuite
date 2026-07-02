from pydantic import BaseModel
from typing import List


class PasswordRequest(BaseModel):
    password: str


class PasswordResponse(BaseModel):
    score: int
    risk_level: str
    findings: List[str]