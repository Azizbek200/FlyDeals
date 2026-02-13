from telegram import Update
from telegram.ext import ContextTypes

from keyboards import main_menu_keyboard

WELCOME_TEXT = (
    "Welcome to *FlyDeals Bot*\\! ✈️\n\n"
    "Find the best flight deals directly in Telegram\\.\n\n"
    "*Commands:*\n"
    "/deals \\- Browse latest deals\n"
    "/search \\- Search for specific deals\n"
    "/destinations \\- Popular destinations\n"
    "/alert \\- Set up price alerts\n"
    "/subscribe \\- Get new deal notifications\n"
    "/unsubscribe \\- Stop notifications\n"
    "/help \\- Show this message"
)


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        WELCOME_TEXT,
        parse_mode="MarkdownV2",
        reply_markup=main_menu_keyboard(),
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text(
        WELCOME_TEXT,
        parse_mode="MarkdownV2",
        reply_markup=main_menu_keyboard(),
    )


async def menu_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle main menu button presses."""
    query = update.callback_query
    await query.answer()

    data = query.data
    if data == "cmd:deals":
        from handlers.deals import _send_deals_page
        await _send_deals_page(query, context, page=1)
    elif data == "cmd:search":
        await query.message.reply_text(
            "Use /search to start searching for deals\\.",
            parse_mode="MarkdownV2",
        )
    elif data == "cmd:destinations":
        from handlers.destinations import _send_destinations
        await _send_destinations(query, context)
    elif data == "cmd:alerts":
        await query.message.reply_text(
            "Use /alert to manage your price alerts\\.",
            parse_mode="MarkdownV2",
        )
    elif data == "cmd:subscribe":
        from handlers.subscribe import _toggle_subscribe
        await _toggle_subscribe(update, context)
    elif data == "noop":
        pass
