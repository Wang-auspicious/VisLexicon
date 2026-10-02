import sharp from 'sharp';
const mask = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" rx="96" fill="white"/></svg>');
await sharp('input.jpg').resize(800, 800).composite([{ input: mask, blend: 'dest-in' }]).png().toFile('output.png');
