import yaml

# Load Track 1
with open('src/data/tracks.yaml', encoding='utf-8') as f:
    track1_data = yaml.safe_load(f)

# Load Track 2
with open('src/data/track2_dedup.yaml', encoding='utf-8') as f:
    track2_data = yaml.safe_load(f)

print('Track 1:', track1_data[0]['name'], '-', sum(len(c['levels']) for c in track1_data[0]['chapters']), 'levels')
print('Track 2:', track2_data[0]['name'], '-', sum(len(c['levels']) for c in track2_data[0]['chapters']), 'levels')

# Combine
combined = track1_data + track2_data

# Write combined
with open('src/data/tracks_combined.yaml', 'w', encoding='utf-8') as f:
    yaml.dump(combined, f, indent=2, width=120, default_flow_style=False, sort_keys=False, allow_unicode=True)

print('Written tracks_combined.yaml')

# Verify re-parse
with open('src/data/tracks_combined.yaml', encoding='utf-8') as f:
    data = yaml.safe_load(f)
print('Re-parse OK')
for t in data:
    total = sum(len(c['levels']) for c in t['chapters'])
    print(f'  {t["name"]}: {len(t["chapters"])} chapters, {total} levels')
