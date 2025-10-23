#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const TOKEN = 'YC46EzsrLbtVtPDHryi7eGeu';
const PROJECT_ID = 'prj_sD2DFbANSFYCuMTD8ov1CwlqqX16';

// Rekursiv alle Files sammeln
function getAllFiles(dir, baseDir = dir) {
  const files = [];
  const items = readdirSync(dir);
  
  for (const item of items) {
    // Skip node_modules, .git, .next, .vercel
    if (['node_modules', '.git', '.next', '.vercel', '.gitignore'].includes(item)) continue;
    
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      const relativePath = relative(baseDir, fullPath);
      const content = readFileSync(fullPath, 'utf-8');
      files.push({
        file: relativePath,
        data: content
      });
    }
  }
  
  return files;
}

async function deployToVercel() {
  console.log('📦 Sammle alle Dateien...');
  const files = getAllFiles(process.cwd());
  console.log(`✅ ${files.length} Dateien gefunden`);
  
  console.log('\n🚀 Erstelle Vercel Deployment...');
  
  const deploymentPayload = {
    name: 'dashboard-clean',
    files: files,
    projectSettings: {
      framework: 'nextjs',
      buildCommand: 'npm run build',
      installCommand: 'npm install',
      outputDirectory: '.next'
    },
    target: 'production'
  };
  
  const response = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deploymentPayload)
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    console.error('❌ Deployment fehlgeschlagen:', result);
    process.exit(1);
  }
  
  console.log('\n✅ Deployment erstellt!');
  console.log('🔗 URL:', result.url);
  console.log('🔍 Inspector:', result.inspectorUrl);
  console.log('📊 Status:', result.readyState);
  
  return result;
}

deployToVercel().catch(console.error);
