import json
import re

with open("scripts/deckStrings.json") as f:
    deck_strings = json.load(f)

print(f"Loaded deck strings for {len(deck_strings)} slides")
