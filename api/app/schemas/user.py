from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re

class UserLogin(BaseModel):
    account_user: str = Field(..., description="Nombre de usuario (solo letras y guiones bajos)")
    account_password: str = Field(..., min_length=9, max_length=9, description="Contraseña de exactamente 9 caracteres")

    @field_validator("account_user")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r"^[A-Za-z_]+$", v):
            raise ValueError("El usuario solo puede contener letras y guiones bajos")
        return v

    @field_validator("account_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) != 9:
            raise ValueError("La contraseña debe tener exactamente 9 caracteres")
        if any(char in v for char in ["'", '"', "<", ">", ";"]):
            raise ValueError("La contraseña contiene caracteres no permitidos")
        return v

class Token(BaseModel):
    access_token: str
    account_type: str
    exp: str  # ISO string para frontend
