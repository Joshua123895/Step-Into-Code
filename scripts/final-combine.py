"""Clean Track 1, fix Track 2 indentation, and combine them."""
import re
import yaml

# ===== Step 1: Clean Track 1 =====
with open('src/data/tracks.yaml', 'r', encoding='utf-8') as f:
    track1_lines = f.readlines()

# Remove lines that are just "id: <number>"
# Remove "start: ''" and "start: \"\"" lines
# Remove "  id:" (chapter/track level ids too)
cleaned = []
for line in track1_lines:
    stripped = line.rstrip()
    # Remove bare id: lines (at any indent)
    if re.match(r'^\s*id:\s*\d+\s*$', stripped):
        continue
    # Remove empty start
    if re.match(r"^\s*start:\s*''\s*$", stripped) or re.match(r'^\s*start:\s*""\s*$', stripped):
        continue
    cleaned.append(line)

with open('src/data/tracks_clean.yaml', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(cleaned)
print(f'Track 1 cleaned: {len(track1_lines)} -> {len(cleaned)} lines')

# ===== Step 2: Fix Track 2 indentation =====
with open('src/data/track2_raw.yaml', 'r', encoding='utf-8') as f:
    raw = f.read()
    raw_lines = raw.split('\n')

# The track2 is a YAML list item starting with:
# - name: Python Beyond
# We need it to be at the top level (no extra indentation)
# Currently it starts at column 0

# Now fix indentation within Track 2
# We want consistent 2-space increments:
# Track item: 2 spaces for properties (but this is a top-level list item, so 0 indent)
# Wait, track2 starts with "- name: Python Beyond" at column 0
# So it's already at the right level for being appended to the track list

# Within the track:
# - Track list item: 0 spaces
# - Track properties: 2 spaces
# - Chapter list item: 4 spaces
# - Chapter properties: 6 spaces
# - Level list item: 8 spaces
# - Level properties: 10 spaces
# - Level content: 12 spaces

# The raw track2 might have inconsistent indentation inherited from the backup.
# Let's just re-dump it through PyYAML after cleaning IDs

# First, find the line with '- name: Python Beyond'
# The track2 starts at line 0 with '- name: Python Beyond'
# Full track structure is:
# - name: Python Beyond
#   slug: python-beyond
#   icon: python
#   desc: ...
#   difficulty: 2
#   chapters:
#     - name: Comprehensions
#       icon: loop
#       levels:

# Parse using PyYAML (might need to fix indentation first)
# Since this is extracted from the backup which has issues, let's try to fix:

# Strategy: normalize all indentation to 2-space increments
# Detect the base indent of each line type
fixed_lines = []
for line in raw_lines:
    stripped = line.rstrip()
    if not stripped:
        fixed_lines.append('')
        continue
    
    leading = len(stripped) - len(stripped.lstrip())
    content = stripped[leading:]
    
    # Calculate depth based on leading spaces
    # Map to the nearest 2-space increment
    # Normalize: round to nearest multiple of 2
    normalized = round(leading / 2) * 2
    
    # Special handling: for level list items (- name: at 8 spaces)
    # and level properties (obj: etc at 10 spaces)
    if content.startswith('- name:'):
        # Level list items should be at 8 spaces
        normalized = 8
    elif content.startswith('name:') and leading <= 2:
        # Chapter name within a list item... handle differently
        pass
    
    fixed_lines.append(' ' * normalized + content)

fixed_text = '\n'.join(fixed_lines)

# Now try to parse with PyYAML
try:
    data = yaml.safe_load(fixed_text)
    print(f'Track 2 parsed: {len(data)} items')
    if data and len(data) > 0:
        print(f'Track name: {data[0]["name"]}')
        total = sum(len(c['levels']) for c in data[0]['chapters'])
        print(f'Levels: {total}')
        
        # Remove id fields
        def clean_ids(obj):
            if isinstance(obj, dict):
                obj.pop('id', None)
                for v in obj.values():
                    clean_ids(v)
            elif isinstance(obj, list):
                for item in obj:
                    clean_ids(item)
        clean_ids(data[0])
        
        # Dump clean version
        clean_yaml = yaml.dump(data, default_flow_style=False, allow_unicode=True, sort_keys=False, indent=2, width=float('inf'))
        with open('src/data/track2_clean.yaml', 'w', encoding='utf-8', newline='\n') as f:
            f.write(clean_yaml)
        print('Track 2 cleaned and saved')
except Exception as e:
    print(f'Parse error: {e}')
    # Fix iteratively with more care
    print('Attempting iterative fix...')
