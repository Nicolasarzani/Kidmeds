#!/usr/bin/env node
// Generates simple pill emoji icons at 192x192 and 512x512
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function makeIcon(size, outPath) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#090912';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // Emoji
  ctx.font = `${size * 0.6}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💊', size / 2, size / 2);

  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log('Written', outPath);
}

const publicDir = path.join(__dirname, 'public');
makeIcon(192, path.join(publicDir, 'icon-192.png'));
makeIcon(512, path.join(publicDir, 'icon-512.png'));
