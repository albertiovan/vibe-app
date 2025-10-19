#!/usr/bin/env tsx
/**
 * Apply Ontology Expansion
 * 
 * Merges verified (non-experimental) activity subtypes and vibe lexicon
 * entries into the main ontology files, keeping experimental entries separate.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  type ActivitySubtype, 
  type VibeEntry,
  OntologyValidator 
} from '../../src/domain/activities/ontology/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ApplyOptions {
  dryRun?: boolean;
  includeExperimental?: boolean;
  backupExisting?: boolean;
}

interface ApplyResult {
  applied: {
    subtypes: ActivitySubtype[];
    vibeEntries: VibeEntry[];
  };
  experimental: {
    subtypes: ActivitySubtype[];
    vibeEntries: VibeEntry[];
  };
  conflicts: string[];
  backupPaths: string[];
}

class OntologyApplier {
  private readonly ontologyDir: string;
  private readonly experimentalDir: string;

  constructor() {
    this.ontologyDir = path.resolve(__dirname, '../../src/domain/activities/ontology');
    this.experimentalDir = path.join(this.ontologyDir, 'experimental');
  }

  async apply(proposalPath: string, options: ApplyOptions = {}): Promise<ApplyResult> {
    console.log('🔄 Applying ontology expansion...');
    
    // Load proposal
    const proposal = await this.loadProposal(proposalPath);
    
    // Load existing ontology
    const existing = await this.loadExistingOntology();
    
    // Separate production-ready from experimental
    const { production, experimental } = this.separateByReadiness(proposal, options);
    
    // Check for conflicts
    const conflicts = this.checkConflicts(production, existing);
    if (conflicts.length > 0 && !options.dryRun) {
      throw new Error(`Conflicts detected: ${conflicts.join(', ')}`);
    }
    
    let backupPaths: string[] = [];
    
    if (!options.dryRun) {
      // Create backups
      if (options.backupExisting) {
        backupPaths = await this.createBackups(existing);
      }
      
      // Apply production-ready changes
      await this.applyProduction(production, existing);
      
      // Save experimental entries separately
      await this.saveExperimental(experimental);
      
      console.log('✅ Ontology expansion applied successfully');
    } else {
      console.log('🔍 Dry run - no changes made');
    }
    
    return {
      applied: production,
      experimental,
      conflicts,
      backupPaths
    };
  }

  private async loadProposal(proposalPath: string): Promise<{ subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] }> {
    const content = await fs.readFile(proposalPath, 'utf-8');
    const proposal = JSON.parse(content);
    
    return {
      subtypes: [...(proposal.newSubtypes || []), ...(proposal.updatedSubtypes || [])],
      vibeEntries: proposal.vibeLexiconAdditions || []
    };
  }

  private async loadExistingOntology(): Promise<{ subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] }> {
    const subtypesPath = path.join(this.ontologyDir, 'activities.json');
    const vibesPath = path.join(this.ontologyDir, 'vibe_lexicon.json');
    
    let existingSubtypes: ActivitySubtype[] = [];
    let existingVibes: VibeEntry[] = [];
    
    try {
      const subtypesContent = await fs.readFile(subtypesPath, 'utf-8');
      const subtypesData = JSON.parse(subtypesContent);
      existingSubtypes = Array.isArray(subtypesData) ? subtypesData : subtypesData.subtypes || [];
    } catch (error) {
      console.log('📝 No existing activities.json found - will create new');
    }
    
    try {
      const vibesContent = await fs.readFile(vibesPath, 'utf-8');
      const vibesData = JSON.parse(vibesContent);
      existingVibes = Array.isArray(vibesData) ? vibesData : vibesData.entries || [];
    } catch (error) {
      console.log('📝 No existing vibe_lexicon.json found - will create new');
    }
    
    return {
      subtypes: existingSubtypes,
      vibeEntries: existingVibes
    };
  }

  private separateByReadiness(
    proposal: { subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] },
    options: ApplyOptions
  ): { production: typeof proposal, experimental: typeof proposal } {
    
    const productionSubtypes = proposal.subtypes.filter(s => 
      !s.experimental || options.includeExperimental
    );
    
    const experimentalSubtypes = proposal.subtypes.filter(s => 
      s.experimental && !options.includeExperimental
    );
    
    // For now, all vibe entries go to production (they're lower risk)
    const productionVibes = proposal.vibeEntries;
    const experimentalVibes: VibeEntry[] = [];
    
    return {
      production: {
        subtypes: productionSubtypes,
        vibeEntries: productionVibes
      },
      experimental: {
        subtypes: experimentalSubtypes,
        vibeEntries: experimentalVibes
      }
    };
  }

  private checkConflicts(
    production: { subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] },
    existing: { subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] }
  ): string[] {
    const conflicts: string[] = [];
    
    // Check subtype ID conflicts
    const existingSubtypeIds = new Set(existing.subtypes.map(s => s.id));
    const conflictingSubtypes = production.subtypes.filter(s => 
      existingSubtypeIds.has(s.id)
    );
    
    conflicts.push(...conflictingSubtypes.map(s => `Subtype ID conflict: ${s.id}`));
    
    // Check vibe entry ID conflicts
    const existingVibeIds = new Set(existing.vibeEntries.map(v => v.id));
    const conflictingVibes = production.vibeEntries.filter(v => 
      existingVibeIds.has(v.id)
    );
    
    conflicts.push(...conflictingVibes.map(v => `Vibe entry ID conflict: ${v.id}`));
    
    return conflicts;
  }

  private async createBackups(existing: { subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] }): Promise<string[]> {
    const backupDir = path.join(this.ontologyDir, 'backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPaths: string[] = [];
    
    // Backup activities
    if (existing.subtypes.length > 0) {
      const activitiesBackupPath = path.join(backupDir, `activities-${timestamp}.json`);
      await fs.writeFile(activitiesBackupPath, JSON.stringify(existing.subtypes, null, 2));
      backupPaths.push(activitiesBackupPath);
    }
    
    // Backup vibe lexicon
    if (existing.vibeEntries.length > 0) {
      const vibesBackupPath = path.join(backupDir, `vibe_lexicon-${timestamp}.json`);
      await fs.writeFile(vibesBackupPath, JSON.stringify(existing.vibeEntries, null, 2));
      backupPaths.push(vibesBackupPath);
    }
    
    console.log(`💾 Created ${backupPaths.length} backup files`);
    return backupPaths;
  }

  private async applyProduction(
    production: { subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] },
    existing: { subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] }
  ): Promise<void> {
    
    // Merge subtypes
    const mergedSubtypes = [...existing.subtypes, ...production.subtypes];
    
    // Merge vibe entries
    const mergedVibes = [...existing.vibeEntries, ...production.vibeEntries];
    
    // Ensure directories exist
    await fs.mkdir(this.ontologyDir, { recursive: true });
    
    // Write activities.json
    const activitiesData = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      subtypes: mergedSubtypes,
      stats: {
        total: mergedSubtypes.length,
        categories: [...new Set(mergedSubtypes.map(s => s.category))].length,
        experimental: mergedSubtypes.filter(s => s.experimental).length
      }
    };
    
    const activitiesPath = path.join(this.ontologyDir, 'activities.json');
    await fs.writeFile(activitiesPath, JSON.stringify(activitiesData, null, 2));
    
    // Write vibe_lexicon.json
    const vibesData = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      entries: mergedVibes,
      stats: {
        total: mergedVibes.length,
        languages: ['en', 'ro']
      }
    };
    
    const vibesPath = path.join(this.ontologyDir, 'vibe_lexicon.json');
    await fs.writeFile(vibesPath, JSON.stringify(vibesData, null, 2));
    
    // Update provider mapping files
    await this.updateProviderMappings(mergedSubtypes);
    
    console.log(`✅ Applied ${production.subtypes.length} subtypes and ${production.vibeEntries.length} vibe entries`);
  }

  private async saveExperimental(experimental: { subtypes: ActivitySubtype[], vibeEntries: VibeEntry[] }): Promise<void> {
    if (experimental.subtypes.length === 0 && experimental.vibeEntries.length === 0) {
      return;
    }
    
    await fs.mkdir(this.experimentalDir, { recursive: true });
    
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (experimental.subtypes.length > 0) {
      const expSubtypesPath = path.join(this.experimentalDir, `subtypes-${timestamp}.json`);
      await fs.writeFile(expSubtypesPath, JSON.stringify({
        note: "Experimental subtypes - not used in production until verified",
        subtypes: experimental.subtypes
      }, null, 2));
    }
    
    if (experimental.vibeEntries.length > 0) {
      const expVibesPath = path.join(this.experimentalDir, `vibes-${timestamp}.json`);
      await fs.writeFile(expVibesPath, JSON.stringify({
        note: "Experimental vibe entries - not used in production until verified",
        entries: experimental.vibeEntries
      }, null, 2));
    }
    
    console.log(`📋 Saved ${experimental.subtypes.length} experimental subtypes and ${experimental.vibeEntries.length} experimental vibe entries`);
  }

  private async updateProviderMappings(subtypes: ActivitySubtype[]): Promise<void> {
    // Extract Google Places mappings
    const googleMappings: Record<string, { types: string[], keywords: string[] }> = {};
    const osmMappings: Record<string, any> = {};
    const otmMappings: Record<string, string[]> = {};
    
    subtypes.forEach(subtype => {
      if (subtype.google && (subtype.google.types.length > 0 || subtype.google.keywords.length > 0)) {
        googleMappings[subtype.id] = subtype.google;
      }
      
      if (subtype.osm) {
        osmMappings[subtype.id] = subtype.osm;
      }
      
      if (subtype.otm?.kinds) {
        otmMappings[subtype.id] = subtype.otm.kinds;
      }
    });
    
    // Write mapping files
    const mappingsDir = path.join(this.ontologyDir, 'mappings');
    await fs.mkdir(mappingsDir, { recursive: true });
    
    await fs.writeFile(
      path.join(mappingsDir, 'google_places.json'),
      JSON.stringify({ mappings: googleMappings, lastUpdated: new Date().toISOString() }, null, 2)
    );
    
    await fs.writeFile(
      path.join(mappingsDir, 'osm_tags.json'),
      JSON.stringify({ mappings: osmMappings, lastUpdated: new Date().toISOString() }, null, 2)
    );
    
    await fs.writeFile(
      path.join(mappingsDir, 'otm_kinds.json'),
      JSON.stringify({ mappings: otmMappings, lastUpdated: new Date().toISOString() }, null, 2)
    );
    
    console.log('📊 Updated provider mapping files');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const proposalPath = args[0];
  const dryRun = args.includes('--dry-run');
  const includeExperimental = args.includes('--include-experimental');
  const noBackup = args.includes('--no-backup');
  
  if (!proposalPath) {
    console.error('Usage: tsx apply.ts <proposal-file.json> [--dry-run] [--include-experimental] [--no-backup]');
    process.exit(1);
  }

  try {
    const applier = new OntologyApplier();
    const result = await applier.apply(proposalPath, {
      dryRun,
      includeExperimental,
      backupExisting: !noBackup
    });
    
    console.log('\n📊 Apply Results:');
    console.log(`   Applied subtypes: ${result.applied.subtypes.length}`);
    console.log(`   Applied vibe entries: ${result.applied.vibeEntries.length}`);
    console.log(`   Experimental subtypes: ${result.experimental.subtypes.length}`);
    console.log(`   Experimental vibe entries: ${result.experimental.vibeEntries.length}`);
    
    if (result.conflicts.length > 0) {
      console.log('\n⚠️ Conflicts detected:');
      result.conflicts.forEach(conflict => console.log(`   • ${conflict}`));
    }
    
    if (result.backupPaths.length > 0) {
      console.log('\n💾 Backups created:');
      result.backupPaths.forEach(path => console.log(`   • ${path}`));
    }
    
    if (dryRun) {
      console.log('\n🔍 This was a dry run - no changes were made');
      console.log('Remove --dry-run flag to apply changes');
    }
    
  } catch (error) {
    console.error('❌ Apply failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
