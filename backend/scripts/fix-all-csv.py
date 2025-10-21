#!/usr/bin/env python3
import csv
import sys

# Fix venues CSV
with open('data/venues.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    rows = list(reader)

# Write back with proper quoting
with open('data/venues_fixed.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    for row in rows:
        if len(row) == 26:
            writer.writerow(row)
        else:
            print(f"Skipping venue row with {len(row)} columns: {row[0] if row else 'empty'}")

# Fix activities CSV
with open('data/activities.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    rows = list(reader)

with open('data/activities_fixed.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    for row in rows:
        if len(row) == 29:
            writer.writerow(row)
        else:
            print(f"Skipping activity row with {len(row)} columns: {row[0] if row else 'empty'}")

print("\n✅ CSV files fixed")
