from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Concept(Base):
    __tablename__ = "Concepts"

    concept_id = Column("Concept_id", Integer, primary_key=True, index=True)
    concept_date = Column("Concept_date", DateTime(timezone=True), server_default=func.now(), nullable=False)
    content = Column("Content", Text, nullable=False)
    concept_color = Column("Concept_color", String(30), nullable=True) # Hex format
    concept_image = Column("Concept_image", String(255), nullable=False) # Cloudinary URL
    is_active = Column(Boolean, default=True, nullable=False)
    concept_slug = Column("Concept_slug", String(36), unique=True, index=True, nullable=False) # QR Identifier
    concept_note = Column("Concept_note", Text, nullable=True)
    
    account_id = Column("Account_id", Integer, ForeignKey("Account.Account_id"), nullable=False)

    # Relationships
    account = relationship("Account", back_populates="concepts")
