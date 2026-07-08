import yaml
import re

with open('src/data/track2_raw.yaml', 'r', encoding='utf-8') as f:
    content = f.read()

# Parse Track 2 as a tree: identify the top-level structure
# Track -> chapters -> levels -> properties
# All indent is relative. The track's first chapter is at indent 4.

lines = content.split('\n')

# Strategy: build a tree based on indent levels
# We know the structure from the original correct chapters 1-3, 8

def parse_yaml_tree(lines, start, end):
    """Parse a YAML tree into Python dicts/lists using indent-aware parsing."""
    result = []
    i = start
    while i < end:
        l = lines[i].rstrip()
        if not l or l.lstrip().startswith('#'):
            i += 1
            continue
        
        leading = len(l) - len(l.lstrip())
        stripped = l.lstrip()
        
        if stripped.startswith('- '):
            key_value = stripped[2:]
            if ':' in key_value:
                key = key_value.split(':', 1)[0].strip()
                rest = key_value.split(':', 1)[1].strip()
                
                # Find the indent of this block
                block_start = i
                # Find next item at same or less indent
                j = i + 1
                while j < end:
                    nxt = lines[j].rstrip()
                    if not nxt:
                        j += 1
                        continue
                    nxt_lead = len(nxt) - len(nxt.lstrip())
                    if nxt_lead <= leading:
                        break
                    j += 1
                
                if rest:
                    # Scalar value
                    result.append({key: parse_scalar(rest)})
                    i += 1
                else:
                    # Complex value - parse children
                    children = parse_yaml_tree(lines, i+1, j)
                    # May be a sequence (all children start with -) or mapping
                    result.append({key: children})
                    i = j
                
                # Merge consecutive dicts
                result = merge_dicts(result)
            else:
                # Plain list item (scalar)
                result.append(stripped)
                i += 1
        elif ':' in stripped:
            key = stripped.split(':', 1)[0].strip()
            rest = stripped.split(':', 1)[1].strip()
            
            # Find block end
            j = i + 1
            while j < end:
                nxt = lines[j].rstrip()
                if not nxt:
                    j += 1
                    continue
                nxt_lead = len(nxt) - len(nxt.lstrip())
                if nxt_lead <= leading:
                    break
                j += 1
            
            if rest:
                result.append({key: parse_scalar(rest)})
                i += 1
            else:
                children = parse_yaml_tree(lines, i+1, j)
                result.append({key: children})
                i = j
            
            result = merge_dicts(result)
        else:
            # Scalar list item
            result.append(stripped)
            i += 1
    
    return result

def merge_dicts(lst):
    """Merge consecutive dicts into one."""
    if not lst:
        return lst
    merged = []
    current = {}
    for item in lst:
        if isinstance(item, dict):
            current.update(item)
        else:
            if current:
                merged.append(current)
                current = {}
            merged.append(item)
    if current:
        merged.append(current)
    return merged

def parse_scalar(val):
    """Parse a YAML scalar value."""
    if val == '[]' or val == '{}':
        return val
    if val == '|-' or val == '|' or val == '>-' or val == '>':
        return val
    if val == 'true' or val == 'True':
        return True
    if val == 'false' or val == 'False':
        return False
    if val == 'null' or val == '~':
        return None
    try:
        if '.' in val:
            return float(val)
        return int(val)
    except ValueError:
        pass
    # Check if it's a quoted string - strip quotes
    if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
        return val[1:-1]
    return val

# Parse the whole file
data = parse_yaml_tree(lines, 0, len(lines))

# Now dump with PyYAML
output = yaml.dump(data, indent=2, width=120, default_flow_style=False, sort_keys=False, allow_unicode=True)

# PyYAML might use '!!python/unicode' or similar, let's clean it
output = output.replace("'", "\\'")  # This would break things

with open('src/data/track2_reconstructed.yaml', 'w', encoding='utf-8', newline='\n') as f:
    f.write(output)

print('Done - written track2_reconstructed.yaml')
print(f'File size: {len(output)} chars')
