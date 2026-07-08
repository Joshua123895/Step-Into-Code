import yaml
with open('src/data/track2_fixed7.yaml') as f:
    data = yaml.safe_load(f)
print('Parsed OK')
t = data[0]
print('Track:', t['name'])
for ci, c in enumerate(t['chapters']):
    cn = c['name']
    print('Ch' + str(ci+1) + ': ' + cn + ' - ' + str(len(c['levels'])) + ' levels')
