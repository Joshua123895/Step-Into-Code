"""Extract Track 2 (Python Beyond) from backup and append to regenerated YAML."""
import yaml
import sys

# Load backup
with open('src/data/tracks.yaml.bak', 'r', encoding='utf-8') as f:
    try:
        data = yaml.safe_load(f)
    except Exception as e:
        print(f'Backup parse error: {e}')
        sys.exit(1)

if not data or len(data) < 2:
    print('Backup has less than 2 tracks')
    sys.exit(1)

track2 = data[1]
print(f'Found Track 2: {track2["name"]}')
total = sum(len(c['levels']) for c in track2['chapters'])
print(f'  Chapters: {len(track2["chapters"])}, Levels: {total}')

# Also check last level of each chapter
for ci, ch in enumerate(track2['chapters']):
    levels = ch['levels']
    last = levels[-1]
    last_has_example = 'example' in last and 'obj' not in last
    print(f'  Ch{ci+1}: {ch["name"]} - {len(levels)} levels, last has example: {last_has_example}')

# Load current YAML (regenerated)
with open('src/data/tracks.yaml', 'r', encoding='utf-8') as f:
    current = yaml.safe_load(f)

print(f'\nCurrent has {len(current)} tracks: {[t["name"] for t in current]}')

# Remove id fields from track2 data
def clean_ids(obj):
    if isinstance(obj, dict):
        obj.pop('id', None)
        for v in obj.values():
            clean_ids(v)
    elif isinstance(obj, list):
        for item in obj:
            clean_ids(item)

clean_ids(track2)

# Append track2 to current
current.append(track2)

# Dump back
out = yaml.dump(current, default_flow_style=False, allow_unicode=True, sort_keys=False, indent=2, width=float('inf'))
with open('src/data/tracks.yaml', 'w', encoding='utf-8', newline='\n') as f:
    f.write(out)

print(f'\nWritten with {len(current)} tracks')
