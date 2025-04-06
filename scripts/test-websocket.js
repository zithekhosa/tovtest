/**
 * WebSocket connection test script
 * This script tests WebSocket connectivity for real-time messaging
 * Run with: node scripts/test-websocket.js
 */

import WebSocket from 'ws';
import fetch from 'node-fetch';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:5000';
const WS_URL = 'ws://localhost:5000/ws';

async function login(username, password) {
  try {
    const response = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password }),
      redirect: 'manual'
    });
    
    if (!response.ok) {
      throw new Error(`Login failed with status ${response.status}`);
    }
    
    const cookies = response.headers.get('set-cookie');
    return cookies;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

function testWebSocketConnection(cookies) {
  return new Promise((resolve, reject) => {
    console.log(chalk.yellow('Connecting to WebSocket server...'));
    
    const ws = new WebSocket(WS_URL, {
      headers: {
        Cookie: cookies
      }
    });
    
    const timeout = setTimeout(() => {
      ws.terminate();
      reject(new Error('WebSocket connection timeout'));
    }, 5000);
    
    ws.on('open', () => {
      clearTimeout(timeout);
      console.log(chalk.green('WebSocket connection established!'));
      
      // Send test message
      const testMessage = {
        type: 'ping',
        timestamp: new Date().toISOString()
      };
      
      console.log(chalk.yellow('Sending test message...'));
      ws.send(JSON.stringify(testMessage));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log(chalk.green('Received message from server:'));
        console.log(JSON.stringify(message, null, 2));
        
        if (message.type === 'auth_success' || message.type === 'pong') {
          setTimeout(() => {
            ws.close();
            resolve(true);
          }, 1000);
        }
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    });
    
    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.error(chalk.red('WebSocket error:'), error);
      reject(error);
    });
    
    ws.on('close', (code, reason) => {
      clearTimeout(timeout);
      console.log(chalk.yellow(`WebSocket connection closed (Code: ${code})`));
      if (reason) {
        console.log(chalk.yellow(`Reason: ${reason}`));
      }
    });
  });
}

async function runTest() {
  console.log(chalk.blue('\n=== Testing WebSocket Connectivity ===\n'));
  
  try {
    // Login as demo maintenance user
    console.log(chalk.yellow('Logging in as demo-maintenance...'));
    const cookies = await login('demo-maintenance', 'password123');
    
    if (!cookies) {
      console.log(chalk.red('✗ Failed to log in'));
      return;
    }
    
    console.log(chalk.green('✓ Successfully logged in'));
    
    // Test WebSocket connection
    await testWebSocketConnection(cookies);
    
    console.log(chalk.green('\n✓ WebSocket connectivity test successful'));
    console.log(chalk.green('✓ Real-time messaging is working correctly'));
  } catch (error) {
    console.log(chalk.red('\n✗ WebSocket test failed:'));
    console.log(chalk.red(error.message));
  }
}

runTest().catch(console.error);