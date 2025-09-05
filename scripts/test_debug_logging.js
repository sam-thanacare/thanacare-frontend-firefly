/**
 * Test script for debug logging functionality
 * Run this in the browser console to test the debug logging system
 */

// Test the debug logger
console.log('🧪 Testing Debug Logger...');

// Test basic logging
window.debugLogger.info('TestComponent', 'This is an info message', {
  testData: 'info',
});
window.debugLogger.warn('TestComponent', 'This is a warning message', {
  testData: 'warning',
});
window.debugLogger.error('TestComponent', 'This is an error message', {
  testData: 'error',
});
window.debugLogger.success('TestComponent', 'This is a success message', {
  testData: 'success',
});

// Test API logging
window.debugLogger.logApiCall(
  'http://localhost:8080/api/test',
  'GET',
  {
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  },
  { test: 'data' }
);

window.debugLogger.logApiResponse('http://localhost:8080/api/test', 200, {
  success: true,
});
window.debugLogger.logApiError(
  'http://localhost:8080/api/test',
  new Error('Test error')
);

// Test navigation logging
window.debugLogger.logNavigation('/member', '/member/documents/123', {
  assignmentId: '123',
});

// Test state logging
window.debugLogger.logStateChange('TestComponent', 'isLoading', false, true);

// Display all logs
console.log('📋 All Debug Logs:');
console.log(JSON.stringify(window.debugLogger.getLogs(), null, 2));

// Display logs by component
console.log('📋 Logs by TestComponent:');
console.log(
  JSON.stringify(
    window.debugLogger.getLogsByComponent('TestComponent'),
    null,
    2
  )
);

// Display error logs
console.log('📋 Error Logs:');
console.log(
  JSON.stringify(window.debugLogger.getLogsByLevel('error'), null, 2)
);

// Export logs
console.log('📋 Exported Logs:');
console.log(window.debugLogger.exportLogs());

console.log('✅ Debug Logger test completed!');
