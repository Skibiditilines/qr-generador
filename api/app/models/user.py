from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class AccountType(enum.Enum):
    administrator = "administrator"
    user = "user"

class Account(Base):
    __tablename__ = "Account"

    account_id = Column("Account_id", Integer, primary_key=True, index=True)
    # acc_creation_date = Column("Acc_creation_date", DateTime, server_default=func.now(), nullable=False)
    account_password = Column("Account_password", Text, nullable=False)
    account_type = Column("Account_type", Enum(AccountType), default=AccountType.administrator, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    account_email = Column("Account_email", String(50), nullable=True)
    account_user = Column("Account_user", String(80), unique=True, index=True, nullable=False)

    # Relationships
    concepts = relationship("Concept", back_populates="account")
