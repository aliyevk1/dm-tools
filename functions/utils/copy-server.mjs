import fs from 'fs-extra';

const sourceDir = './dist/dm-tools/server';
const destinationDir = './functions/server';

async function copyFiles() {
  try {
    // Ensure the destination directory exists
    await fs.ensureDir(destinationDir);

    // Ensure the destination directory exists and clean it
    await fs.emptyDir(destinationDir);
    console.log('Destination directory cleaned.');

    // Copy files from source to destination
    await fs.copy(sourceDir, destinationDir);
    console.log('Files copied successfully');
  } catch (err) {
    console.error('Error copying files:', err);
  }
}

copyFiles();
