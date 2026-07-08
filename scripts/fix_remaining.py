import yaml

with open('src/data/track2_fixed7.yaml', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix all expl: lines at 11 spaces to 10 (relative to level at 8, props at 10)
# This only applies in chapters 4-7 where we applied correction
fix_start = 834  # 0-indexed
fix_end = 2397

fixes_before = 0
fixes_after = 0

# Strategy: for each level, find property indent majority, fix outliers
level_starts = []
i = fix_start
while i < fix_end:
    l = lines[i].rstrip()
    if l.lstrip().startswith('- name:'):
        level_starts.append(i)
    i += 1

for idx, start in enumerate(level_starts):
    end = level_starts[idx+1] if idx+1 < len(level_starts) else fix_end
    
    # Collect property lines and their indents
    props = {}  # indent -> count
    prop_lines = []  # (line_idx, indent, content)
    for j in range(start+1, end):
        l = lines[j].rstrip()
        if not l:
            continue
        leading = len(l) - len(l.lstrip())
        stripped = l.lstrip()
        
        # Check if this is a top-level property (not content within a block scalar)
        # Top-level props are at or near expected indent (10 or close)
        if 8 <= leading <= 12:
            if ':' in stripped:
                key = stripped.split(':')[0].strip()
                if key and ' ' not in key and "'" not in key and '"' not in key:
                    props[leading] = props.get(leading, 0) + 1
                    prop_lines.append((j, leading, stripped[:50]))
    
    if not props:
        continue
    
    # Majority indent
    majority_indent = max(props, key=props.get)
    
    # Fix outliers
    for (j, lead, stripped) in prop_lines:
        if lead != majority_indent:
            print(f'Level {idx+1} (line {start+1}): fix line {j+1} from {lead} to {majority_indent}: {stripped}')
            lines[j] = ' ' * majority_indent + lines[j].lstrip()
            fixes_after += 1

print(f'\nFixed {fixes_after} outliers')

with open('src/data/track2_fixed7.yaml', 'w', encoding='utf-8', newline='\n') as f:
    f.writelines(lines)

print('Written track2_fixed7.yaml')
print()

# Verify
with open('src/data/track2_fixed7.yaml') as f:
    data = yaml.safe_load(f)
print('Parsed OK')
t = data[0]
print('Track:', t['name'])
for ci, c in enumerate(t['chapters']):
    cn = c['name']
    print('Ch' + str(ci+1) + ': ' + cn + ' - ' + str(len(c['levels'])) + ' levels')
