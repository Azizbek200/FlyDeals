from __future__ import annotations

import httpx
from typing import Any, Dict, List, Optional


class FlyDealsAPI:
    def __init__(self, base_url: str):
        self.client = httpx.AsyncClient(
            base_url=base_url.rstrip("/"),
            timeout=15.0,
        )

    async def get_deals(
        self,
        page: int = 1,
        limit: int = 5,
        q: Optional[str] = None,
        departure: Optional[str] = None,
        destination: Optional[str] = None,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        tag: Optional[str] = None,
        sort: str = "newest",
    ) -> Dict[str, Any]:
        params: dict[str, Any] = {"page": page, "limit": limit, "sort": sort}
        if q:
            params["q"] = q
        if departure:
            params["departure"] = departure
        if destination:
            params["destination"] = destination
        if min_price is not None:
            params["min_price"] = min_price
        if max_price is not None:
            params["max_price"] = max_price
        if tag:
            params["tag"] = tag
        resp = await self.client.get("/deals", params=params)
        resp.raise_for_status()
        return resp.json()

    async def get_deal(self, slug: str) -> dict[str, Any]:
        resp = await self.client.get(f"/deals/{slug}")
        resp.raise_for_status()
        return resp.json()

    async def track_click(self, slug: str) -> None:
        resp = await self.client.post(f"/deals/{slug}/click")
        resp.raise_for_status()

    async def get_destinations(self) -> list[dict[str, Any]]:
        resp = await self.client.get("/destinations")
        resp.raise_for_status()
        data = resp.json()
        return data.get("destinations", [])

    async def create_price_alert(
        self,
        email: str,
        destination_city: str,
        target_price: int,
        departure_city: str = "",
        currency: str = "EUR",
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "email": email,
            "destination_city": destination_city,
            "target_price": target_price,
            "currency": currency,
        }
        if departure_city:
            payload["departure_city"] = departure_city
        resp = await self.client.post("/price-alerts", json=payload)
        resp.raise_for_status()
        return resp.json()

    async def get_price_alerts(self, email: str) -> list[dict[str, Any]]:
        resp = await self.client.get("/price-alerts", params={"email": email})
        resp.raise_for_status()
        data = resp.json()
        return data.get("alerts", [])

    async def delete_price_alert(self, alert_id: int) -> None:
        resp = await self.client.delete(f"/price-alerts/{alert_id}")
        resp.raise_for_status()

    async def subscribe_newsletter(self, email: str) -> None:
        resp = await self.client.post("/subscribe", json={"email": email})
        resp.raise_for_status()

    async def close(self) -> None:
        await self.client.aclose()
