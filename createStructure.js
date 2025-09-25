// createStructure.js
const fs = require('fs');
const path = require('path');

// Define folder structure
const folders = [
  'models',
  'controllers',
  'routes',
  'utils',
  'config'
];

// Define files with paths
const files = [
  'server.js',
  '.env',
  'models/User.js',
  'models/Report.js',
  'controllers/userController.js',
  'controllers/reportController.js',
  'routes/userRoutes.js',
  'routes/reportRoutes.js',
  'utils/bcryptHelper.js',
  'config/db.js'
];

// Create folders
folders.forEach(folder => {
  const folderPath = path.join(__dirname, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Created folder: ${folder}`);
  }
});

// Create files
files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created file: ${file}`);
  }
});

console.log('Folder structure created successfully!');
