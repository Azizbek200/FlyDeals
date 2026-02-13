import logging

from telegram import Update
from telegram.ext import ContextTypes

from api_client import FlyDealsAPI
from config import DEALS_PER_PAGE
from formatters import format_deal_list, format_destination_list
from keyboards import deals_pagination_keyboard, destinations_keyboard

logger = logging.getLogger(__name__)


def _get_api(context: ContextTypes.DEFAULT_TYPE) -> FlyDealsAPI:
    return context.bot_data["api"]


async def _send_destinations(query_or_message, context: ContextTypes.DEFAULT_TYPE) -> None:
    api = _get_api(context)
    try:
        destinations = await api.get_destinations()
    except Exception:
        logger.exception("Failed to fetch destinations")
        text = "Sorry, couldn't load destinations right now\\."
        if hasattr(query_or_message, "edit_message_text"):
            await query_or_message.edit_message_text(text, parse_mode="MarkdownV2")
        else:
            await query_or_message.reply_text(text, parse_mode="MarkdownV2")
        return

    # Limit to top 20 destinations for keyboard
    top = destinations[:20]
    text = format_destination_list(top)
    keyboard = destinations_keyboard(top)

    if hasattr(query_or_message, "edit_message_text"):
        await query_or_message.edit_message_text(
            text, parse_mode="MarkdownV2", reply_markup=keyboard
        )
    else:
        await query_or_message.reply_text(
            text, parse_mode="MarkdownV2", reply_markup=keyboard
        )


async def destinations_command(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    await _send_destinations(update.message, context)


async def destination_deals_callback(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    query = update.callback_query
    await query.answer()

    parts = query.data.split(":", 2)
    city = parts[2]
    # Extract page if present (dest:view:City or dest:page:City:N)
    page = 1
    if parts[1] == "page" and len(parts) >= 4:
        city = parts[2]
        page = int(parts[3]) if len(parts) > 3 else 1

    api = _get_api(context)
    try:
        data = await api.get_deals(
            page=page, limit=DEALS_PER_PAGE, destination=city, sort="newest"
        )
    except Exception:
        logger.exception("Failed to fetch deals for %s", city)
        await query.edit_message_text(
            "Sorry, couldn't load deals for this destination\\.",
            parse_mode="MarkdownV2",
        )
        return

    deals = data.get("deals", [])
    total = data.get("total", 0)

    from formatters import escape_md
    header = f"*Deals to {escape_md(city)}*\n\n"
    text = header + format_deal_list(deals, page, total, DEALS_PER_PAGE)
    keyboard = deals_pagination_keyboard(
        deals, page, total, DEALS_PER_PAGE, prefix=f"dest:page:{city}"
    )

    await query.edit_message_text(
        text, parse_mode="MarkdownV2", reply_markup=keyboard
    )
