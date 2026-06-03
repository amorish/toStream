const fs = require('fs');
const path = require('path');
const dir = 'd:/toStream/public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
for (const file of files) {
  const fp = path.join(dir, file);
  let c = fs.readFileSync(fp, 'utf8');
  c = c.replace(/class="text-2xl font-extrabold tracking-tight leading-none"/g, 'class="text-2xl font-extrabold tracking-tight leading-none mb-1.5"');
  c = c.replace(/class="text-3xl font-extrabold tracking-tight leading-none"/g, 'class="text-3xl font-extrabold tracking-tight leading-none mb-1.5"');
  fs.writeFileSync(fp, c);
  console.log('Updated', file);
}
