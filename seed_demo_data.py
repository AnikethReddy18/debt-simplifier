"""Create a realistic Goa-trip showcase dataset through the public API.

Usage:
    python seed_demo_data.py
    python seed_demo_data.py --base-url https://debt-simplifier.onrender.com
"""

import argparse
import json
import ssl
import sys
import urllib.error
import urllib.request
from datetime import datetime


PASSWORD = "GoaDemo123!"

PEOPLE = [
    ("alex", "Alex Morgan"),
    ("maya", "Maya Patel"),
    ("liam", "Liam Chen"),
    ("sofia", "Sofia Garcia"),
    ("noah", "Noah Williams"),
]

# The recipient's token is used because the API sets the authenticated user as toId.
TRANSACTIONS = [
    ("maya", "alex", 1850, "Villa booking deposit"),
    ("alex", "maya", 420, "Airport transfers"),
    ("liam", "sofia", 620, "Water sports booking"),
    ("sofia", "liam", 480, "Beach resort dinner"),
    ("noah", "alex", 920, "Scooter rentals"),
    ("maya", "noah", 760, "Breakfast supplies"),
    ("alex", "liam", 1350, "Saturday night dinner"),
    ("sofia", "maya", 540, "Beach chairs and umbrellas"),
    ("noah", "sofia", 880, "North Goa cab fare"),
    ("liam", "alex", 430, "Coffee and snacks"),
    ("maya", "liam", 2100, "Sunset cruise tickets"),
    ("alex", "sofia", 675, "Ice cream and desserts"),
    ("noah", "maya", 390, "Spice market shopping"),
    ("sofia", "alex", 730, "Fuel for scooters"),
    ("liam", "maya", 980, "Fort Aguada entry and guide"),
    ("alex", "noah", 560, "Late night food delivery"),
    ("maya", "sofia", 1450, "Final brunch"),
    ("sofia", "noah", 510, "Laundry and essentials"),
    ("noah", "liam", 840, "Photoshoot session"),
    ("liam", "noah", 1250, "Return airport cabs"),
]


class ApiError(RuntimeError):
    pass


def request_json(base_url, method, path, token=None, body=None):
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    payload = None
    if body is not None:
        payload = json.dumps(body).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(
        f"{base_url.rstrip('/')}{path}",
        data=payload,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(request, context=ssl.create_default_context()) as response:
            raw = response.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        raise ApiError(f"{method} {path} failed ({error.code}): {details}") from error
    except urllib.error.URLError as error:
        raise ApiError(f"Could not reach {base_url}: {error.reason}") from error


def signup_users(base_url):
    run_id = datetime.now().strftime("%Y%m%d%H%M%S")
    sessions = {}
    for key, name in PEOPLE:
        email = f"{key}.goa.{run_id}@example.com"
        response = request_json(
            base_url,
            "POST",
            "/auth/signup",
            body={"name": name, "email": email, "password": PASSWORD},
        )
        sessions[key] = {
            "name": name,
            "email": email,
            "token": response["token"],
            "user": response["user"],
        }
    return sessions


def create_showcase_data(base_url):
    sessions = signup_users(base_url)
    alex = sessions["alex"]
    group = request_json(
        base_url,
        "POST",
        "/groups",
        token=alex["token"],
        body={"name": "Goa Trip - October 2026"},
    )

    for key, session in sessions.items():
        if key != "alex":
            request_json(
                base_url,
                "POST",
                f"/groups/{group['id']}/members",
                token=session["token"],
            )

    for payer, recipient, amount, description in TRANSACTIONS:
        request_json(
            base_url,
            "POST",
            f"/groups/{group['id']}/pending-transactions",
            token=sessions[recipient]["token"],
            body={
                "amount": amount,
                "description": description,
                "fromId": sessions[payer]["user"]["id"],
            },
        )

    print("Demo data created successfully.")
    print(f"Group: {group['name']}")
    print(f"Group ID: {group['id']}")
    print(f"Created {len(PEOPLE)} users and {len(TRANSACTIONS)} pending transactions.")
    print("\nUse this account to showcase the frontend:")
    print(f"Email:    {alex['email']}")
    print(f"Password: {PASSWORD}")
    print("\nBalance directions represented:")
    for key, session in sessions.items():
        incoming = sum(amount for payer, recipient, amount, _ in TRANSACTIONS if recipient == key)
        outgoing = sum(amount for payer, recipient, amount, _ in TRANSACTIONS if payer == key)
        print(f"- {session['name']}: receives {incoming}, owes {outgoing}, net {incoming - outgoing}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default="https://debt-simplifier.onrender.com",
        help="Backend URL (default: https://debt-simplifier.onrender.com)",
    )
    args = parser.parse_args()
    try:
        create_showcase_data(args.base_url)
    except (ApiError, KeyError) as error:
        print(f"Unable to create demo data: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
