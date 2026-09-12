const assert = require('node:assert');
const fs = require('node:fs');

const source = fs.readFileSync('script.js', 'utf8');
const styles = fs.readFileSync('style.css', 'utf8');

assert.match(source, /const stopDurations = \[3400, 4500, 5600\]/);
assert.match(source, /i === totalImages - 1 \? finalImage/);
assert.doesNotMatch(source, /strip\.style\.transform = `translateY\(0px\)`/);
assert.match(styles, /\.reel-strip img\s*\{[^}]*display:\s*block;/s);
assert.match(source, /new Audio\('audio\/slot-machine-spin\.wav'\)/);
assert.match(source, /spinSound\.currentTime = 0;\s*spinSound\.play\(\)/);
assert.match(source, /spinSound\.volume = 0\.95;/);
console.log('animation regression check passed');
