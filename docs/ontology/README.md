# Activity Ontology Expansion System

## Overview

The Activity Ontology is the core knowledge base that powers vibe-to-activity mapping in our app. It defines what activities users can do, how they map to emotional vibes, and how to find them through various provider APIs (Google Places, OpenStreetMap, OpenTripMap).

## Architecture

```
domain/activities/ontology/
├── schema.ts                 # TypeScript schemas and validation
├── activities.json           # Main activity subtypes (production)
├── vibe_lexicon.json        # Vibe-to-activity mappings
├── mappings/                # Provider-specific mappings
│   ├── google_places.json
│   ├── osm_tags.json
│   └── otm_kinds.json
├── experimental/            # Unverified activities
├── proposals/               # LLM-generated expansion proposals
├── snapshots/               # Historical exports
├── reports/                 # QA and coverage reports
└── backups/                 # Safety backups
```

## Core Concepts

### Activity Subtype
A concrete, verifiable activity that users can do:

```typescript
{
  id: "mountain-biking",
  label: "Mountain Biking",
  category: "adventure",
  verbs: ["ride", "pedal", "navigate"],
  energy: "high",
  indoorOutdoor: "outdoor",
  seasonality: "all",
  keywords: {
    en: ["mountain bike", "trail", "cycling"],
    ro: ["bicicletă de munte", "traseu", "ciclism"]
  },
  synonyms: {
    en: ["MTB", "off-road cycling"],
    ro: ["MTB", "ciclism off-road"]
  },
  google: {
    types: ["bicycle_store", "park"],
    keywords: ["mountain biking", "bike trail"]
  }
}
```

### Vibe Entry
Maps user emotional expressions to activity categories:

```typescript
{
  id: "adventure-seeking",
  cues: {
    en: ["I want adventure", "need thrills", "seeking excitement"],
    ro: ["vreau aventură", "am nevoie de emoții", "caut emoții"]
  },
  preferredCategories: ["adventure", "sports"],
  disallowedCategories: ["wellness"]
}
```

## Expansion Workflow

### 1. Export Current State
```bash
tsx scripts/ontology/export.ts
```
Creates a snapshot of the current ontology for analysis.

### 2. Generate LLM Proposal
```bash
tsx scripts/ontology/propose.ts
```
Uses Claude to propose new activities and vibe mappings based on:
- Current ontology gaps
- Romania-specific activities
- Common user vibes
- Provider verifiability

### 3. Validate Proposal
```bash
tsx scripts/ontology/lint.ts proposals/proposal-YYYY-MM-DD.json
```
Checks for:
- Schema compliance
- Unique IDs
- Required fields (verbs, keywords, Romanian translations)
- Provider mappings

### 4. Check Provider Verifiability
```bash
tsx scripts/ontology/check_providers.ts proposals/proposal-YYYY-MM-DD.json
```
Validates that activities can be found through provider APIs:
- **Production Ready**: Strong Google Places mapping + high confidence
- **Experimental**: Weak mappings or unverified
- **Needs Work**: No viable provider mappings

### 5. Apply Safe Changes
```bash
tsx scripts/ontology/apply.ts proposals/proposal-YYYY-MM-DD.json
```
Merges production-ready activities into main ontology, keeps experimental ones separate.

### 6. Run QA Coverage
```bash
tsx scripts/qa/coverage.ts
```
Tests 25+ curated vibes to ensure ≥80% can be mapped to verifiable activities.

## Safety & Quality Controls

### Experimental Flag
New activities marked `experimental: true` are:
- Excluded from production app
- Stored separately in `experimental/`
- Require manual verification before promotion

### Provider Verification
Every production activity must have:
- At least one Google Places mapping (types or keywords)
- Realistic chance of returning results in Romania
- Optional OSM/OTM mappings for additional coverage

### Multilingual Support
All activities require:
- English keywords and synonyms
- Romanian keywords and synonyms
- Action verbs in both languages

### Quality Metrics
- **Coverage**: ≥80% of test vibes map to verifiable activities
- **Confidence**: Average mapping confidence ≥0.7
- **Distribution**: No single category >50% of activities
- **Verifiability**: ≥90% of production activities have provider mappings

## Examples

### English Vibe Mapping
```
"I want adventure" → 
  Categories: [adventure, sports]
  Activities: mountain-biking, rock-climbing, zipline
  Google Types: [amusement_park, tourist_attraction]
  Keywords: ["adventure", "outdoor", "thrill"]
```

### Romanian Vibe Mapping
```
"Vreau aventură" →
  Categories: [adventure, sports]  
  Activities: mountain-biking, rock-climbing, zipline
  Google Types: [amusement_park, tourist_attraction]
  Keywords: ["aventură", "în aer liber", "emoții"]
```

### Provider Query Generation
```
Activity: thermal-baths
Google: types=["spa", "tourist_attraction"], keywords=["thermal baths", "hot springs"]
OSM: tags={"amenity": "spa", "spa": "thermal"}
OTM: kinds=["thermal_springs", "spa"]
```

## Development Commands

```bash
# Export current ontology
npm run ontology:export

# Generate expansion proposal  
npm run ontology:propose

# Validate proposal
npm run ontology:lint proposals/latest.json

# Check provider verifiability
npm run ontology:check proposals/latest.json

# Apply changes (dry run first)
npm run ontology:apply proposals/latest.json --dry-run
npm run ontology:apply proposals/latest.json

# Run coverage analysis
npm run ontology:coverage

# Run all tests
npm test ontology
```

## Governance

### Adding New Activities
1. **Automated**: LLM proposals reviewed and validated
2. **Manual**: Direct additions must follow schema and pass validation
3. **Community**: User feedback drives expansion priorities

### Quality Assurance
- All changes require validation and provider verification
- Experimental activities isolated until proven
- Regular coverage analysis ensures user vibe support
- Backups created before major changes

### Version Control
- Semantic versioning for ontology releases
- Git history tracks all changes
- Rollback capability through backups
- Change logs document additions/modifications

## Troubleshooting

### Low Coverage (<80%)
1. Check uncovered vibes in coverage report
2. Add missing activity categories
3. Improve Romanian translations
4. Enhance LLM prompt for better understanding

### Provider Verification Failures
1. Review Google Places types for validity
2. Add more specific keywords
3. Test with live API calls (`LIVE=1`)
4. Mark problematic activities as experimental

### Schema Validation Errors
1. Check required fields (verbs, keywords, Romanian)
2. Validate ID format (kebab-case)
3. Ensure category values are valid
4. Fix provider mapping structure

## Contributing

1. **Fork** the repository
2. **Create** feature branch: `feat/ontology-expansion-YYYY-MM-DD`
3. **Run** validation: `npm run ontology:lint`
4. **Test** coverage: `npm run ontology:coverage`  
5. **Submit** PR with validation results

## License

The activity ontology is part of the vibe-app project and follows the same licensing terms.
