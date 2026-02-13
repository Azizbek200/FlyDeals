import logging

from telegram import Update
from telegram.ext import ContextTypes

import storage
from api_client import FlyDealsAPI

logger = logging.getLogger(__name__)


def _get_api(context: ContextTypes.DEFAULT_TYPE) -> FlyDealsAPI:
    return context.bot_data["api"]


async def subscribe_command(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    chat_id = update.effective_chat.id
    already = await storage.is_subscriber(chat_id)

    if already:
        await update.message.reply_text(
            "You're already subscribed\\! You'll get notified about new deals\\.",
            parse_mode="MarkdownV2",
        )
        return

    await storage.add_subscriber(chat_id)

    # Also subscribe to backend newsletter
    email = await storage.get_or_create_email(chat_id)
    try:
        api = _get_api(context)
        await api.subscribe_newsletter(email)
    except Exception:
        logger.warning("Failed to subscribe %s to backend newsletter", email)

    await update.message.reply_text(
        "✅ Subscribed\\! You'll receive notifications when new deals are posted\\.\n\n"
        "Use /unsubscribe to stop\\.",
        parse_mode="MarkdownV2",
    )


async def unsubscribe_command(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    chat_id = update.effective_chat.id
    await storage.remove_subscriber(chat_id)

    await update.message.reply_text(
        "Unsubscribed\\. You won't receive new deal notifications anymore\\.\n\n"
        "Use /subscribe to re\\-enable\\.",
        parse_mode="MarkdownV2",
    )


async def _toggle_subscribe(
    update: Update, context: ContextTypes.DEFAULT_TYPE
) -> None:
    """Called from menu button."""
    query = update.callback_query
    chat_id = query.message.chat_id
    already = await storage.is_subscriber(chat_id)

    if already:
        await storage.remove_subscriber(chat_id)
        await query.edit_message_text(
            "Unsubscribed from new deal notifications\\.",
            parse_mode="MarkdownV2",
        )
    else:
        await storage.add_subscriber(chat_id)
        email = await storage.get_or_create_email(chat_id)
        try:
            api = _get_api(context)
            await api.subscribe_newsletter(email)
        except Exception:
            logger.warning("Failed to subscribe %s to backend newsletter", email)

        await query.edit_message_text(
            "✅ Subscribed to new deal notifications\\!",
            parse_mode="MarkdownV2",
        )
