import sharp from 'sharp';
const base = await sharp('input.jpg').rotate().png().toBuffer();
const { width, height } = await sharp(base).metadata();
const texture = await sharp('texture.png').resize(width, height, { fit: 'cover' }).png().toBuffer();
await sharp(base).composite([{ input: texture, blend: 'multiply' }]).png().toFile('output.png');
