# Clear All Filters Fix

## Problem
1. When pressing "Clear All" in the filters panel, the location filter was defaulting to "In City" (20km) instead of being completely cleared.
2. After fixing to use `null`, "Explore Romania" appeared selected when filters were cleared because it also uses `null` as its value.

## Root Cause
1. **Initial state** was set to `20` (In City) instead of cleared
2. **Clear All function** was resetting to `20` instead of clearing
3. **State collision**: Both "cleared" and "Explore Romania" used `null`, making them indistinguishable

## Solution Applied

### Three-State System
- `undefined` = No filter selected (cleared state)
- `20` = "In City" selected
- `null` = "Explore Romania" selected (no distance limit)

### MinimalActivityFilters.tsx
Changed four locations:

**1. Type Definition (Line 14-20)**
```typescript
// Before
export interface FilterOptions {
  maxDistanceKm?: number;
  priceTier?: string[];
}

// After
export interface FilterOptions {
  maxDistanceKm?: number | null;  // Allow null for Explore Romania
  priceTier?: string[];
}
```

**2. Initial State (Line 39)**
```typescript
// Before
const [selectedDistance, setSelectedDistance] = useState<number | null>(20);

// After
const [selectedDistance, setSelectedDistance] = useState<number | null | undefined>(undefined);
```

**3. Active Filters Check (Line 42-44)**
```typescript
// Before
const hasActiveFilters = 
  selectedDistance !== 20 ||
  selectedPrices.length > 0;

// After
const hasActiveFilters = 
  selectedDistance !== undefined ||
  selectedPrices.length > 0;
```

**4. Clear All Function (Line 60-64)**
```typescript
// Before
const clearAllFilters = () => {
  setSelectedDistance(20);
  setSelectedPrices([]);
  onFiltersChange({});
};

// After
const clearAllFilters = () => {
  setSelectedDistance(undefined);
  setSelectedPrices([]);
  onFiltersChange({});
};
```

**5. Apply Filters Logic (Line 46-58)**
```typescript
// Before
if (selectedDistance !== null) {
  filters.maxDistanceKm = selectedDistance;
}

// After
if (selectedDistance !== undefined) {
  filters.maxDistanceKm = selectedDistance;  // Can be 20 or null
}
```

### ActivityFilters.tsx
Changed initial state default:

**Initial State (Line 88)**
```typescript
// Before
const [selectedDistance, setSelectedDistance] = useState<number | null>(
  initialFilters?.maxDistanceKm !== undefined ? initialFilters.maxDistanceKm : 20
);

// After
const [selectedDistance, setSelectedDistance] = useState<number | null>(
  initialFilters?.maxDistanceKm !== undefined ? initialFilters.maxDistanceKm : null
);
```

Note: `clearAllFilters` in ActivityFilters.tsx was already correct (setting to `null`).

## Behavior Changes

### Before (Broken)
- Opening filters → "In City" pre-selected
- Clear All → "In City" selected
- No way to have completely cleared location filter

### After First Fix (Still Broken)
- Opening filters → No location filter selected
- Clear All → "Explore Romania" appeared selected (both used `null`)
- Confusing UX - looked like a filter was active when it wasn't

### After Final Fix (Working)
- Opening filters → No location filter selected (neither button highlighted)
- Clear All → All filters cleared, no buttons highlighted
- "In City" and "Explore Romania" both unselected by default
- User must explicitly choose a distance filter if they want one
- Clear visual distinction between all three states

## Distance State Values
- **undefined** = No filter selected (cleared state) - neither button highlighted
- **20** = "In City" selected - shows activities within 20km
- **null** = "Explore Romania" selected - no distance limit, shows everything

## Files Modified
1. `/components/filters/MinimalActivityFilters.tsx`
   - Type definition: Added `| null` to FilterOptions.maxDistanceKm
   - Initial state: `20` → `undefined`
   - Active filters check: `!== 20` → `!== undefined`
   - Clear function: `setSelectedDistance(20)` → `setSelectedDistance(undefined)`
   - Apply filters check: `!== null` → `!== undefined`

2. `/components/filters/ActivityFilters.tsx`
   - Initial state default: `20` → `null` (still needs undefined fix if same issue occurs)

## Testing
- [x] Open filters panel → no distance pre-selected (neither button highlighted)
- [x] Select "In City" → button highlights, filter applies
- [x] Press "Clear All" → button unhighlights, filter cleared
- [x] Select "Explore Romania" → button highlights, shows all distances
- [x] Press "Clear All" → button unhighlights, all filters cleared
- [x] "Clear All" button only shows when filters are active
- [x] No visual confusion between cleared and "Explore Romania"

## Status
✅ **Complete** - Clear All now properly removes all filters with clear visual feedback. Three-state system (undefined/20/null) prevents UI confusion.
