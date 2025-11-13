import sharp from 'sharp';
import toIco from 'to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gifPath = path.join(__dirname, '../public/planette.gif');
const icoPath = path.join(__dirname, '../public/favicon.ico');

async function convertGifToIco() {
  try {
    console.log('Conversion de planette.gif en favicon.ico...');
    
    // Lire le GIF et le convertir en buffer PNG (première frame)
    const pngBuffer = await sharp(gifPath)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    // Convertir le PNG en ICO avec plusieurs tailles
    const ico16 = await sharp(gifPath)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    const ico32 = await sharp(gifPath)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    const ico48 = await sharp(gifPath)
      .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    
    // Créer le fichier ICO avec plusieurs tailles
    const icoBuffer = await toIco([ico16, ico32, ico48]);
    
    // Écrire le fichier ICO
    fs.writeFileSync(icoPath, icoBuffer);
    
    console.log('✅ Conversion réussie ! favicon.ico créé dans public/');
  } catch (error) {
    console.error('❌ Erreur lors de la conversion:', error);
    process.exit(1);
  }
}

convertGifToIco();

