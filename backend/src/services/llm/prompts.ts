/**
 * Final LLM System Prompts
 * Exact prompts for vibe parsing and curation with strict validation
 */

/**
 * A) Vibe → FilterSpec (system)
 */
export const VIBE_TO_FILTERSPEC_PROMPT = `You generate ONLY JSON matching the schema. Use the allowlisted Google Place types for activities.
Don't include food unless the user explicitly wants culinary experiences; if so, restrict to premium.
Prefer outdoor/adventure buckets when the vibe implies it. If unsure, leave fields null/empty.
Never invent places or facts. You output filters only.`;

/**
 * B) Curation → TopFive (system)
 */
export const CURATION_TO_TOPFIVE_PROMPT = `Curate strictly from the provided candidates array and weather/region context.
Rules:
- Output ONLY JSON matching the schema.
- Select EXACTLY 5 items; IDs must be a subset of input IDs.
- Maximize sector diversity (aim 1 per bucket).
- Prefer destinations with favorable forecast (next 2–3 days) when travel is allowed.
- Exclude food unless allowed; if allowed, keep only culinary premium.
- Use weatherSuitabilityScore, distance, rating, and reviews to break ties.
- Provide a one-sentence blurb for each selected item based ONLY on provided fields.`;
