import yaml
with open('src/data/track2_fixed2.yaml', 'r', encoding='utf-8') as f:
    data = yaml.safe_load(f)

print('Parsed OK')
t = data[0]
print('Track:', t['name'])
chapters = t['chapters']
total = sum(len(c['levels']) for c in chapters)
print('Chapters:', len(chapters), 'Levels:', total)
for ci, c in enumerate(chapters):
    last = c['levels'][-1]
    last_has_example = 'example' in last and 'obj' not in last
    print(f'Ch{ci+1}: {c["name"]} - {len(c["levels"])} levels, last has example: {last_has_example}')
