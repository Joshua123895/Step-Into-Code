import yaml
with open('src/data/track2_fixed7.yaml') as f:
    data = yaml.safe_load(f)
print('Type:', type(data))
print('Len:', len(data))
t = data[0]
print('Track name:', t['name'])
print('Keys:', list(t.keys()))
ch = t['chapters']
print('Chapters type:', type(ch))
print('Chapters len:', len(ch))
for ci, c in enumerate(ch):
    cn = c['name']
    print('Ch' + str(ci+1) + ': ' + cn + ' - ' + str(len(c['levels'])) + ' levels')
    if ci == 0:
        print('  Level names:', [lv['name'] for lv in c['levels']])
