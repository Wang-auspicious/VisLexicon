import sharp from 'sharp';
await sharp('input.jpg').resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention }).png().toFile('output.png');
