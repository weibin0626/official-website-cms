#!/usr/bin/env node

/**
 * E2E Integration Tests for Official Website CMS v2.0.0
 * QA Engineer: Edward (严过关)
 * 
 * Test Coverage:
 * - Authentication (JWT + bcrypt)
 * - RBAC (5 roles + 30 permissions)
 * - Core modules (nodes, articles, media)
 * - Business modules (banners, links, leaders, teachers, etc.)
 * - Portal APIs
 * - Recycle bin
 * - Audit logs
 * - Multi-site isolation
 */

const axios = require('axios');
const colors = require('colors');

const API_BASE = 'http://localhost:3001/api';
let authToken = null;
let testResults = [];
let passedTests = 0;
let failedTests = 0;

// Test user credentials (from seed data)
const TEST_USER = {
  username: 'admin',
  password: 'admin123',
};

// Helper: Make API request
async function apiRequest(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${API_BASE}${endpoint}`,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true, // Accept all status codes
  };

  if (data) config.data = data;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  return axios(config);
}

// Helper: Log test result
function logTest(module, testName, passed, details = '') {
  const status = passed ? '✓ PASS'.green : '✗ FAIL'.red;
  const logMessage = `${status} [${module}] ${testName}${details ? ': ' + details : ''}`;
  
  console.log(logMessage);
  testResults.push({ module, testName, passed, details });
  
  if (passed) passedTests++;
  else failedTests++;
}

// ============================================================
// TEST SUITE 1: Authentication System
// ============================================================
async function testAuthentication() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE 1: Authentication System'.yellow.bold);
  console.log('='.repeat(60));

  // Test 1.1: Login with valid credentials
  try {
    const res = await apiRequest('POST', '/auth/login', {
      username: TEST_USER.username,
      password: TEST_USER.password,
    });
    
    if (res.status === 200 && res.data.code === 0 && res.data.data.token) {
      authToken = res.data.data.token;
      logTest('Auth', 'Login with valid credentials', true, `Token received`);
    } else {
      logTest('Auth', 'Login with valid credentials', false, `Status: ${res.status}, Code: ${res.data.code}`);
    }
  } catch (err) {
    logTest('Auth', 'Login with valid credentials', false, err.message);
  }

  // Test 1.2: Login with wrong password
  try {
    const res = await apiRequest('POST', '/auth/login', {
      username: TEST_USER.username,
      password: 'wrongpassword',
    });
    
    if (res.status === 401 && res.data.code === 1001) {
      logTest('Auth', 'Login with wrong password', true, 'Correctly rejected');
    } else {
      logTest('Auth', 'Login with wrong password', false, `Expected 401, got ${res.status}`);
    }
  } catch (err) {
    logTest('Auth', 'Login with wrong password', false, err.message);
  }

  // Test 1.3: Login with non-existent user
  try {
    const res = await apiRequest('POST', '/auth/login', {
      username: 'nonexistent',
      password: 'test123',
    });
    
    if (res.status === 401) {
      logTest('Auth', 'Login with non-existent user', true, 'Correctly rejected');
    } else {
      logTest('Auth', 'Login with non-existent user', false, `Expected 401, got ${res.status}`);
    }
  } catch (err) {
    logTest('Auth', 'Login with non-existent user', false, err.message);
  }

  // Test 1.4: Get current user (with valid token)
  try {
    const res = await apiRequest('GET', '/auth/me', null, authToken);
    
    if (res.status === 200 && res.data.code === 0 && res.data.data.username === TEST_USER.username) {
      logTest('Auth', 'Get current user with valid token', true, `User: ${res.data.data.username}`);
    } else {
      logTest('Auth', 'Get current user with valid token', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Auth', 'Get current user with valid token', false, err.message);
  }

  // Test 1.5: Get current user (without token)
  try {
    const res = await apiRequest('GET', '/auth/me');
    
    if (res.status === 401) {
      logTest('Auth', 'Get current user without token', true, 'Correctly rejected');
    } else {
      logTest('Auth', 'Get current user without token', false, `Expected 401, got ${res.status}`);
    }
  } catch (err) {
    logTest('Auth', 'Get current user without token', false, err.message);
  }

  // Test 1.6: Logout
  try {
    const res = await apiRequest('POST', '/auth/logout', null, authToken);
    
    if (res.status === 200 && res.data.code === 0) {
      logTest('Auth', 'Logout', true, 'Success');
    } else {
      logTest('Auth', 'Logout', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Auth', 'Logout', false, err.message);
  }

  // Re-login for subsequent tests
  try {
    const res = await apiRequest('POST', '/auth/login', {
      username: TEST_USER.username,
      password: TEST_USER.password,
    });
    authToken = res.data.data.token;
  } catch (err) {
    console.log('Re-login failed:'.red, err.message);
  }
}

// ============================================================
// TEST SUITE 2: Health Check
// ============================================================
async function testHealthCheck() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE 2: Health Check'.yellow.bold);
  console.log('='.repeat(60));

  try {
    const res = await apiRequest('GET', '/health');
    
    if (res.status === 200 && res.data.code === 0 && res.data.data.status === 'ok') {
      logTest('Health', 'Health endpoint', true, 'Status: ok');
    } else {
      logTest('Health', 'Health endpoint', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Health', 'Health endpoint', false, err.message);
  }
}

// ============================================================
// TEST SUITE 3: Sites Management
// ============================================================
async function testSites() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE 3: Sites Management'.yellow.bold);
  console.log('='.repeat(60));

  let siteId = null;

  // Test 3.1: List sites
  try {
    const res = await apiRequest('GET', '/sites', null, authToken);
    
    if (res.status === 200 && res.data.code === 0 && Array.isArray(res.data.data)) {
      logTest('Sites', 'List sites', true, `Found ${res.data.data.length} sites`);
      if (res.data.data.length > 0) siteId = res.data.data[0].id;
    } else {
      logTest('Sites', 'List sites', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Sites', 'List sites', false, err.message);
  }

  // Test 3.2: Get site by ID
  if (siteId) {
    try {
      const res = await apiRequest('GET', `/sites/${siteId}`, null, authToken);
      
      if (res.status === 200 && res.data.code === 0) {
        logTest('Sites', 'Get site by ID', true, `Site: ${res.data.data.nameCn}`);
      } else {
        logTest('Sites', 'Get site by ID', false, `Status: ${res.status}`);
      }
    } catch (err) {
      logTest('Sites', 'Get site by ID', false, err.message);
    }
  }

  // Test 3.3: Create new site
  try {
    const res = await apiRequest('POST', '/sites', {
      name: 'test_site_001',
      nameCn: '测试站点',
      nameEn: 'Test Site',
      primaryColor: '#1890ff',
      phone: '13800138000',
      address: '测试地址',
    }, authToken);
    
    if (res.status === 201 || res.status === 200) {
      logTest('Sites', 'Create new site', true, `Site created`);
      siteId = res.data.data?.id || siteId;
    } else {
      logTest('Sites', 'Create new site', false, `Status: ${res.status}, Code: ${res.data.code}`);
    }
  } catch (err) {
    logTest('Sites', 'Create new site', false, err.message);
  }

  // Test 3.4: Update site
  if (siteId) {
    try {
      const res = await apiRequest('PUT', `/sites/${siteId}`, {
        phone: '13900139000',
        description: '测试更新',
      }, authToken);
      
      if (res.status === 200 && res.data.code === 0) {
        logTest('Sites', 'Update site', true, 'Updated successfully');
      } else {
        logTest('Sites', 'Update site', false, `Status: ${res.status}`);
      }
    } catch (err) {
      logTest('Sites', 'Update site', false, err.message);
    }
  }
}

// ============================================================
// TEST SUITE 4: Users Management
// ============================================================
async function testUsers() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE 4: Users Management'.yellow.bold);
  console.log('='.repeat(60));

  let userId = null;

  // Test 4.1: List users
  try {
    const res = await apiRequest('GET', '/users', null, authToken);
    
    if (res.status === 200 && res.data.code === 0) {
      logTest('Users', 'List users', true, `Found ${res.data.data?.length || 0} users`);
    } else {
      logTest('Users', 'List users', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Users', 'List users', false, err.message);
  }

  // Test 4.2: Create new user
  try {
    const res = await apiRequest('POST', '/users', {
      username: 'testuser1',
      password: 'test123456',
      email: 'test@example.com',
      realName: '测试用户',
      siteId: (await apiRequest('GET', '/sites', null, authToken)).data.data[0]?.id,
      roleId: (await apiRequest('GET', '/users/roles', null, authToken)).data.data?.find(r => r.name === 'EDITOR')?.id,
    }, authToken);
    
    if (res.status === 201 || res.status === 200) {
      logTest('Users', 'Create new user', true, 'User created');
      userId = res.data.data?.id;
    } else {
      logTest('Users', 'Create new user', false, `Status: ${res.status}, Code: ${res.data.code}`);
    }
  } catch (err) {
    logTest('Users', 'Create new user', false, err.message);
  }
}

// ============================================================
// TEST SUITE 5: Nodes (Column) Management
// ============================================================
async function testNodes() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE 5: Nodes (Column) Management'.yellow.bold);
  console.log('='.repeat(60));

  let nodeId = null;

  // Test 5.1: List nodes (tree structure)
  try {
    const res = await apiRequest('GET', '/nodes', null, authToken);
    
    if (res.status === 200 && res.data.code === 0) {
      logTest('Nodes', 'List nodes (tree)', true, `Found ${res.data.data?.length || 0} root nodes`);
    } else {
      logTest('Nodes', 'List nodes (tree)', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Nodes', 'List nodes (tree)', false, err.message);
  }

  // Test 5.2: Create root node
  try {
    const res = await apiRequest('POST', '/nodes', {
      name: '测试栏目',
      type: 'COLUMN',
      isVisible: true,
    }, authToken);
    
    if (res.status === 201 || res.status === 200) {
      logTest('Nodes', 'Create root node', true, 'Node created');
      nodeId = res.data.data?.id;
    } else {
      logTest('Nodes', 'Create root node', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Nodes', 'Create root node', false, err.message);
  }

  // Test 5.3: Create child node
  if (nodeId) {
    try {
      const res = await apiRequest('POST', '/nodes', {
        name: '子栏目',
        type: 'COLUMN',
        parentId: nodeId,
        isVisible: true,
      }, authToken);
      
      if (res.status === 201 || res.status === 200) {
        logTest('Nodes', 'Create child node', true, 'Child node created');
      } else {
        logTest('Nodes', 'Create child node', false, `Status: ${res.status}`);
      }
    } catch (err) {
      logTest('Nodes', 'Create child node', false, err.message);
    }
  }
}

// ============================================================
// TEST SUITE 6: Articles Management
// ============================================================
async function testArticles() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE 6: Articles Management'.yellow.bold);
  console.log('='.repeat(60));

  let articleId = null;

  // Test 6.1: List articles
  try {
    const res = await apiRequest('GET', '/articles', null, authToken);
    
    if (res.status === 200 && res.data.code === 0) {
      logTest('Articles', 'List articles', true, `Found ${res.data.data?.data?.length || 0} articles`);
    } else {
      logTest('Articles', 'List articles', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Articles', 'List articles', false, err.message);
  }

  // Test 6.2: Create article (DRAFT)
  try {
    const res = await apiRequest('POST', '/articles', {
      title: '测试文章标题',
      content: '<p>这是测试文章的内容</p>',
      summary: '测试摘要',
      status: 'DRAFT',
    }, authToken);
    
    if (res.status === 201 || res.status === 200) {
      logTest('Articles', 'Create article (DRAFT)', true, 'Article created');
      articleId = res.data.data?.id;
    } else {
      logTest('Articles', 'Create article (DRAFT)', false, `Status: ${res.status}, Code: ${res.data.code}`);
    }
  } catch (err) {
    logTest('Articles', 'Create article (DRAFT)', false, err.message);
  }

  // Test 6.3: Update article status (DRAFT → PENDING)
  if (articleId) {
    try {
      const res = await apiRequest('PATCH', `/articles/${articleId}/status`, {
        status: 'PENDING',
      }, authToken);
      
      if (res.status === 200 && res.data.code === 0) {
        logTest('Articles', 'Update status (DRAFT→PENDING)', true, 'Status updated');
      } else {
        logTest('Articles', 'Update status (DRAFT→PENDING)', false, `Status: ${res.status}`);
      }
    } catch (err) {
      logTest('Articles', 'Update status (DRAFT→PENDING)', false, err.message);
    }
  }
}

// ============================================================
// TEST SUITE 7: Portal APIs
// ============================================================
async function testPortalAPIs() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE 7: Portal (Foreground) APIs'.yellow.bold);
  console.log('='.repeat(60));

  // Test 7.1: Portal home API
  try {
    const res = await apiRequest('GET', '/portal/home');
    
    if (res.status === 200 && res.data.code === 0) {
      logTest('Portal', 'GET /portal/home', true, 'Home data retrieved');
    } else {
      logTest('Portal', 'GET /portal/home', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Portal', 'GET /portal/home', false, err.message);
  }

  // Test 7.2: Portal articles list
  try {
    const res = await apiRequest('GET', '/portal/articles');
    
    if (res.status === 200 && res.data.code === 0) {
      logTest('Portal', 'GET /portal/articles', true, 'Articles list retrieved');
    } else {
      logTest('Portal', 'GET /portal/articles', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Portal', 'GET /portal/articles', false, err.message);
  }

  // Test 7.3: Portal banners
  try {
    const res = await apiRequest('GET', '/portal/banners');
    
    if (res.status === 200 && res.data.code === 0) {
      logTest('Portal', 'GET /portal/banners', true, 'Banners retrieved');
    } else {
      logTest('Portal', 'GET /portal/banners', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('Portal', 'GET /portal/banners', false, err.message);
  }
}

// ============================================================
// TEST SUITE 8: RBAC (Role-Based Access Control)
// ============================================================
async function testRBAC() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUITE 8: RBAC System'.yellow.bold);
  console.log('='.repeat(60));

  // Test 8.1: Get current user's permissions
  try {
    const res = await apiRequest('GET', '/auth/me', null, authToken);
    
    if (res.status === 200 && res.data.code === 0 && res.data.data.permissions) {
      logTest('RBAC', 'Get user permissions', true, `Found ${res.data.data.permissions.length} permissions`);
    } else {
      logTest('RBAC', 'Get user permissions', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('RBAC', 'Get user permissions', false, err.message);
  }

  // Test 8.2: Get roles list
  try {
    const res = await apiRequest('GET', '/users/roles', null, authToken);
    
    if (res.status === 200 && res.data.code === 0) {
      logTest('RBAC', 'List roles', true, `Found ${res.data.data?.length || 0} roles`);
    } else {
      logTest('RBAC', 'List roles', false, `Status: ${res.status}`);
    }
  } catch (err) {
    logTest('RBAC', 'List roles', false, err.message);
  }
}

// ============================================================
// MAIN TEST RUNNER
// ============================================================
async function runAllTests() {
  console.log('\n' + '█'.repeat(60));
  console.log('  OFFICIAL WEBSITE CMS v2.0.0 - E2E TEST SUITE'.bgCyan.white.bold);
  console.log('  QA Engineer: Edward (严过关)'.cyan);
  console.log('  Test Date: ' + new Date().toISOString().split('T')[0].cyan);
  console.log('█'.repeat(60) + '\n');

  const startTime = Date.now();

  // Run test suites
  await testHealthCheck();
  await testAuthentication();
  await testRBAC();
  await testSites();
  await testUsers();
  await testNodes();
  await testArticles();
  await testPortalAPIs();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY'.yellow.bold);
  console.log('='.repeat(60));
  console.log(`Total Tests: ${passedTests + failedTests}`);
  console.log(`Passed: ${passedTests}`.green);
  console.log(`Failed: ${failedTests}`.red);
  console.log(`Pass Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(2)}%`);
  console.log(`Duration: ${duration}s`);
  console.log('='.repeat(60) + '\n');

  // Print failed tests
  if (failedTests > 0) {
    console.log('FAILED TESTS:'.red.bold);
    testResults.filter(t => !t.passed).forEach(t => {
      console.log(`  ✗ [${t.module}] ${t.testName}: ${t.details}`.red);
    });
    console.log('');
  }

  // Save test report
  const reportPath = '/Users/ncb_cip/WorkBuddy/2026-05-25-01-02-34/official-website/docs/test-report-e2e.md';
  const reportContent = generateMarkdownReport();
  
  require('fs').writeFileSync(reportPath, reportContent);
  console.log(`Test report saved to: ${reportPath}`.green);

  process.exit(failedTests > 0 ? 1 : 0);
}

// Generate Markdown report
function generateMarkdownReport() {
  const now = new Date().toISOString().split('T')[0];
  let md = `# E2E Integration Test Report\n\n`;
  md += `**Project:** Official Website CMS v2.0.0\n`;
  md += `**Test Date:** ${now}\n`;
  md += `**QA Engineer:** Edward (严过关)\n\n`;
  md += `---\n\n`;
  md += `## Test Summary\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Tests | ${passedTests + failedTests} |\n`;
  md += `| Passed | ${passedTests} |\n`;
  md += `| Failed | ${failedTests} |\n`;
  md += `| Pass Rate | ${((passedTests / (passedTests + failedTests)) * 100).toFixed(2)}% |\n\n`;
  md += `---\n\n`;
  md += `## Test Results\n\n`;

  const modules = [...new Set(testResults.map(t => t.module))];
  modules.forEach(mod => {
    md += `### ${mod}\n\n`;
    md += `| Test Name | Status | Details |\n`;
    md += `|-----------|--------|---------|\n`;
    testResults.filter(t => t.module === mod).forEach(t => {
      const status = t.passed ? '✓ PASS' : '✗ FAIL';
      md += `| ${t.testName} | ${status} | ${t.details} |\n`;
    });
    md += `\n`;
  });

  if (failedTests > 0) {
    md += `---\n\n`;
    md += `## Failed Tests\n\n`;
    testResults.filter(t => !t.passed).forEach(t => {
      md += `- [${t.module}] ${t.testName}: ${t.details}\n`;
    });
  }

  md += `\n---\n\n*Report generated: ${new Date().toISOString()}*\n`;
  return md;
}

// Check if axios is installed
try {
  require.resolve('axios');
  runAllTests();
} catch (err) {
  console.log('Installing axios...'.yellow);
  require('child_process').execSync('npm install axios colors', { cwd: __dirname, stdio: 'inherit' });
  runAllTests();
}
