import yaml

with open('src/data/track2_raw.yaml', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fix_start = 834
fix_end = 2397

# Step 1: Find ALL level start lines in the fix range
level_starts = []
i = fix_start
while i < fix_end:
    l = lines[i].rstrip()
    if l.lstrip().startswith('- name:'):
        level_starts.append(i)
    i += 1

print(f'Found {len(level_starts)} levels in chapters 4-7')

# Step 2: Process each level individually
fixes = 0
for idx, start in enumerate(level_starts):
    end = level_starts[idx+1] if idx+1 < len(level_starts) else fix_end

    name_line = lines[start].rstrip()
    name_indent = len(name_line) - len(name_line.lstrip())
    # Skip chapter headers (indent 4) and track name (indent 0)
    if name_indent < 8:
        continue

    # Find first property name
    j = start + 1
    first_prop_indent = None
    first_prop_is_puzzle = False
    while j < end:
        nxt = lines[j].rstrip()
        if not nxt:
            j += 1
            continue
        nxt_lead = len(nxt) - len(nxt.lstrip())
        nxt_content = nxt.lstrip()
        first_prop_indent = nxt_lead
        first_prop_is_puzzle = nxt_content in ('example:', 'tests:')
        break

    if first_prop_indent is None:
        continue

    target_name_indent = 8
    target_prop_indent = 10

    name_correction = target_name_indent - name_indent  # 0 if 8, -1 if 9

    if first_prop_is_puzzle:
        prop_correction = target_prop_indent - first_prop_indent  # +1 if from 9, +2 if from 8
    else:
        prop_correction = target_prop_indent - first_prop_indent  # -1 if from 11, 0 if from 10

    # Fix name line
    if name_correction != 0:
        lines[start] = ' ' * target_name_indent + name_line.lstrip() + '\n'
        fixes += 1

    # Fix children (lines after name, before next level)
    for j in range(start + 1, end):
        cur = lines[j].rstrip()
        if not cur:
            continue
        cur_lead = len(cur) - len(cur.lstrip())
        if cur_lead > 0:
            new_lead = cur_lead + prop_correction
            if new_lead < 0:
                new_lead = 0
            lines[j] = ' ' * new_lead + cur.lstrip() + '\n'
            fixes += 1

print(f'Fixed {fixes} lines')

with open('src/data/track2_fixed7.yaml', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)

# Verify
with open('src/data/track2_fixed7.yaml') as f:
    data = yaml.safe_load(f)
print('Parsed OK')
track = data[0]
print('Track:', track['name'])
chs = track['chapters']
for ci, c in enumerate(chs):
    ls = c['levels']
    cn = c['name']
    print(f'Ch{ci+1}: {cn} - {len(ls)} levels')
