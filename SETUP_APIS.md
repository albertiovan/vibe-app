# 🔧 API Setup Guide - Fix LLM & Google Places Integration

## 🎯 **Current Issues**

Your ontology expansion system is built but needs API keys to work properly:

1. **❌ Claude LLM not working** - Falls back to rule-based mapping
2. **❌ Google Places using mocks** - No real venue verification  
3. **❌ Coverage analysis failing** - Can't test vibe mapping

## 🔑 **Step 1: Get API Keys**

### **Claude API Key (Anthropic)**
1. Go to https://console.anthropic.com/
2. Sign up/login to your account
3. Navigate to "API Keys" 
4. Create a new key
5. Copy the key (starts with `sk-ant-api03-...`)

### **Google Places API Key**
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable the **Places API** 
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the key (starts with `AIza...`)
6. **Restrict the key** to Places API for security

## 🔧 **Step 2: Configure Environment**

1. **Copy the environment template:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit the `.env` file** and add your keys:
   ```bash
   # Replace with your actual keys
   CLAUDE_API_KEY=sk-ant-api03-your-actual-claude-key-here
   GOOGLE_MAPS_API_KEY=AIza-your-actual-google-key-here
   
   # Keep these settings
   LLM_PROVIDER=claude
   LLM_MODEL=claude-3-haiku-20240307
   PORT=3000
   NODE_ENV=development
   ```

## ✅ **Step 3: Test API Connections**

Run the API test script:
```bash
cd backend
npm run test:apis
```

**Expected output:**
```
🔍 Testing API connections...

📋 Environment check:
  CLAUDE_API_KEY: ✅ Set
  GOOGLE_MAPS_API_KEY: ✅ Set

🤖 Testing Claude API...
✅ Claude API working!
Response: { message: "Hello from Claude!" }

🗺️ Testing Google Places API...
✅ Google Places API working! Found 15 cafes in Bucharest
Sample result: Starbucks

📊 Summary:
  Claude API: ✅ Working
  Google Places API: ✅ Working

🎉 All APIs are working! You can now run the ontology expansion system.
```

## 🚀 **Step 4: Run the Real System**

Once APIs are working, run the full pipeline:

### **Generate Real LLM Proposals:**
```bash
npm run ontology:propose
```
**Expected:** Claude generates 8-15 Romania-specific activities with proper mappings

### **Test with Live Google Places:**
```bash
npm run ontology:check proposals/latest.json
LIVE=1 npm run ontology:check proposals/latest.json
```
**Expected:** Real API calls to verify activities exist in Romania

### **Test Vibe Coverage:**
```bash
npm run ontology:coverage
```
**Expected:** Tests 25+ vibes with real LLM mapping, target ≥80% success

### **Apply Production Changes:**
```bash
npm run ontology:apply proposals/latest.json --dry-run
npm run ontology:apply proposals/latest.json
```

## 🎯 **What Changes When APIs Work**

### **Before (Mock/Fallback):**
```
"I want something cozy" → 
  Rule-based mapping → entertainment venues
  Mock Google verification → "probably works"
  No real venue validation
```

### **After (Real APIs):**
```
"I want something cozy" → 
  Claude LLM → cafes, libraries, thermal baths
  Real Google Places → "Found 23 thermal baths in Romania"
  Verified activities with real venues
```

## 🔍 **Troubleshooting**

### **Claude API Issues:**
- **Invalid key**: Check the key starts with `sk-ant-api03-`
- **Rate limits**: Claude has usage limits on free tier
- **Network**: Check firewall/proxy settings

### **Google Places API Issues:**
- **Invalid key**: Check the key starts with `AIza`
- **API not enabled**: Enable Places API in Google Cloud Console
- **Billing**: Google requires billing account for Places API
- **Quota exceeded**: Check usage in Google Cloud Console

### **Environment Issues:**
- **File not found**: Make sure `.env` file exists in `/backend/` directory
- **Variables not loaded**: Restart the server after changing `.env`
- **Permissions**: Check file permissions on `.env`

## 📊 **Expected Performance**

With real APIs working:

- **LLM Proposals**: 8-15 activities in ~10-30 seconds
- **Provider Verification**: Real venue counts for each activity
- **Coverage Analysis**: 80%+ success rate on 25+ test vibes
- **Romania-Specific**: Thermal baths, castles, Carpathian activities
- **Multilingual**: Proper Romanian translations and cultural context

## 🎉 **Success Indicators**

You'll know it's working when:

1. **✅ `npm run test:apis`** shows both APIs working
2. **✅ `npm run ontology:propose`** generates real activities (not errors)
3. **✅ `LIVE=1 npm run ontology:check`** shows actual venue counts
4. **✅ `npm run ontology:coverage`** achieves ≥80% success rate
5. **✅ Vibe mapping** returns intelligent results instead of generic fallbacks

## 💡 **Next Steps After Setup**

1. **Generate your first real proposal** with Claude
2. **Verify activities** exist in Romania with live Google Places
3. **Test coverage** on Romanian and English vibes  
4. **Apply safe changes** to production ontology
5. **Monitor and iterate** based on user feedback

**Once the APIs are configured, your ontology expansion system will be fully autonomous and intelligent!** 🧠✨
