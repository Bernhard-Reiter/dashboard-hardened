#!/usr/bin/env node
const TOKEN = 'YC46EzsrLbtVtPDHryi7eGeu';
const DEPLOYMENT_URL = 'dashboard-clean-4g4eqwl3v-vi4.vercel.app';

async function checkStatus() {
  const response = await fetch(`https://api.vercel.com/v13/deployments/get?url=${DEPLOYMENT_URL}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  
  const deployment = await response.json();
  
  console.log('\n📊 Deployment Status:');
  console.log('State:', deployment.readyState || deployment.state);
  console.log('URL:', `https://${deployment.url}`);
  
  if (deployment.readyState === 'READY') {
    console.log('\n✅ DEPLOYMENT LIVE!');
    console.log('🌐 Öffne:', `https://${deployment.url}`);
    process.exit(0);
  } else if (deployment.readyState === 'ERROR') {
    console.log('\n❌ BUILD FEHLER!');
    console.log('Inspector:', deployment.inspectorUrl);
    process.exit(1);
  } else {
    console.log('⏳ Build läuft... (prüfe in 10s erneut)');
    setTimeout(checkStatus, 10000);
  }
}

checkStatus();
