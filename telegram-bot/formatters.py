import re
from typing import Any

from config import FRONTEND_BASE_URL


def escape_md(text: str) -> str:
    """Escape special characters for Telegram MarkdownV2."""
    special = r"_*[]()~`>#+-=|{}.!"
    return re.sub(f"([{re.escape(special)}])", r"\\\1", str(text))


def format_deal_card(deal: dict[str, Any]) -> str:
    title = escape_md(deal["title"])
    departure = escape_md(deal["departure_city"])
    destination = escape_md(deal["destination_city"])
    currency = escape_md(deal["currency"])
    price = deal["price"]

    lines = [f"*{title}*\n"]

    # Price with savings
    original = deal.get("original_price")
    if original and original > price:
        savings = round((1 - price / original) * 100)
        lines.append(
            f"~{currency} {escape_md(str(original))}~ *{currency} {escape_md(str(price))}* "
            f"\\(Save {escape_md(str(savings))}%\\!\\)"
        )
    else:
        lines.append(f"*{currency} {escape_md(str(price))}*")

    lines.append(f"\n{escape_md('From:')} {departure}")
    lines.append(f"{escape_md('To:')} {destination}")

    if deal.get("travel_dates"):
        lines.append(f"{escape_md('Dates:')} {escape_md(deal['travel_dates'])}")

    tags = deal.get("tags", [])
    if tags:
        tag_str = " ".join(f"#{escape_md(t)}" for t in tags)
        lines.append(f"\n{tag_str}")

    if deal.get("expires_at"):
        lines.append(f"\n{escape_md('Expires:')} {escape_md(deal['expires_at'][:10])}")

    slug = deal.get("slug", "")
    site_url = f"{FRONTEND_BASE_URL}/deal/{slug}"
    affiliate = deal.get("affiliate_url", "")

    link_parts = []
    if affiliate:
        link_parts.append(f"[{escape_md('Book Now')}]({affiliate})")
    link_parts.append(f"[{escape_md('View on Site')}]({site_url})")
    lines.append("\n" + " \\| ".join(link_parts))

    return "\n".join(lines)


def format_deal_compact(deal: dict[str, Any], index: int) -> str:
    departure = escape_md(deal["departure_city"])
    destination = escape_md(deal["destination_city"])
    currency = escape_md(deal["currency"])
    price = escape_md(str(deal["price"]))
    return f"{escape_md(str(index))}\\. {departure} → {destination} \\- {currency} {price}"


def format_deal_list(
    deals: list[dict[str, Any]], page: int, total: int, limit: int
) -> str:
    if not deals:
        return escape_md("No deals found.")

    start = (page - 1) * limit + 1
    end = start + len(deals) - 1
    header = f"Showing {start}\\-{escape_md(str(end))} of {escape_md(str(total))} deals\n"

    lines = [header]
    for i, deal in enumerate(deals, start=start):
        lines.append(format_deal_compact(deal, i))

    return "\n".join(lines)


def format_destination_list(destinations: list[dict[str, Any]]) -> str:
    if not destinations:
        return escape_md("No destinations found.")

    lines = [f"*{escape_md('Popular Destinations')}*\n"]
    for i, dest in enumerate(destinations, 1):
        city = escape_md(dest["city"])
        count = escape_md(str(dest["deal_count"]))
        lines.append(f"{escape_md(str(i))}\\. {city} \\({count} deals\\)")

    return "\n".join(lines)


def format_alert(alert: dict[str, Any]) -> str:
    departure = alert.get("departure_city", "")
    destination = escape_md(alert["destination_city"])
    currency = escape_md(alert.get("currency", "EUR"))
    target = escape_md(str(alert["target_price"]))
    alert_id = escape_md(str(alert["id"]))

    if departure:
        route = f"{escape_md(departure)} → {destination}"
    else:
        route = f"Any → {destination}"

    return f"Alert \\#{alert_id}: {route}, target ≤ {currency} {target}"


def format_alert_match(alert: dict[str, Any], deal: dict[str, Any]) -> str:
    header = f"*{escape_md('Price Alert Triggered!')}* 🔔\n\n"
    alert_info = format_alert(alert)
    deal_card = format_deal_card(deal)
    return f"{header}{alert_info}\n\n{deal_card}"
