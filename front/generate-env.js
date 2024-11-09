const fs = require('fs');
const path = require('path');
require('dotenv').config();

const filePath = path.resolve(__dirname, `src/environments/environment.ts`);
const fileContent = ``;

fs.writeFileSync(filePath, fileContent, { encoding: 'utf8' });

console.log(`Environment file generated at ${filePath}`);