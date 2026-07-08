with open('src/data/track2_raw.yaml', 'r', encoding='utf-8') as f:
    lines = f.readlines()

fix_start = 834
fix_end = 2397

# Find level boundaries
level_starts = []
i = fix_start
while i < fix_end:
    l = lines[i].rstrip()
    if l.lstrip().startswith('- name:'):
        level_starts.append(i)
    i += 1

print(f'Levels found: {len(level_starts)}')

# For each level, find property indent outliers
total_typos = 0
for idx, start in enumerate(level_starts):
    end = level_starts[idx+1] if idx+1 < len(level_starts) else fix_end
    
    # Get name
    name_line = lines[start].rstrip()
    name_indent = len(name_line) - len(name_line.lstrip())
    name = name_line.lstrip()[2:].strip()
    
    # Collect all property lines (non-empty, non-list-item with colon)
    prop_indents = {}
    for j in range(start+1, end):
        l = lines[j].rstrip()
        if not l:
            continue
        leading = len(l) - len(l.lstrip())
        stripped = l.lstrip()
        
        # Check if this is a mapping key (word + colon)
        if ':' in stripped and not stripped.startswith('- '):
            # Extract key (text before colon)
            key_part = stripped.split(':')[0].strip()
            # Check it looks like a YAML key (single word)
            if key_part and ' ' not in key_part and '}' not in key_part:
                if leading not in prop_indents:
                    prop_indents[leading] = []
                prop_indents[leading].append((j, key_part, stripped[:60]))
    
    if len(prop_indents) > 1:
        print(f'\nLevel {idx+1}: {name[:50]}')
        print(f'  Name indent: {name_indent}')
        for indent, props in sorted(prop_indents.items()):
            keys = [p[1] for p in props]
            print(f'  Indent {indent}: {keys}')
            for j, key, stripped in props:
                if indent != min(prop_indents.keys()):
                    print(f'    OUTLIER: line {j+1}: {stripped}')
                    total_typos += 1

print(f'\nTotal typos: {total_typos}')
