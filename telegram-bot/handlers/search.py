import logging

from telegram import Update
from telegram.ext import (
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

from api_client import FlyDealsAPI
from config import DEALS_PER_PAGE
from formatters import escape_md, format_deal_list
from keyboards import deals_pagination_keyboard, search_type_keyboard

logger = logging.getLogger(__name__)

CHOOSE_TYPE, ENTER_QUERY, ENTER_DEPARTURE, ENTER_DESTINATION, ENTER_MIN, ENTER_MAX = range(6)


def _get_api(context: ContextTypes.DEFAULT_TYPE) -> FlyDealsAPI:
    return context.bot_data["api"]


async def search_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["search"] = {}
    await update.message.reply_text(
        "How would you like to search?",
        reply_markup=search_type_keyboard(),
    )
    return CHOOSE_TYPE


async def search_type_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    search_type = query.data.split(":")[-1]
    context.user_data["search"]["type"] = search_type

    if search_type == "text":
        await query.edit_message_text("Enter your search query (city, destination, or keyword):")
        return ENTER_QUERY
    elif search_type == "route":
        await query.edit_message_text("Enter departure city (or send /skip):")
        return ENTER_DEPARTURE
    elif search_type == "price":
        await query.edit_message_text("Enter minimum price (or send /skip):")
        return ENTER_MIN

    return ConversationHandler.END


async def enter_query(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["search"]["q"] = update.message.text.strip()
    return await _do_search(update, context)


async def enter_departure(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text.strip()
    if text.lower() != "/skip":
        context.user_data["search"]["departure"] = text
    await update.message.reply_text("Enter destination city (or send /skip):")
    return ENTER_DESTINATION


async def enter_destination(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text.strip()
    if text.lower() != "/skip":
        context.user_data["search"]["destination"] = text
    return await _do_search(update, context)


async def enter_min_price(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text.strip()
    if text.lower() != "/skip":
        try:
            context.user_data["search"]["min_price"] = int(text)
        except ValueError:
            await update.message.reply_text("Please enter a valid number or /skip:")
            return ENTER_MIN
    await update.message.reply_text("Enter maximum price (or send /skip):")
    return ENTER_MAX


async def enter_max_price(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text.strip()
    if text.lower() != "/skip":
        try:
            context.user_data["search"]["max_price"] = int(text)
        except ValueError:
            await update.message.reply_text("Please enter a valid number or /skip:")
            return ENTER_MAX
    return await _do_search(update, context)


async def _do_search(
    update: Update, context: ContextTypes.DEFAULT_TYPE, page: int = 1
) -> int:
    params = context.user_data.get("search", {})
    api = _get_api(context)

    try:
        data = await api.get_deals(
            page=page,
            limit=DEALS_PER_PAGE,
            q=params.get("q"),
            departure=params.get("departure"),
            destination=params.get("destination"),
            min_price=params.get("min_price"),
            max_price=params.get("max_price"),
            sort="price_asc",
        )
    except Exception:
        logger.exception("Search failed")
        await update.message.reply_text("Search failed. Please try again later.")
        return ConversationHandler.END

    deals = data.get("deals", [])
    total = data.get("total", 0)
    text = format_deal_list(deals, page, total, DEALS_PER_PAGE)
    keyboard = deals_pagination_keyboard(deals, page, total, DEALS_PER_PAGE, prefix="search")

    # Build search summary
    summary_parts = []
    if params.get("q"):
        summary_parts.append(f"query: {escape_md(params['q'])}")
    if params.get("departure"):
        summary_parts.append(f"from: {escape_md(params['departure'])}")
    if params.get("destination"):
        summary_parts.append(f"to: {escape_md(params['destination'])}")
    if params.get("min_price") is not None:
        summary_parts.append(f"min: {escape_md(str(params['min_price']))}")
    if params.get("max_price") is not None:
        summary_parts.append(f"max: {escape_md(str(params['max_price']))}")

    summary = ", ".join(summary_parts) if summary_parts else "all deals"
    header = f"*Search:* {summary}\n\n"

    target = update.message if update.message else update.callback_query
    if hasattr(target, "edit_message_text"):
        await target.edit_message_text(
            header + text, parse_mode="MarkdownV2", reply_markup=keyboard
        )
    else:
        await target.reply_text(
            header + text, parse_mode="MarkdownV2", reply_markup=keyboard
        )

    return ConversationHandler.END


async def search_page_callback(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    query = update.callback_query
    await query.answer()
    page = int(query.data.split(":")[2])

    params = context.user_data.get("search", {})
    api = _get_api(context)

    try:
        data = await api.get_deals(
            page=page,
            limit=DEALS_PER_PAGE,
            q=params.get("q"),
            departure=params.get("departure"),
            destination=params.get("destination"),
            min_price=params.get("min_price"),
            max_price=params.get("max_price"),
            sort="price_asc",
        )
    except Exception:
        logger.exception("Search pagination failed")
        await query.edit_message_text("Failed to load results. Try /search again.")
        return

    deals = data.get("deals", [])
    total = data.get("total", 0)
    text = format_deal_list(deals, page, total, DEALS_PER_PAGE)
    keyboard = deals_pagination_keyboard(deals, page, total, DEALS_PER_PAGE, prefix="search")

    await query.edit_message_text(
        text, parse_mode="MarkdownV2", reply_markup=keyboard
    )


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data.pop("search", None)
    await update.message.reply_text("Search cancelled.")
    return ConversationHandler.END


search_conversation_handler = ConversationHandler(
    entry_points=[CommandHandler("search", search_start)],
    states={
        CHOOSE_TYPE: [CallbackQueryHandler(search_type_chosen, pattern=r"^search:type:")],
        ENTER_QUERY: [MessageHandler(filters.TEXT & ~filters.COMMAND, enter_query)],
        ENTER_DEPARTURE: [
            MessageHandler(filters.TEXT & ~filters.COMMAND, enter_departure),
            CommandHandler("skip", enter_departure),
        ],
        ENTER_DESTINATION: [
            MessageHandler(filters.TEXT & ~filters.COMMAND, enter_destination),
            CommandHandler("skip", enter_destination),
        ],
        ENTER_MIN: [
            MessageHandler(filters.TEXT & ~filters.COMMAND, enter_min_price),
            CommandHandler("skip", enter_min_price),
        ],
        ENTER_MAX: [
            MessageHandler(filters.TEXT & ~filters.COMMAND, enter_max_price),
            CommandHandler("skip", enter_max_price),
        ],
    },
    fallbacks=[CommandHandler("cancel", cancel)],
)
