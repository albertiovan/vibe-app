# LLM Service Timing Best Practices

## 🚨 **Critical Timing Issue Prevention**

### **The Problem**
LLM services require environment variables (API keys) to be loaded before initialization. However, constructors run immediately when classes are imported, often before `.env` files are loaded.

### **❌ NEVER Do This:**
```typescript
class BadService {
  private llm: any;
  
  constructor() {
    this.llm = getLLMProvider(); // ❌ TIMING ISSUE!
    // Environment may not be loaded yet
  }
}
```

### **✅ ALWAYS Do This:**
```typescript
class GoodService {
  private llm: any;
  private initialized: boolean = false;
  
  constructor() {
    // ✅ SAFE: No LLM initialization in constructor
  }
  
  private async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      this.llm = getLLMProvider(); // ✅ SAFE: Called after env loading
      this.initialized = true;
    } catch (error) {
      throw new Error(`Service initialization failed: ${error.message}`);
    }
  }
  
  async someMethod() {
    await this.ensureInitialized(); // ✅ Lazy initialization
    return this.llm.complete(...);
  }
}
```

## 🎯 **Lazy Initialization Pattern**

### **Benefits:**
- ✅ Prevents timing issues
- ✅ Handles initialization errors gracefully
- ✅ Only initializes when actually needed
- ✅ Safe to import at module level

### **Implementation Template:**
```typescript
export class SafeLLMService {
  private llm: any;
  private initialized: boolean = false;

  constructor() {
    // TIMING SAFETY: Never initialize LLM in constructor
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    
    try {
      this.llm = getLLMProvider();
      // ... other initialization
      this.initialized = true;
    } catch (error) {
      console.error('Service initialization failed:', error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  async publicMethod() {
    await this.ensureInitialized();
    // ... use this.llm safely
  }
}
```

## 🔧 **Environment Loading Order**

### **Correct Sequence:**
1. **Import modules** (constructors run)
2. **Load .env file** (`dotenv.config()`)
3. **Call service methods** (lazy initialization happens)

### **Script Structure:**
```typescript
// At top of script
import { myService } from './services/myService.js'; // ✅ Safe import
import dotenv from 'dotenv';

// Load environment
dotenv.config(); // ✅ Load before using services

async function main() {
  // Now safe to use services
  await myService.doSomething(); // ✅ Lazy init happens here
}
```

## 🚨 **Warning Signs**

### **Red Flags:**
- `getLLMProvider()` called in constructor
- Environment variables accessed in constructor
- Services failing with "API key not configured"
- Works in some contexts but not others

### **Safe Patterns:**
- Lazy initialization with `ensureInitialized()`
- Constructor only sets up basic properties
- All LLM calls preceded by initialization check
- Proper error handling for initialization failures

## 📋 **Checklist for New LLM Services**

- [ ] Constructor is empty or only sets basic properties
- [ ] `getLLMProvider()` called in `ensureInitialized()` method
- [ ] All public methods call `ensureInitialized()` first
- [ ] Initialization errors are properly caught and re-thrown
- [ ] Service can be imported safely at module level
- [ ] Initialization only happens once (use boolean flag)

## 🎯 **Testing Your Service**

```typescript
// Test that service can be imported safely
import { myService } from './myService.js';
// Should not throw at import time ✅

// Test that service works after env loading
dotenv.config();
await myService.someMethod(); // Should work ✅
```

---

**Remember: Constructors run at import time, but environment variables are loaded at runtime!**
