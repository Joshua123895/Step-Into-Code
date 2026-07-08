import yaml

with open('src/data/track2_raw.yaml', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix only chapters 4-7 (lines 835-2396, 0-indexed 834-2396)
fix_start = 834
fix_end = 2397

fixes = 0
i = fix_start
while i < fix_end:
    l = lines[i].rstrip()
    if not l:
        i += 1
        continue
    leading = len(l) - len(l.lstrip())
    content = l.lstrip()

    # Case A: level at 9 spaces -> fix to 8
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
                lines[i] = ' ' * new_lead + cur_content + '\n'
                fixes += 1
            i += 1
        continue

    # Case B: level at 8, but its FIRST property at 9 -> fix property to 10
    if content.startswith('- name:') and leading == 8:
        # Check next non-empty line to see if first property is at 9
        j = i + 1
        prop_is_at_9 = False
        while j < fix_end:
            nxt = lines[j].rstrip()
            if not nxt:
                j += 1
                continue
            nxt_lead = len(nxt) - len(nxt.lstrip())
            nxt_content = nxt.lstrip()
            # Stop if next level
            if nxt_lead <= 8 and nxt_content.startswith('- name:'):
                break
            # If first non-empty, non-level line has indent 9, it's the case B
            if nxt_lead == 9 and not nxt_content.startswith('- '):
                prop_is_at_9 = True
                break
            break  # Not case B
        if prop_is_at_9:
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
                    new_lead = cur_lead + 1
                    lines[i] = ' ' * new_lead + cur_content + '\n'
                    fixes += 1
                i += 1
            continue

    i += 1

print(f'Fixed {fixes} lines')

# Write and verify
with open('src/data/track2_fixed5.yaml', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)

with open('src/data/track2_fixed5.yaml') as f:
    data = yaml.safe_load(f)
print('Parsed OK')
track = data[0]
print('Track:', track['name'])
chs = track['chapters']
for ci, c in enumerate(chs):
    ls = c['levels']
    print(f'Ch{ci+1}: {c["name"]} - {len(ls)} levels')
