"""Fix meetings_data.js syntax issues"""
import re

with open(r'd:\personal\Desktop\知识库\巴菲特\meetings_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Missing '{' before first entry
content = content.replace('[\n\n"year": 1986', '[\n\n{\n"year": 1986', 1)

# Fix 2: Check if there's an extra closing brace
open_br = content.count('{')
close_br = content.count('}')
diff = open_br - close_br

# Also find the const MEETINGS opening bracket - it should NOT be counted as a brace
# Let me count properly
# const MEETINGS = [ ... ];  <- only { } count
# Each entry has exactly one { and one }

entries = len(re.findall(r'"year": \d{4}', content))
expected_open = entries  # one per entry
expected_close = entries

print(f'Entries: {entries}')
print(f'Braces: {{ = {open_br}, }} = {close_br}, diff = {diff}')

with open(r'd:\personal\Desktop\知识库\巴菲特\meetings_data.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Verify JS syntax
import subprocess
result = subprocess.run(['node', '-e', 'const fs = require("fs"); const vm = require("vm"); const c = fs.readFileSync("d:\\personal\\Desktop\\知识库\\巴菲特\\meetings_data.js","utf-8"); try { new vm.Script(c); console.log("VALID"); } catch(e) { console.log("INVALID:", e.message); }'],
                       capture_output=True, text=True, encoding='utf-8')
print(result.stdout or result.stderr)
