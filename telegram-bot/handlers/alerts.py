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
from formatters import escape_md, format_alert
from keyboards import alerts_list_keyboard, confirm_keyboard
import storage

logger = logging.getLogger(__name__)

CHOOSE_ACTION, ENTER_DEST, ENTER_DEPART, ENTER_PRICE, CONFIRM = range(5)


def _get_api(context: ContextTypes.DEFAULT_TYPE) -> FlyDealsAPI:
    return context.bot_data["api"]


async def alert_start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["alert"] = {}
    from telegram import InlineKeyboardButton, InlineKeyboardMarkup

    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("➕ Create new alert", callback_data="alert:action:create")],
        [InlineKeyboardButton("📋 My alerts", callback_data="alert:action:list")],
    ])
    await update.message.reply_text(
        "What would you like to do?", reply_markup=keyboard
    )
    return CHOOSE_ACTION


async def action_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()
    action = query.data.split(":")[-1]

    if action == "create":
        await query.edit_message_text("Enter the *destination city*:", parse_mode="MarkdownV2")
        return ENTER_DEST
    elif action == "list":
        return await _show_alerts(query, context)

    return ConversationHandler.END


async def _show_alerts(query, context: ContextTypes.DEFAULT_TYPE) -> int:
    chat_id = query.message.chat_id
    api = _get_api(context)

    email = await storage.get_or_create_email(chat_id)
    try:
        alerts = await api.get_price_alerts(email)
    except Exception:
        logger.exception("Failed to fetch alerts")
        await query.edit_message_text("Failed to load your alerts. Try again later.")
        return ConversationHandler.END

    if not alerts:
        await query.edit_message_text(
            "You have no price alerts\\. Use /alert to create one\\!",
            parse_mode="MarkdownV2",
        )
        return ConversationHandler.END

    lines = ["*Your Price Alerts*\n"]
    for alert in alerts:
        lines.append(format_alert(alert))

    text = "\n".join(lines)
    keyboard = alerts_list_keyboard(alerts)

    await query.edit_message_text(
        text, parse_mode="MarkdownV2", reply_markup=keyboard
    )
    return ConversationHandler.END


async def enter_dest(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data["alert"]["destination"] = update.message.text.strip()
    await update.message.reply_text(
        "Enter *departure city* \\(or send /skip\\):",
        parse_mode="MarkdownV2",
    )
    return ENTER_DEPART


async def enter_depart(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text.strip()
    if text.lower() != "/skip":
        context.user_data["alert"]["departure"] = text
    await update.message.reply_text(
        "Enter your *target price* \\(in EUR\\):",
        parse_mode="MarkdownV2",
    )
    return ENTER_PRICE


async def enter_price(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    text = update.message.text.strip()
    try:
        price = int(text)
    except ValueError:
        await update.message.reply_text("Please enter a valid number:")
        return ENTER_PRICE

    alert_data = context.user_data["alert"]
    alert_data["price"] = price

    dest = escape_md(alert_data["destination"])
    departure = escape_md(alert_data.get("departure", "Any"))
    price_str = escape_md(str(price))

    summary = (
        f"*Confirm alert:*\n\n"
        f"Route: {departure} → {dest}\n"
        f"Notify when price ≤ EUR {price_str}"
    )
    await update.message.reply_text(
        summary, parse_mode="MarkdownV2", reply_markup=confirm_keyboard()
    )
    return CONFIRM


async def confirm_alert(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    query = update.callback_query
    await query.answer()

    if query.data == "confirm:no":
        context.user_data.pop("alert", None)
        await query.edit_message_text("Alert creation cancelled.")
        return ConversationHandler.END

    alert_data = context.user_data.get("alert", {})
    chat_id = query.message.chat_id
    api = _get_api(context)

    email = await storage.get_or_create_email(chat_id)
    try:
        result = await api.create_price_alert(
            email=email,
            destination_city=alert_data["destination"],
            target_price=alert_data["price"],
            departure_city=alert_data.get("departure", ""),
        )
        alert_id = result.get("id")
        if alert_id:
            await storage.save_alert(chat_id, alert_id)
    except Exception:
        logger.exception("Failed to create alert")
        await query.edit_message_text("Failed to create alert. Please try again.")
        return ConversationHandler.END

    context.user_data.pop("alert", None)
    await query.edit_message_text(
        "✅ Alert created\\! I'll notify you when a matching deal appears\\.",
        parse_mode="MarkdownV2",
    )
    return ConversationHandler.END


async def alert_delete_callback(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    query = update.callback_query
    await query.answer()

    alert_id = int(query.data.split(":")[-1])
    chat_id = query.message.chat_id
    api = _get_api(context)

    try:
        await api.delete_price_alert(alert_id)
        await storage.delete_alert(chat_id, alert_id)
    except Exception:
        logger.exception("Failed to delete alert %d", alert_id)
        await query.answer("Failed to delete alert.", show_alert=True)
        return

    await query.edit_message_text(
        f"Alert \\#{escape_md(str(alert_id))} deleted\\.",
        parse_mode="MarkdownV2",
    )


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    context.user_data.pop("alert", None)
    await update.message.reply_text("Alert setup cancelled.")
    return ConversationHandler.END


alerts_conversation_handler = ConversationHandler(
    entry_points=[CommandHandler("alert", alert_start)],
    states={
        CHOOSE_ACTION: [
            CallbackQueryHandler(action_chosen, pattern=r"^alert:action:"),
        ],
        ENTER_DEST: [MessageHandler(filters.TEXT & ~filters.COMMAND, enter_dest)],
        ENTER_DEPART: [
            MessageHandler(filters.TEXT & ~filters.COMMAND, enter_depart),
            CommandHandler("skip", enter_depart),
        ],
        ENTER_PRICE: [MessageHandler(filters.TEXT & ~filters.COMMAND, enter_price)],
        CONFIRM: [CallbackQueryHandler(confirm_alert, pattern=r"^confirm:")],
    },
    fallbacks=[CommandHandler("cancel", cancel)],
)
