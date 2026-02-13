import asyncio
import logging

from telegram.error import Forbidden
from telegram.ext import ContextTypes

from api_client import FlyDealsAPI
from formatters import format_deal_card
from keyboards import deal_detail_keyboard
import storage

logger = logging.getLogger(__name__)


async def check_new_deals(context: ContextTypes.DEFAULT_TYPE) -> None:
    """Poll for new deals and notify subscribers."""
    api: FlyDealsAPI = context.bot_data["api"]

    try:
        data = await api.get_deals(page=1, limit=20, sort="newest")
    except Exception:
        logger.exception("Failed to poll for new deals")
        return

    deals = data.get("deals", [])
    if not deals:
        return

    subscribers = await storage.get_all_subscribers()
    if not subscribers:
        return

    for chat_id in subscribers:
        for deal in deals:
            deal_id = deal["id"]
            if await storage.is_deal_seen(chat_id, deal_id):
                continue

            text = f"*New Deal\\!* ✈️\n\n{format_deal_card(deal)}"
            keyboard = deal_detail_keyboard(deal)

            try:
                await context.bot.send_message(
                    chat_id=chat_id,
                    text=text,
                    parse_mode="MarkdownV2",
                    reply_markup=keyboard,
                    disable_web_page_preview=True,
                )
            except Forbidden:
                logger.info("User %d blocked the bot, removing subscriber", chat_id)
                await storage.remove_subscriber(chat_id)
                break
            except Exception:
                logger.exception("Failed to send deal notification to %d", chat_id)

            await storage.mark_deal_seen(chat_id, deal_id)
            await asyncio.sleep(0.05)  # Rate limit
