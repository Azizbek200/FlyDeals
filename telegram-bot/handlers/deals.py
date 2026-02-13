import logging

from telegram import Update
from telegram.ext import ContextTypes

from api_client import FlyDealsAPI
from config import DEALS_PER_PAGE
from formatters import format_deal_card, format_deal_list
from keyboards import deal_detail_keyboard, deals_pagination_keyboard

logger = logging.getLogger(__name__)


def _get_api(context: ContextTypes.DEFAULT_TYPE) -> FlyDealsAPI:
    return context.bot_data["api"]


async def _send_deals_page(
    query_or_message, context: ContextTypes.DEFAULT_TYPE, page: int
) -> None:
    api = _get_api(context)
    try:
        data = await api.get_deals(page=page, limit=DEALS_PER_PAGE, sort="newest")
    except Exception:
        logger.exception("Failed to fetch deals")
        text = "Sorry, couldn't fetch deals right now\\. Please try again later\\."
        if hasattr(query_or_message, "edit_message_text"):
            await query_or_message.edit_message_text(text, parse_mode="MarkdownV2")
        else:
            await query_or_message.reply_text(text, parse_mode="MarkdownV2")
        return

    deals = data.get("deals", [])
    total = data.get("total", 0)
    text = format_deal_list(deals, page, total, DEALS_PER_PAGE)
    keyboard = deals_pagination_keyboard(deals, page, total, DEALS_PER_PAGE)

    if hasattr(query_or_message, "edit_message_text"):
        await query_or_message.edit_message_text(
            text, parse_mode="MarkdownV2", reply_markup=keyboard
        )
    else:
        await query_or_message.reply_text(
            text, parse_mode="MarkdownV2", reply_markup=keyboard
        )


async def deals_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await _send_deals_page(update.message, context, page=1)


async def deals_page_callback(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    query = update.callback_query
    await query.answer()
    page = int(query.data.split(":")[-1])
    await _send_deals_page(query, context, page=page)


async def deal_view_callback(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    query = update.callback_query
    await query.answer()
    slug = query.data.split(":", 2)[-1]

    api = _get_api(context)
    try:
        deal = await api.get_deal(slug)
        await api.track_click(slug)
    except Exception:
        logger.exception("Failed to fetch deal %s", slug)
        await query.edit_message_text(
            "Sorry, couldn't load this deal\\.",
            parse_mode="MarkdownV2",
        )
        return

    text = format_deal_card(deal)
    keyboard = deal_detail_keyboard(deal)
    await query.edit_message_text(
        text,
        parse_mode="MarkdownV2",
        reply_markup=keyboard,
        disable_web_page_preview=True,
    )
