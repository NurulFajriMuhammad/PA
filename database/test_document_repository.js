// Test script untuk Document Repository API
// Jalankan di browser console atau sebagai module

const API_BASE = 'http://192.168.1.8:8000/api';
const TOKEN = localStorage.getItem('authToken') || localStorage.getItem('token');

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  ...(TOKEN && { 'Authorization': `Bearer ${TOKEN}` })
};

console.log('🚀 Testing Document Repository API...');
console.log('Token:', TOKEN ? 'Found' : 'Not found');

// Test 1: Get documents
async function testGetDocuments() {
  try {
    console.log('📄 Testing GET /document-repository...');
    const response = await fetch(`${API_BASE}/document-repository`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Documents API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Documents API Error:', error);
    return null;
  }
}

// Test 2: Get statistics
async function testGetStatistics() {
  try {
    console.log('📊 Testing GET /document-repository/statistics...');
    const response = await fetch(`${API_BASE}/document-repository/statistics`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Statistics API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Statistics API Error:', error);
    return null;
  }
}

// Test 3: Sync documents
async function testSyncDocuments() {
  try {
    console.log('🔄 Testing POST /document-repository/sync...');
    const response = await fetch(`${API_BASE}/document-repository/sync`, {
      method: 'POST',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Sync API Response:', data);
    return data;
  } catch (error) {
    console.error('❌ Sync API Error:', error);
    return null;
  }
}

// Run all tests
async function runAllTests() {
  console.log('='.repeat(50));
  console.log('🧪 DOCUMENT REPOSITORY API TESTS');
  console.log('='.repeat(50));

  await testGetDocuments();
  console.log('');

  await testGetStatistics();
  console.log('');

  // Uncomment to test sync (will modify database)
  // await testSyncDocuments();
  // console.log('');

  console.log('='.repeat(50));
  console.log('✨ Tests completed!');
  console.log('='.repeat(50));
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runAllTests();
}

export { testGetDocuments, testGetStatistics, testSyncDocuments, runAllTests };