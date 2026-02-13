import logging

from telegram.ext import ApplicationBuilder, CallbackQueryHandler, CommandHandler

from config import (
    API_BASE_URL,
    BOT_TOKEN,
    POLL_NEW_DEALS_INTERVAL,
    POLL_PRICE_ALERTS_INTERVAL,
)
from api_client import FlyDealsAPI
import storage
from handlers.start import help_command, menu_callback, start_command
from handlers.deals import deal_view_callback, deals_command, deals_page_callback
from handlers.search import search_conversation_handler, search_page_callback
from handlers.destinations import destination_deals_callback, destinations_command
from handlers.alerts import alert_delete_callback, alerts_conversation_handler
from handlers.subscribe import subscribe_command, unsubscribe_command
from jobs.new_deals import check_new_deals
from jobs.price_alerts import check_price_alerts

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


async def post_init(application) -> None:
    """Initialize shared resources after Application.initialize()."""
    await storage.init_db()
    application.bot_data["api"] = FlyDealsAPI(API_BASE_URL)
    logger.info("Bot initialized, API client connected to %s", API_BASE_URL)


async def post_shutdown(application) -> None:
    """Clean up on shutdown."""
    api = application.bot_data.get("api")
    if api:
        await api.close()
    await storage.close_db()
    logger.info("Bot shut down cleanly")


def main() -> None:
    app = (
        ApplicationBuilder()
        .token(BOT_TOKEN)
        .post_init(post_init)
        .post_shutdown(post_shutdown)
        .build()
    )

    # Basic commands
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("deals", deals_command))
    app.add_handler(CommandHandler("destinations", destinations_command))
    app.add_handler(CommandHandler("subscribe", subscribe_command))
    app.add_handler(CommandHandler("unsubscribe", unsubscribe_command))

    # Conversation handlers (before generic callback handlers)
    app.add_handler(search_conversation_handler)
    app.add_handler(alerts_conversation_handler)

    # Callback query handlers
    app.add_handler(CallbackQueryHandler(menu_callback, pattern=r"^cmd:"))
    app.add_handler(CallbackQueryHandler(menu_callback, pattern=r"^noop$"))
    app.add_handler(CallbackQueryHandler(deals_page_callback, pattern=r"^deals:page:\d+$"))
    app.add_handler(CallbackQueryHandler(deal_view_callback, pattern=r"^deal:view:.+$"))
    app.add_handler(CallbackQueryHandler(search_page_callback, pattern=r"^search:page:\d+"))
    app.add_handler(CallbackQueryHandler(destination_deals_callback, pattern=r"^dest:(view|page):.+$"))
    app.add_handler(CallbackQueryHandler(alert_delete_callback, pattern=r"^alert:delete:\d+$"))

    # Background jobs
    job_queue = app.job_queue
    job_queue.run_repeating(check_new_deals, interval=POLL_NEW_DEALS_INTERVAL, first=10)
    job_queue.run_repeating(check_price_alerts, interval=POLL_PRICE_ALERTS_INTERVAL, first=30)

    # Periodic cleanup of old seen deals (daily)
    job_queue.run_repeating(
        lambda ctx: storage.cleanup_old_seen_deals(30),
        interval=86400,
        first=3600,
    )

    logger.info("Starting FlyDeals Telegram Bot...")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
