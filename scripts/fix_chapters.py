import yaml

with open('src/data/track2_raw.yaml', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Only fix chapters 4-7 (indices 3-6)
# Chapter boundaries: 7, 249, 513, 835, 1217, 1619, 2001, 2397
fix_start = 834  # 0-indexed, line 835
fix_end = 2397   # 0-indexed exclusive, chapter 8 start

fixes = 0
i = fix_start
while i < fix_end:
    l = lines[i].rstrip()
    if not l:
        i += 1
        continue
    leading = len(l) - len(l.lstrip())
    content = l.lstrip()

    # If level starts at 9 spaces (too deep by 1), fix to 8
    if content.startswith('- name:') and leading == 9:
        lines[i] = ' ' * 8 + content + '\n'
        fixes += 1
        i += 1

        while i < fix_end:
            cur = lines[i].rstrip()
            if not cur:
                i += 1
                continue
            cur_lead = len(cur) - len(cur.lstrip())
            cur_content = cur.lstrip()

            if cur_lead <= 8 and cur_content.startswith('- name:'):
                break

            if cur_lead > 0:
                new_lead = cur_lead - 1
                if new_lead < 0:
                    new_lead = 0
                lines[i] = ' ' * new_lead + cur_content + '\n'
                fixes += 1
            i += 1
        continue

    i += 1

print(f'Fixed {fixes} lines')

with open('src/data/track2_fixed4.yaml', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)

# Verify
with open('src/data/track2_fixed4.yaml') as f:
    data = yaml.safe_load(f)
print('Parsed OK')
track = data[0]
print('Track:', track['name'])
chs = track['chapters']
for ci, c in enumerate(chs):
    ls = c['levels']
    print(f'Ch{ci+1}: {c["name"]} - {len(ls)} levels')
