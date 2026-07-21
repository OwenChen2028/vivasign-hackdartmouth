import os
from dataclasses import dataclass

from dotenv import load_dotenv


REFERENCE_MODE = "reference"
AI_MODE = "ai"
VALID_EVALUATION_MODES = {REFERENCE_MODE, AI_MODE}
DEFAULT_CORS_ORIGINS = ("http://localhost:3000", "http://127.0.0.1:3000")


@dataclass(frozen=True)
class Settings:
    evaluation_mode: str
    gemini_api_key: str | None
    gemini_model: str
    database: dict[str, str | None]
    cors_origins: tuple[str, ...] = DEFAULT_CORS_ORIGINS

    @property
    def uses_reference_data(self) -> bool:
        return self.evaluation_mode == REFERENCE_MODE

    @classmethod
    def from_environment(cls) -> "Settings":
        load_dotenv()

        database = {
            "host": os.getenv("DB_HOST"),
            "port": os.getenv("DB_PORT"),
            "dbname": os.getenv("DB_NAME"),
            "user": os.getenv("DB_USER"),
            "password": os.getenv("DB_PASSWORD"),
        }
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        has_ai_config = all(database.values()) and bool(gemini_api_key)
        evaluation_mode = os.getenv(
            "VIVASIGN_EVALUATION_MODE",
            AI_MODE if has_ai_config else REFERENCE_MODE,
        ).lower()

        if evaluation_mode not in VALID_EVALUATION_MODES:
            valid_modes = ", ".join(sorted(VALID_EVALUATION_MODES))
            raise ValueError(f"VIVASIGN_EVALUATION_MODE must be one of: {valid_modes}.")
        if evaluation_mode == AI_MODE and not has_ai_config:
            raise ValueError(
                "AI evaluation mode requires GEMINI_API_KEY and all DB_* variables."
            )

        cors_origins = tuple(
            origin.strip()
            for origin in os.getenv(
                "CORS_ORIGINS", ",".join(DEFAULT_CORS_ORIGINS)
            ).split(",")
            if origin.strip()
        )

        return cls(
            evaluation_mode=evaluation_mode,
            gemini_api_key=gemini_api_key,
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.0-flash"),
            database=database,
            cors_origins=cors_origins,
        )
