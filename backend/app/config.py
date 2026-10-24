"""Application configuration loaded from the project-root .env file."""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# .env lives at  EconoNigeria/.env  (parent of backend/)
_dotenv_path = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    """Central configuration – values come from environment / .env."""

    DATABASE_URL: str
    FRED_API_KEY: str = ""
    EXCHANGE_RATE_API_KEY: str = ""
    WORLD_BANK_BASE_URL: str = "https://api.worldbank.org/v2"
    COUNTRY_CODE: str = "NGA"

    # API Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_DEFAULT_PER_MINUTE: int = 60
    RATE_LIMIT_EXPENSIVE_PER_MINUTE: int = 15

    model_config = SettingsConfigDict(env_file=str(_dotenv_path), env_file_encoding="utf-8", extra="ignore")


settings = Settings()
