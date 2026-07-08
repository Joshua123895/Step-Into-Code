import yaml
import sys

with open('src/data/track2_fixed.yaml', 'r', encoding='utf-8') as f:
    data = yaml.safe_load(f)

print('Parsed:', type(data).__name__)
if isinstance(data, list):
    print('Items:', len(data))
    for item in data:
        if isinstance(item, dict):
            print('Track:', item.get('name', '?'))
            chapters = item.get('chapters', [])
            total = sum(len(c.get('levels', [])) for c in chapters)
            print('  Chapters:', len(chapters), 'Levels:', total)
            for ci, c in enumerate(chapters):
                last = c['levels'][-1]
                last_has_example = 'example' in last and 'obj' not in last
                print(f'  Ch{ci+1}: {c["name"]} - {len(c["levels"])} levels, last has example: {last_has_example}')
