import yaml

with open('src/data/track2_fixed7.yaml') as f:
    data = yaml.safe_load(f)

track = data[0]
chs = track['chapters']

for ci, c in enumerate(chs):
    ls = c['levels']
    names = [lv['name'] for lv in ls]
    unique_names = set()
    dupe_indices = []
    for i, n in enumerate(names):
        if n in unique_names:
            dupe_indices.append(i)
        unique_names.add(n)
    
    print(f'Ch{ci+1}: {c["name"]} - {len(ls)} total, {len(unique_names)} unique, {len(dupe_indices)} dupes')
    if dupe_indices:
        # Show first and last level names
        print(f'  First 10: {names[:10]}')
        print(f'  Last: {names[-3:]}')
        # Remove duplicates - keep first occurrence of each name
        seen = set()
        unique_levels = []
        for lv in ls:
            if lv['name'] not in seen:
                seen.add(lv['name'])
                unique_levels.append(lv)
        c['levels'] = unique_levels
        print(f'  After dedup: {len(unique_levels)}')

# Total levels
total = sum(len(c['levels']) for c in chs)
print(f'\nTotal Track 2 levels after dedup: {total}')

# Write deduplicated
with open('src/data/track2_dedup.yaml', 'w', encoding='utf-8') as f:
    yaml.dump(data, f, indent=2, width=120, default_flow_style=False, sort_keys=False, allow_unicode=True)

# Verify re-parse
with open('src/data/track2_dedup.yaml', encoding='utf-8') as f:
    data2 = yaml.safe_load(f)
print('Re-parse OK' if data2 else 'Parse FAILED')

# Check if it's a tracks.js compatible format (array with 1 track, or just a track object)
print('Type:', type(data2))
if isinstance(data2, list):
    print('Len:', len(data2))
