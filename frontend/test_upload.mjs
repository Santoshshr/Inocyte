import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

// Simulate getting token
const loginRes = await axios.post('http://localhost:8000/api/auth/login/', {
  email: 'santosh.shrestha@inocyte.com',
  password: 'Inocyte@#1900'
});
const token = loginRes.data.access;

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
});

const fd = new FormData();
fd.append('name', 'Test Company Axios');
fd.append('tagline', 'Testing Axios');
fd.append('description', '');
fd.append('status', 'upcoming');
fd.append('website_url', '');
fd.append('display_order', '0');
fd.append('is_featured', 'false');

try {
  // Test 1: Just omit headers
  console.log("Test 1: Omitting headers...");
  const res1 = await apiClient.post('/companies/', fd);
  console.log("Test 1 Success:", res1.data.status);
} catch (err) {
  console.log("Test 1 Failed:", err.response?.status, err.response?.data);
}

try {
  // Test 2: multipart/form-data
  console.log("\nTest 2: multipart/form-data...");
  const res2 = await apiClient.post('/companies/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  console.log("Test 2 Success:", res2.data.status);
} catch (err) {
  console.log("Test 2 Failed:", err.response?.status, err.response?.data);
}

try {
  // Test 3: multipart/form-data with Form-Data getHeaders
  console.log("\nTest 3: Using form-data getHeaders()...");
  const res3 = await apiClient.post('/companies/', fd, {
    headers: fd.getHeaders()
  });
  console.log("Test 3 Success:", res3.data.status);
} catch (err) {
  console.log("Test 3 Failed:", err.response?.status, err.response?.data);
}

try {
  // Test 4: Content-Type: undefined
  console.log("\nTest 4: Content-Type: undefined...");
  const res4 = await apiClient.post('/companies/', fd, {
    headers: { 'Content-Type': undefined }
  });
  console.log("Test 4 Success:", res4.data.status);
} catch (err) {
  console.log("Test 4 Failed:", err.response?.status, err.response?.data);
}

