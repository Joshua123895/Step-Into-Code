import yaml

data = yaml.safe_load(open('src/data/tracks/python-beyond.yaml', encoding='utf-8'))
print(f'Track: {data["name"]}')
print(f'Chapters: {len(data["chapters"])}')
for i, ch in enumerate(data['chapters']):
    print(f'  Ch{i}: {ch["name"]} - {len(ch["levels"])} levels')
    for j, lv in enumerate(ch['levels']):
        has_hint = 'hint' in lv
        has_expl = 'expl' in lv
        has_example = 'example' in lv
        has_obj = 'obj' in lv
        has_tests = 'tests' in lv
        print(f'    Lv{j}: {lv["name"]} | obj={has_obj} hint={has_hint} expl={has_expl} example={has_example} tests={has_tests}')
