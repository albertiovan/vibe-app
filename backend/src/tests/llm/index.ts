/**
 * LLM Test Runner
 * Simple test runner for LLM-related functionality
 */

import { runLLMSchemaTests } from './schemas.test.js';

/**
 * Run all LLM tests
 */
async function runAllLLMTests() {
  console.log('🧪 Starting LLM Test Suite...\n');
  
  const results = {
    schemas: false
  };

  // Run schema tests
  results.schemas = runLLMSchemaTests();

  // Summary
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  console.log(`\n📊 Test Results: ${passed}/${total} test suites passed`);
  
  if (passed === total) {
    console.log('🎉 All LLM tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some LLM tests failed');
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllLLMTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
  });
}
