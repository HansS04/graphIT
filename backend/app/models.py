from sqlalchemy import Column, Integer, String, Float, BigInteger, ForeignKey, JSON, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")
    presets = relationship("DashboardPreset", back_populates="owner")

class DashboardPreset(Base):
    __tablename__ = "dashboard_presets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    layout = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="presets")

class MarketData(Base):
    __tablename__ = "market_data"
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    interval = Column(String, index=True)
    open_time = Column(BigInteger, index=True)
    open = Column(Float)
    high = Column(Float)
    low = Column(Float)
    close = Column(Float)
    volume = Column(Float)
    __table_args__ = (
        UniqueConstraint('symbol', 'interval', 'open_time', name='uix_symbol_interval_time'),
    )