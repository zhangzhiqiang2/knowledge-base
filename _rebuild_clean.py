"""Clean rebuild of meetings_data.js. Read all entries, fix summaries, write back."""
import json
import re

# Read summaries
with open(r'd:\personal\Desktop\知识库\巴菲特\_summaries_data.json', 'r', encoding='utf-8') as f:
    raw = f.read()
    summaries = json.loads(raw)

# Read current file content
with open(r'd:\personal\Desktop\知识库\巴菲特\meetings_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

def make_summary_line(year):
    """Create a proper JS summary line for the given year"""
    year_str = str(year)
    if year_str not in summaries:
        return None

    text = summaries[year_str]
    # Must escape for JS single-line string
    result = []
    for ch in text:
        if ch == '\\':
            result.append('\\\\')
        elif ch == '"':
            result.append('\\"')
        elif ch == '\n':
            result.append('\\n')
        elif ch == '\r':
            result.append('')
        elif ch == '\t':
            result.append(' ')
        elif ord(ch) < 32:  # other control chars
            result.append('')
        else:
            result.append(ch)

    escaped = ''.join(result)
    return f'"summary": "{escaped}",'

def fix_entry(entry_text):
    """Fix summary line in an entry"""
    year_m = re.search(r'"year": (\d{4})', entry_text)
    if not year_m:
        return entry_text
    year = int(year_m.group(1))

    new_summary = make_summary_line(year)
    if not new_summary:
        return entry_text

    # Replace the summary line - handle both formats
    # New format: \t\t"summary": "...",
    # Old format: "summary": "...",

    lines = entry_text.split('\n')
    new_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith('"summary":'):
            new_lines.append(new_summary)
        else:
            new_lines.append(line)

    return '\n'.join(new_lines)

# Process the file entry by entry
# Find const MEETINGS = [ ... ];
m = re.search(r'(const\s+MEETINGS\s*=\s*\[)', content)
if not m:
    print('ERROR: Cannot find MEETINGS array')
    exit(1)

array_start = m.end()
# Find the closing ];
array_end = content.rfind('];')

header = content[:array_start]
footer = content[array_end:]

body = content[array_start:array_end]

# Split into individual entries by finding "year":
# Each entry starts with optional whitespace then { or just "year":
entries = re.split(r'(?={"year": \d{4})', body)

fixed_entries = []
for entry in entries:
    entry = entry.strip()
    if not entry:
        continue
    # Remove trailing comma if present
    if entry.endswith(','):
        entry = entry[:-1]

    fixed = fix_entry(entry)
    fixed_entries.append(fixed)

# Rejoin with proper formatting
output = header + '\n\n'
for i, entry in enumerate(fixed_entries):
    # Determine indentation format (new entries use \t, old entries don't)
    if entry.startswith('\t') or '\n\t' in entry:
        output += entry
    else:
        # Old format entries need to be wrapped properly
        output += '\n' + entry

    if i < len(fixed_entries) - 1:
        output += ',\n\n'
    else:
        output += '\n'

output += footer

with open(r'd:\personal\Desktop\知识库\巴菲特\meetings_data.js', 'w', encoding='utf-8') as f:
    f.write(output)

# Verify
non_empty = len(re.findall(r'"summary": "[^"]{50,}"', output))
total = len(re.findall(r'"year": \d{4}', output))

# Check for any multiline summary values
issues = 0
for line in output.split('\n'):
    if '"summary": "' in line:
        if '\\n' in line:
            pass  # Good - using escape sequences
        elif line.strip().endswith('",') or line.strip().endswith('"'):
            # Single line, OK
            pass
        else:
            issues += 1

print(f'Non-empty summaries: {non_empty} / {total}')
print(f'Multiline issues: {issues}')

# Save validation script
with open(r'd:\personal\Desktop\知识库\巴菲特\_validate.js', 'w', encoding='utf-8') as f:
    f.write('const fs = require("fs");\n')
    f.write('const vm = require("vm");\n')
    f.write('try {\n')
    f.write('  const c = fs.readFileSync("d:\\\\personal\\\\Desktop\\\\知识库\\\\巴菲特\\\\meetings_data.js", "utf-8");\n')
    f.write('  new vm.Script(c);\n')
    f.write('  console.log("VALID JS");\n')
    f.write('} catch(e) {\n')
    f.write('  console.log("INVALID:", e.message);\n')
    f.write('}\n')
