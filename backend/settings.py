import os
from dataclasses import dataclass

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str | None
    gemini_model: str
    database: dict[str, str | None]
    local_mode: bool

    @classmethod
    def from_environment(cls) -> "Settings":
        load_dotenv()

        database = {
            "host": os.getenv("DB_HOST") or os.getenv("db_host"),
            "port": os.getenv("DB_PORT") or os.getenv("db_port"),
            "dbname": os.getenv("DB_NAME") or os.getenv("db_name"),
            "user": os.getenv("DB_USER") or os.getenv("db_user"),
            "password": os.getenv("DB_PASSWORD") or os.getenv("db_pass"),
        }
        requested_mode = os.getenv("VIVASIGN_LOCAL_MODE")
        has_cloud_config = all(database.values()) and bool(
            os.getenv("GEMINI_API_KEY") or os.getenv("gemini_key")
        )

        return cls(
            gemini_api_key=os.getenv("GEMINI_API_KEY") or os.getenv("gemini_key"),
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
            database=database,
            local_mode=(requested_mode.lower() not in {"0", "false", "no"})
            if requested_mode is not None
            else not has_cloud_config,
        )
