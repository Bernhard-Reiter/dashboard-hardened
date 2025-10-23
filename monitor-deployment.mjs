#!/usr/bin/env node
const TOKEN = 'YC46EzsrLbtVtPDHryi7eGeu';
const DEPLOYMENT_URL = 'dashboard-clean-dr4o3c6om-vi4.vercel.app';

let checks = 0;
const maxChecks = 30; // 5 Minuten max

async function monitorDeployment() {
  checks++;
  
  if (checks > maxChecks) {
    console.log('\n⏱️ Timeout nach 5 Minuten - Check manuell:', `https://vercel.com/vi4/dashboard-clean`);
    process.exit(1);
  }
  
  const response = await fetch(`https://api.vercel.com/v13/deployments/get?url=${DEPLOYMENT_URL}`, {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  });
  
  const deployment = await response.json();
  const state = deployment.readyState || deployment.state;
  
  console.log(`\n[${new Date().toLocaleTimeString()}] Deployment Status: ${state}`);
  console.log(`URL: https://${deployment.url}`);
  
  if (state === 'READY') {
    console.log('\n🎉 DEPLOYMENT ERFOLGREICH! 🎉');
    console.log(`\n🌐 Live URL: https://${deployment.url}`);
    console.log(`🔍 Inspector: ${deployment.inspectorUrl || 'https://vercel.com/vi4/dashboard-clean'}`);
    process.exit(0);
  } else if (state === 'ERROR') {
    console.log('\n❌ BUILD FEHLER!');
    console.log(`📋 Error: ${deployment.errorMessage || 'Unknown error'}`);
    console.log(`🔍 Inspector: ${deployment.inspectorUrl || 'https://vercel.com/vi4/dashboard-clean'}`);
    process.exit(1);
  } else {
    console.log(`⏳ Build läuft... (Check ${checks}/${maxChecks})`);
    setTimeout(monitorDeployment, 10000); // Check alle 10 Sekunden
  }
}

console.log('🚀 Starte Deployment Monitoring...\n');
monitorDeployment();
