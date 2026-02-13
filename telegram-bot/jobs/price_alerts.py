import asyncio
import logging

from telegram.error import Forbidden
from telegram.ext import ContextTypes

from api_client import FlyDealsAPI
from formatters import format_alert_match
from keyboards import deal_detail_keyboard
import storage

logger = logging.getLogger(__name__)


async def check_price_alerts(context: ContextTypes.DEFAULT_TYPE) -> None:
    """Check deals against user price alerts and notify on matches."""
    api: FlyDealsAPI = context.bot_data["api"]

    chats_with_alerts = await storage.get_chats_with_alerts()
    if not chats_with_alerts:
        return

    for chat_id, email in chats_with_alerts:
        try:
            alerts = await api.get_price_alerts(email)
        except Exception:
            logger.exception("Failed to fetch alerts for %s", email)
            continue

        for alert in alerts:
            try:
                data = await api.get_deals(
                    destination=alert.get("destination_city"),
                    departure=alert.get("departure_city") or None,
                    max_price=alert.get("target_price"),
                    limit=5,
                    sort="price_asc",
                )
            except Exception:
                logger.exception("Failed to query deals for alert %d", alert["id"])
                continue

            for deal in data.get("deals", []):
                if await storage.is_alert_deal_notified(chat_id, alert["id"], deal["id"]):
                    continue

                text = format_alert_match(alert, deal)
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
                    logger.info("User %d blocked bot, removing subscriber", chat_id)
                    await storage.remove_subscriber(chat_id)
                    break
                except Exception:
                    logger.exception(
                        "Failed to send alert match to %d", chat_id
                    )

                await storage.mark_alert_deal_notified(
                    chat_id, alert["id"], deal["id"]
                )
                await asyncio.sleep(0.05)  # Rate limit
