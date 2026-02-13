import math
from typing import Any

from telegram import InlineKeyboardButton, InlineKeyboardMarkup


def main_menu_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("Browse Deals", callback_data="cmd:deals")],
        [InlineKeyboardButton("Search Deals", callback_data="cmd:search")],
        [InlineKeyboardButton("Destinations", callback_data="cmd:destinations")],
        [
            InlineKeyboardButton("My Alerts", callback_data="cmd:alerts"),
            InlineKeyboardButton("Subscribe", callback_data="cmd:subscribe"),
        ],
    ])


def deals_pagination_keyboard(
    deals: list[dict[str, Any]],
    page: int,
    total: int,
    limit: int,
    prefix: str = "deals",
) -> InlineKeyboardMarkup:
    total_pages = math.ceil(total / limit) if total > 0 else 1
    rows: list[list[InlineKeyboardButton]] = []

    # Deal buttons (view detail)
    start = (page - 1) * limit + 1
    deal_buttons = []
    for i, deal in enumerate(deals, start=start):
        deal_buttons.append(
            InlineKeyboardButton(str(i), callback_data=f"deal:view:{deal['slug']}")
        )
    if deal_buttons:
        rows.append(deal_buttons)

    # Navigation
    nav = []
    if page > 1:
        nav.append(InlineKeyboardButton("◀ Prev", callback_data=f"{prefix}:page:{page - 1}"))
    nav.append(InlineKeyboardButton(f"{page}/{total_pages}", callback_data="noop"))
    if page < total_pages:
        nav.append(InlineKeyboardButton("Next ▶", callback_data=f"{prefix}:page:{page + 1}"))
    rows.append(nav)

    return InlineKeyboardMarkup(rows)


def deal_detail_keyboard(deal: dict[str, Any]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []

    affiliate = deal.get("affiliate_url", "")
    if affiliate:
        rows.append([InlineKeyboardButton("Book Now", url=affiliate)])

    rows.append([InlineKeyboardButton("◀ Back to list", callback_data="deals:page:1")])

    return InlineKeyboardMarkup(rows)


def destinations_keyboard(
    destinations: list[dict[str, Any]],
) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []

    for i in range(0, len(destinations), 2):
        row = [
            InlineKeyboardButton(
                f"{destinations[i]['city']} ({destinations[i]['deal_count']})",
                callback_data=f"dest:view:{destinations[i]['city']}",
            )
        ]
        if i + 1 < len(destinations):
            row.append(
                InlineKeyboardButton(
                    f"{destinations[i+1]['city']} ({destinations[i+1]['deal_count']})",
                    callback_data=f"dest:view:{destinations[i+1]['city']}",
                )
            )
        rows.append(row)

    return InlineKeyboardMarkup(rows)


def alerts_list_keyboard(alerts: list[dict[str, Any]]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []

    for alert in alerts:
        dest = alert["destination_city"]
        price = alert["target_price"]
        currency = alert.get("currency", "EUR")
        rows.append([
            InlineKeyboardButton(
                f"❌ {dest} ≤ {currency} {price}",
                callback_data=f"alert:delete:{alert['id']}",
            )
        ])

    rows.append([InlineKeyboardButton("➕ Create new alert", callback_data="alert:create")])

    return InlineKeyboardMarkup(rows)


def confirm_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("✅ Confirm", callback_data="confirm:yes"),
            InlineKeyboardButton("❌ Cancel", callback_data="confirm:no"),
        ]
    ])


def search_type_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔍 Text search", callback_data="search:type:text")],
        [InlineKeyboardButton("✈️ By route", callback_data="search:type:route")],
        [InlineKeyboardButton("💰 By price range", callback_data="search:type:price")],
    ])
