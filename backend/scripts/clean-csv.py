#!/usr/bin/env python3
import csv

# Read the venues CSV and ensure each row has exactly 26 columns
with open('data/venues.csv', 'r', encoding='utf-8') as f:
    lines = f.readlines()

header = lines[0].strip()
cleaned_lines = [header]

for i, line in enumerate(lines[1:], start=2):
    # Count commas to determine column count
    # Expected: 25 commas (26 columns)
    parts = line.strip().split(',')
    
    # If we have exactly 26 parts, keep as is
    if len(parts) == 26:
        cleaned_lines.append(line.strip())
    else:
        print(f"Line {i}: has {len(parts)} columns, expected 26")
        # Try to fix by checking for patterns
        # This is a heuristic approach - might need manual review
        
# Write cleaned file
with open('data/venues_cleaned.csv', 'w', encoding='utf-8') as f:
    f.write('\n'.join(cleaned_lines) + '\n')

print(f"Cleaned {len(cleaned_lines)-1} venue rows")
