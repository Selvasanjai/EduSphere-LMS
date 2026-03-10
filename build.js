#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building EduSphere for Production...');

// Build frontend
console.log('\n📦 Building Frontend...');
try {
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Create production directory structure
console.log('\n📁 Creating Production Directory Structure...');
const prodDir = path.join(__dirname, 'production');

if (!fs.existsSync(prodDir)) {
  fs.mkdirSync(prodDir, { recursive: true });
}

// Copy backend files
console.log('📋 Copying Backend Files...');
const backendFiles = [
  'server.js',
  'package.json',
  '.env.production',
  'routes',
  'controllers',
  'models',
  'middleware',
  'services'
];

backendFiles.forEach(file => {
  const src = path.join(__dirname, 'backend', file);
  const dest = path.join(prodDir, file);
  
  if (fs.existsSync(src)) {
    if (fs.statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      fs.copyFileSync(src, dest);
    }
    console.log(`✅ Copied ${file}`);
  } else {
    console.log(`⚠️  ${file} not found, skipping`);
  }
});

// Copy frontend build
console.log('📋 Copying Frontend Build...');
const buildDir = path.join(__dirname, 'frontend', 'build');
const publicDir = path.join(prodDir, 'public');

if (fs.existsSync(buildDir)) {
  copyDir(buildDir, publicDir);
  console.log('✅ Frontend build copied');
} else {
  console.error('❌ Frontend build directory not found');
  process.exit(1);
}

// Create production package.json with production scripts
const prodPackageJson = {
  name: 'edusphere-production',
  version: '1.0.0',
  description: 'EduSphere LMS Production Build',
  main: 'server.js',
  scripts: {
    start: 'node server.js',
    install: 'npm install --production'
  },
  engines: {
    node: '>=16.0.0',
    npm: '>=8.0.0'
  }
};

fs.writeFileSync(
  path.join(prodDir, 'package.json'),
  JSON.stringify(prodPackageJson, null, 2)
);

// Create .env file for production
fs.writeFileSync(
  path.join(prodDir, '.env'),
  fs.readFileSync(path.join(__dirname, 'backend/.env.production'))
);

// Create startup script
const startupScript = `#!/bin/bash
echo "🚀 Starting EduSphere Production Server..."
echo "📦 Installing dependencies..."
npm install --production
echo "🗄️  Starting server..."
npm start
`;

fs.writeFileSync(path.join(prodDir, 'start.sh'), startupScript);
fs.chmodSync(path.join(prodDir, 'start.sh'), '755');

// Create README for production
const readme = `# EduSphere Production Deployment

## Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB
- PM2 (recommended for production)

### Installation
1. Copy this production directory to your server
2. Configure environment variables in \`.env\`
3. Run: \`./start.sh\` or \`npm install && npm start\`

### Environment Variables
Edit \`.env\` file:
- \`MONGO_URI\`: MongoDB connection string
- \`JWT_SECRET\`: Secure JWT secret key
- \`CLIENT_URL\`: Frontend domain URL
- \`EMAIL_*\`: Email configuration

### PM2 Deployment (Recommended)
\`\`\`bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.js --name "edusphere"

# Save PM2 configuration
pm2 save
pm2 startup
\`\`\`

### Nginx Configuration
\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        root /path/to/production/public;
        try_files $uri $uri/ /index.html;
    }
}
\`\`\`

### Monitoring
- Health check: GET /api/health
- Logs: PM2 logs or console output
- Database: MongoDB connection status

## Security
- Change JWT_SECRET in production
- Use HTTPS in production
- Configure firewall properly
- Regular backups recommended
`;

fs.writeFileSync(path.join(prodDir, 'README.md'), readme);

console.log('\n✅ Production build completed!');
console.log(`📁 Production directory: ${prodDir}`);
console.log('\n📋 Next Steps:');
console.log('1. Copy production directory to your server');
console.log('2. Configure .env file with your settings');
console.log('3. Run: ./start.sh or npm install && npm start');
console.log('4. Set up reverse proxy (nginx/apache)');
console.log('5. Configure SSL certificate');
console.log('\n🎉 EduSphere is ready for production!');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
