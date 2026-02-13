import aiosqlite
from config import DB_PATH

_db: aiosqlite.Connection | None = None


async def get_db() -> aiosqlite.Connection:
    global _db
    if _db is None:
        _db = await aiosqlite.connect(DB_PATH)
        _db.row_factory = aiosqlite.Row
    return _db


async def init_db() -> None:
    db = await get_db()
    await db.executescript("""
        CREATE TABLE IF NOT EXISTS subscribers (
            chat_id INTEGER PRIMARY KEY,
            subscribed_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS seen_deals (
            chat_id INTEGER,
            deal_id INTEGER,
            notified_at TEXT DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (chat_id, deal_id)
        );
        CREATE TABLE IF NOT EXISTS chat_email_map (
            chat_id INTEGER PRIMARY KEY,
            email TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS chat_alerts (
            chat_id INTEGER,
            alert_id INTEGER,
            PRIMARY KEY (chat_id, alert_id)
        );
        CREATE TABLE IF NOT EXISTS alert_notified_deals (
            chat_id INTEGER,
            alert_id INTEGER,
            deal_id INTEGER,
            notified_at TEXT DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (chat_id, alert_id, deal_id)
        );
    """)
    await db.commit()


async def close_db() -> None:
    global _db
    if _db:
        await _db.close()
        _db = None


# --- Subscribers ---

async def add_subscriber(chat_id: int) -> None:
    db = await get_db()
    await db.execute(
        "INSERT OR IGNORE INTO subscribers (chat_id) VALUES (?)", (chat_id,)
    )
    await db.commit()


async def remove_subscriber(chat_id: int) -> None:
    db = await get_db()
    await db.execute("DELETE FROM subscribers WHERE chat_id = ?", (chat_id,))
    await db.commit()


async def get_all_subscribers() -> list[int]:
    db = await get_db()
    cursor = await db.execute("SELECT chat_id FROM subscribers")
    rows = await cursor.fetchall()
    return [row[0] for row in rows]


async def is_subscriber(chat_id: int) -> bool:
    db = await get_db()
    cursor = await db.execute(
        "SELECT 1 FROM subscribers WHERE chat_id = ?", (chat_id,)
    )
    return await cursor.fetchone() is not None


# --- Seen Deals ---

async def is_deal_seen(chat_id: int, deal_id: int) -> bool:
    db = await get_db()
    cursor = await db.execute(
        "SELECT 1 FROM seen_deals WHERE chat_id = ? AND deal_id = ?",
        (chat_id, deal_id),
    )
    return await cursor.fetchone() is not None


async def mark_deal_seen(chat_id: int, deal_id: int) -> None:
    db = await get_db()
    await db.execute(
        "INSERT OR IGNORE INTO seen_deals (chat_id, deal_id) VALUES (?, ?)",
        (chat_id, deal_id),
    )
    await db.commit()


# --- Email Mapping ---

async def get_or_create_email(chat_id: int) -> str:
    db = await get_db()
    cursor = await db.execute(
        "SELECT email FROM chat_email_map WHERE chat_id = ?", (chat_id,)
    )
    row = await cursor.fetchone()
    if row:
        return row[0]
    email = f"tg_{chat_id}@flydeals.bot"
    await db.execute(
        "INSERT INTO chat_email_map (chat_id, email) VALUES (?, ?)",
        (chat_id, email),
    )
    await db.commit()
    return email


# --- Alert Tracking ---

async def save_alert(chat_id: int, alert_id: int) -> None:
    db = await get_db()
    await db.execute(
        "INSERT OR IGNORE INTO chat_alerts (chat_id, alert_id) VALUES (?, ?)",
        (chat_id, alert_id),
    )
    await db.commit()


async def delete_alert(chat_id: int, alert_id: int) -> None:
    db = await get_db()
    await db.execute(
        "DELETE FROM chat_alerts WHERE chat_id = ? AND alert_id = ?",
        (chat_id, alert_id),
    )
    await db.execute(
        "DELETE FROM alert_notified_deals WHERE chat_id = ? AND alert_id = ?",
        (chat_id, alert_id),
    )
    await db.commit()


async def get_chats_with_alerts() -> list[tuple[int, str]]:
    db = await get_db()
    cursor = await db.execute("""
        SELECT DISTINCT ca.chat_id, cem.email
        FROM chat_alerts ca
        JOIN chat_email_map cem ON ca.chat_id = cem.chat_id
    """)
    rows = await cursor.fetchall()
    return [(row[0], row[1]) for row in rows]


async def is_alert_deal_notified(
    chat_id: int, alert_id: int, deal_id: int
) -> bool:
    db = await get_db()
    cursor = await db.execute(
        "SELECT 1 FROM alert_notified_deals WHERE chat_id = ? AND alert_id = ? AND deal_id = ?",
        (chat_id, alert_id, deal_id),
    )
    return await cursor.fetchone() is not None


async def mark_alert_deal_notified(
    chat_id: int, alert_id: int, deal_id: int
) -> None:
    db = await get_db()
    await db.execute(
        "INSERT OR IGNORE INTO alert_notified_deals (chat_id, alert_id, deal_id) VALUES (?, ?, ?)",
        (chat_id, alert_id, deal_id),
    )
    await db.commit()


async def cleanup_old_seen_deals(days: int = 30) -> None:
    db = await get_db()
    await db.execute(
        "DELETE FROM seen_deals WHERE notified_at < datetime('now', ?)",
        (f"-{days} days",),
    )
    await db.commit()
