import sharp from 'sharp';
const logo = await sharp('logo.png').resize({ width: 180 }).png().toBuffer();
await sharp('input.jpg').composite([{ input: logo, gravity: 'southeast', blend: 'over' }]).png().toFile('output.png');
