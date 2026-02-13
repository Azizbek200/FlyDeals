import os
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8080")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:3000")
POLL_NEW_DEALS_INTERVAL = int(os.getenv("POLL_NEW_DEALS_INTERVAL", "300"))
POLL_PRICE_ALERTS_INTERVAL = int(os.getenv("POLL_PRICE_ALERTS_INTERVAL", "600"))
DEALS_PER_PAGE = int(os.getenv("DEALS_PER_PAGE", "5"))
DB_PATH = os.getenv("DB_PATH", "./bot_data.db")
