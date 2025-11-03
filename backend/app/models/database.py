from sqlalchemy import Column, Integer, String, Text, DateTime, func
from app.core.db import Base

class DecisionRecord(Base):
    __tablename__ = "decisions"
    id = Column(Integer, primary_key=True, index=True)
    decision_title = Column(String(200), nullable=False)
    recommendation = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # pydantic json
    created_at = Column(DateTime(timezone=True), server_default=func.now())