const fs = require('fs');
const path = require('path');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryOperation(operation, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await operation();
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(1000); // Wait 1 second before retrying
    }
  }
}

async function copyEngineFiles() {
  const prismaDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
  
  try {
    if (!fs.existsSync(prismaDir)){
      await tryOperation(() => fs.mkdirSync(prismaDir, { recursive: true }));
    }
    
    // Clean up any existing .tmp files first
    const existingFiles = fs.readdirSync(prismaDir);
    for (const file of existingFiles) {
      if (file.includes('.tmp')) {
        const filePath = path.join(prismaDir, file);
        await tryOperation(() => fs.unlinkSync(filePath));
      }
    }

    // Now handle the engine files
    const engineFiles = fs.readdirSync(prismaDir).filter(f => f.includes('.tmp'));
    
    for (const file of engineFiles) {
      const tmpPath = path.join(prismaDir, file);
      const finalPath = path.join(prismaDir, file.replace(/\.tmp\d+$/, ''));
      
      await tryOperation(async () => {
        if (fs.existsSync(finalPath)) {
          await tryOperation(() => fs.unlinkSync(finalPath));
        }
        fs.renameSync(tmpPath, finalPath);
      });
    }
  } catch (err) {
    console.error('Error in copy-engines script:', err);
    process.exit(1); // Exit with error code
  }
}

copyEngineFiles();
