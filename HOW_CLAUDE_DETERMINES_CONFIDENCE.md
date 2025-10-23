# How Claude Determines Confidence Levels

## Your Question

"How does Claude API determine if a vibe is suitable for mandatory matching or for a general request?"

## The Answer: We Tell It Explicitly

Claude doesn't figure this out on its own - **we give it explicit instructions** in the system prompt. Here's exactly how:

## The System Prompt

Located in: `/backend/src/services/llm/semanticVibeAnalyzer.ts`

### Instructions We Give Claude

```typescript
const SEMANTIC_ANALYSIS_PROMPT = `
You are an expert at understanding human emotions and needs.

⚠️ **CRITICAL: CONFIDENCE LEVELS FOR KEYWORD MATCHING**

**CONFIDENCE >= 0.9 (HIGH SPECIFICITY):**
Use for EXPLICIT activity name requests. Keywords become MANDATORY filters.
Examples:
- "mountain biking" → confidence: 0.95, keywordPrefer: [mountain, biking, bike, MTB]
- "rock climbing" → confidence: 0.95, keywordPrefer: [rock, climbing, climb, boulder]
- "kayaking" → confidence: 0.95, keywordPrefer: [kayak, kayaking, paddling]

These requests get ONLY activities matching keywords (strict filtering).

**CONFIDENCE < 0.9 (GENERAL REQUEST):**
Use for broad/thematic requests. Keywords become PREFERRED (boosting, not filtering).
Examples:
- "adventure in the mountains" → confidence: 0.75, keywordPrefer: [mountain, adventure, outdoor]
- "something fun outdoors" → confidence: 0.6, keywordPrefer: [outdoor, fun, nature]
- "relax in nature" → confidence: 0.7, keywordPrefer: [nature, relax, outdoor]

These requests get activities WITH keywords first, then others (variety maintained).

**RULE:** If user says exact activity name → confidence 0.9+
         If user describes vibe/theme → confidence < 0.9
`;
```

## How It Works

### Step 1: User Makes Request
```
User types: "mountain biking"
```

### Step 2: Backend Calls Claude API
```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  messages: [{
    role: 'user',
    content: `Analyze this vibe: "mountain biking"`
  }],
  system: SEMANTIC_ANALYSIS_PROMPT  // ← The instructions above
});
```

### Step 3: Claude Reads Instructions
Claude sees our explicit rules:
- "mountain biking" is an **exact activity name**
- Rule says: "If user says exact activity name → confidence 0.9+"
- Therefore: Set confidence to 0.95

### Step 4: Claude Returns Analysis
```json
{
  "primaryIntent": "Go mountain biking on trails",
  "confidence": 0.95,
  "keywordPrefer": ["mountain", "biking", "bike", "MTB", "trail"],
  "reasoning": "User explicitly requested mountain biking activity by name"
}
```

### Step 5: Backend Uses Confidence
```typescript
if (analysis.confidence >= 0.9) {
  // MANDATORY keyword matching
  console.log('🎯 HIGH SPECIFICITY');
  activities = activities.filter(hasKeyword);
} else {
  // PREFERRED keyword boosting
  console.log('🌟 GENERAL REQUEST');
  activities.sort(byKeywordScore);
}
```

## Examples of Claude Following Instructions

### Example 1: Specific Activity Name

**Input:** "rock climbing"

**Claude thinks:**
1. "rock climbing" is an exact activity name
2. Instructions say: exact activity name → confidence 0.9+
3. User is very specific about what they want
4. Set confidence = 0.95

**Claude returns:**
```json
{
  "confidence": 0.95,
  "keywordPrefer": ["rock", "climbing", "climb", "boulder"],
  "reasoning": "User explicitly named rock climbing as desired activity"
}
```

**Result:** MANDATORY keyword matching → Only rock climbing activities

### Example 2: General Theme

**Input:** "adventure in the mountains"

**Claude thinks:**
1. This is NOT an exact activity name
2. It's a general theme/vibe description
3. Instructions say: vibe/theme → confidence < 0.9
4. User wants variety of mountain adventures
5. Set confidence = 0.75

**Claude returns:**
```json
{
  "confidence": 0.75,
  "keywordPrefer": ["mountain", "adventure", "outdoor", "hiking"],
  "reasoning": "General mountain adventure theme - user wants variety of options"
}
```

**Result:** PREFERRED keyword boosting → Variety of mountain activities

### Example 3: Vague Request

**Input:** "something fun"

**Claude thinks:**
1. Very vague, no specific activity or theme
2. Instructions say: vague → low confidence
3. Could mean anything
4. Set confidence = 0.5

**Claude returns:**
```json
{
  "confidence": 0.5,
  "keywordPrefer": ["fun", "entertainment"],
  "reasoning": "Very broad request - user wants suggestions across many categories"
}
```

**Result:** PREFERRED boosting → Wide variety

### Example 4: Specific + Context

**Input:** "I want to go kayaking on a lake"

**Claude thinks:**
1. "kayaking" is an exact activity name
2. Even though there's additional context ("on a lake")
3. Instructions say: exact activity name → confidence 0.9+
4. Set confidence = 0.95

**Claude returns:**
```json
{
  "confidence": 0.95,
  "keywordPrefer": ["kayak", "kayaking", "paddle", "lake"],
  "reasoning": "User explicitly requested kayaking activity by name"
}
```

**Result:** MANDATORY keyword matching → Only kayaking activities

## Claude's Decision Tree

```
┌─────────────────────────────┐
│   User Request Received     │
└──────────┬──────────────────┘
           │
           ▼
    ┌──────────────────┐
    │ Is this an exact │
    │ activity name?   │
    └──────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
    YES         NO
     │           │
     ▼           ▼
┌─────────┐  ┌──────────────┐
│confidence│  │  Describes   │
│  = 0.9+  │  │ vibe/theme?  │
└─────────┘  └──────┬───────┘
                    │
              ┌─────┴─────┐
              │           │
             YES         NO (vague)
              │           │
              ▼           ▼
         ┌─────────┐  ┌─────────┐
         │confidence│  │confidence│
         │ = 0.6-0.85│ │ = 0.3-0.6│
         └─────────┘  └─────────┘
```

## The Key: Pattern Recognition

Claude uses its language understanding to detect patterns:

### Patterns for HIGH Confidence (0.9+)
- Contains specific activity verbs: "biking", "climbing", "kayaking", "swimming"
- Uses activity nouns: "yoga", "pottery", "painting", "hiking"
- References specific sports/activities by name
- Clear, unambiguous intent

**Examples:**
- "mountain biking" ✓
- "I want to try rock climbing" ✓
- "kayaking" ✓
- "go pottery" ✓

### Patterns for MEDIUM Confidence (0.6-0.85)
- Describes themes/vibes: "adventure", "relaxing", "creative"
- Uses adjectives + context: "outdoor fun", "peaceful nature"
- Combines vibe + location: "adventure in mountains"
- General category mentions: "sports", "outdoor activities"

**Examples:**
- "adventure in the mountains" ✓
- "something creative and hands-on" ✓
- "relax in nature" ✓
- "outdoor fun with friends" ✓

### Patterns for LOW Confidence (0.3-0.6)
- Vague/ambiguous: "something fun", "idk surprise me"
- Mood only: "I'm bored", "feeling energetic"
- No activity hints: "what should I do?"

**Examples:**
- "something fun" ✓
- "I'm bored" ✓
- "surprise me" ✓
- "idk" ✓

## Testing the System

You can see Claude's reasoning in the console:

### For "mountain biking":
```
🧠 Semantic analysis: {
  intent: "Go mountain biking on trails",
  confidence: 0.95,
  reasoning: "User explicitly requested mountain biking by name"
}
🎯 HIGH SPECIFICITY: MANDATORY keyword filter
```

### For "adventure in the mountains":
```
🧠 Semantic analysis: {
  intent: "Mountain adventure experience",
  confidence: 0.75,
  reasoning: "General mountain adventure theme - wants variety"
}
🌟 GENERAL REQUEST: Keyword BOOSTING (not mandatory)
```

## Confidence Calibration

We can adjust the threshold (currently 0.9) if needed:

```typescript
// Current setting
const isSpecificActivity = analysis.confidence >= 0.9;

// Could adjust to be more/less strict
const isSpecificActivity = analysis.confidence >= 0.85; // More strict
const isSpecificActivity = analysis.confidence >= 0.95; // Less strict
```

**0.9 seems to be the sweet spot:**
- Specific activity names: 0.95
- Clear themes: 0.7-0.85
- Vague requests: 0.3-0.6

## Summary

**Q:** "How does Claude know?"

**A:** We explicitly tell it through:

1. ✅ **System prompt instructions** - Clear rules about confidence levels
2. ✅ **Examples in prompt** - Shows exactly what confidence to use when
3. ✅ **Pattern recognition** - Claude uses its training to match patterns
4. ✅ **Explicit decision rule** - "exact activity name = 0.9+, vibe/theme = < 0.9"

Claude doesn't magically know - it follows our instructions intelligently based on its understanding of language patterns!

The system is **deterministic and rule-based**, not random or mysterious. We control Claude's behavior through prompt engineering.
