from pathlib import Path
import os


BASE_DIR = Path(__file__).resolve().parent.parent


def _require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def _split_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


DATABASE_URL = _require_env("DATABASE_URL")
JWT_SECRET_KEY = _require_env("JWT_SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
CORS_ORIGINS = _split_csv(_require_env("CORS_ORIGINS"))

ROAD_NETWORK_FILE = BASE_DIR / "public" / "road_network" / "shenzhen_road.geojson"
DISTRICT_FILE = BASE_DIR / "public" / "distriction" / "440300.json"
