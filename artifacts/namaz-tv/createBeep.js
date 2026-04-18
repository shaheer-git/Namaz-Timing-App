const fs = require('fs');
const sampleRate = 44100;
const duration = 3.1; // 3.1 seconds to be safe
const frequency = 800; 
const numSamples = sampleRate * duration;
const buffer = Buffer.alloc(44 + numSamples * 2);

buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + numSamples * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); 
buffer.writeUInt16LE(1, 22); 
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28); 
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34); 

buffer.write('data', 36);
buffer.writeUInt32LE(numSamples * 2, 40);

// Generate continuous 3s beep with fade out
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  let envelope = 1;
  if (t > duration - 0.1) {
    envelope = (duration - t) / 0.1;
  }
  const sample = Math.sin(2 * Math.PI * frequency * t) * envelope;
  const val = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
  buffer.writeInt16LE(val, 44 + i * 2);
}

fs.writeFileSync('assets/sounds/beep.wav', buffer);
console.log('Successfully generated 3s continuous beep.wav');
