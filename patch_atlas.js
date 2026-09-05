const fs = require('fs');
let content = fs.readFileSync('demo/src/views/Atlas.jsx', 'utf-8');
const newReturn = fs.readFileSync('demo/new_return.txt', 'utf-8');

const oldReturn = content.substring(content.indexOf('return ('), content.lastIndexOf(')') + 1);

content = content.replace(oldReturn, newReturn);
fs.writeFileSync('demo/src/views/Atlas.jsx', content, 'utf-8');
