const fs = require('fs');
let content = fs.readFileSync('components/meter-readings/meter-readings-client.tsx', 'utf8');

// Find all className attributes and wrap those containing / in template literals
// This regex matches className= followed by quote, single quote, or backtick
const regex = /className=(['"`])([^'"`]*\/[^'"`]*)\1/g;

let result = content;
let match;
let offset = 0;

while ((match = regex.exec(content)) !== null) {
  const fullMatch = match[0];
  const quote = match[1];
  const value = match[2];
  const index = match.index + offset;

  // Check if already using template literal (backtick)
  if (quote === '`') {
    continue;
  }

  // Replace with template literal
  const replacement = `className=\`${value}\``;
  result = result.slice(0, index) + replacement + result.slice(index + fullMatch.length);
  offset += replacement.length - fullMatch.length;
}

fs.writeFileSync('components/meter-readings/meter-readings-client.tsx', result);
console.log('Fixed className attributes');