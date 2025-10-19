#!/usr/bin/env tsx
/**
 * Provider Verifiability Checker
 * 
 * Tests if activity subtypes can be verified through provider APIs:
 * - Google Places (types/keywords)
 * - OSM Overpass (tags/queries)  
 * - OpenTripMap (kinds)
 * 
 * Runs offline validation by default, with optional live probing.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  type ActivitySubtype, 
  OntologyValidator,
  COMMON_GOOGLE_PLACES_TYPES 
} from '../../src/domain/activities/ontology/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface ProviderCheck {
  subtype: ActivitySubtype;
  google: {
    hasTypes: boolean;
    hasKeywords: boolean;
    validTypes: string[];
    invalidTypes: string[];
    confidence: 'high' | 'medium' | 'low';
  };
  osm: {
    hasMapping: boolean;
    confidence: 'high' | 'medium' | 'low';
  };
  otm: {
    hasMapping: boolean;
    confidence: 'high' | 'medium' | 'low';
  };
  overall: {
    verifiable: boolean;
    confidence: 'high' | 'medium' | 'low';
    recommendation: 'production' | 'experimental' | 'needs_work';
  };
}

interface VerifiabilityReport {
  totalSubtypes: number;
  productionReady: number;
  experimental: number;
  needsWork: number;
  checks: ProviderCheck[];
  summary: {
    googleCoverage: number;
    osmCoverage: number;
    otmCoverage: number;
    overallVerifiable: number;
  };
}

class ProviderVerifier {
  private readonly ROMANIA_TEST_COORDS = { lat: 44.4268, lng: 26.1025 }; // Bucharest
  private readonly LIVE_MODE = process.env.LIVE === '1';

  async checkProviders(subtypes: ActivitySubtype[]): Promise<VerifiabilityReport> {
    console.log(`🔍 Checking provider verifiability for ${subtypes.length} subtypes...`);
    if (this.LIVE_MODE) {
      console.log('🌐 LIVE mode enabled - will make actual API calls');
    } else {
      console.log('📋 Offline mode - using heuristic validation');
    }

    const checks: ProviderCheck[] = [];
    
    for (const subtype of subtypes) {
      const check = await this.checkSubtype(subtype);
      checks.push(check);
    }

    return this.generateReport(checks);
  }

  private async checkSubtype(subtype: ActivitySubtype): Promise<ProviderCheck> {
    const googleCheck = await this.checkGooglePlaces(subtype);
    const osmCheck = this.checkOSM(subtype);
    const otmCheck = this.checkOTM(subtype);

    // Calculate overall verifiability
    const verifiable = googleCheck.confidence !== 'low' || 
                      osmCheck.confidence !== 'low' || 
                      otmCheck.confidence !== 'low';

    let overallConfidence: 'high' | 'medium' | 'low' = 'low';
    if (googleCheck.confidence === 'high' || (googleCheck.confidence === 'medium' && osmCheck.confidence === 'medium')) {
      overallConfidence = 'high';
    } else if (googleCheck.confidence === 'medium' || osmCheck.confidence === 'medium' || otmCheck.confidence === 'medium') {
      overallConfidence = 'medium';
    }

    let recommendation: 'production' | 'experimental' | 'needs_work';
    if (overallConfidence === 'high' && verifiable) {
      recommendation = 'production';
    } else if (overallConfidence === 'medium' && verifiable) {
      recommendation = 'experimental';
    } else {
      recommendation = 'needs_work';
    }

    return {
      subtype,
      google: googleCheck,
      osm: osmCheck,
      otm: otmCheck,
      overall: {
        verifiable,
        confidence: overallConfidence,
        recommendation
      }
    };
  }

  private async checkGooglePlaces(subtype: ActivitySubtype): Promise<ProviderCheck['google']> {
    const hasTypes = subtype.google?.types && subtype.google.types.length > 0;
    const hasKeywords = subtype.google?.keywords && subtype.google.keywords.length > 0;

    if (!hasTypes && !hasKeywords) {
      return {
        hasTypes: false,
        hasKeywords: false,
        validTypes: [],
        invalidTypes: [],
        confidence: 'low'
      };
    }

    // Validate types against known Google Places types
    const validTypes = (subtype.google?.types || []).filter(type => 
      COMMON_GOOGLE_PLACES_TYPES.includes(type as any)
    );
    const invalidTypes = (subtype.google?.types || []).filter(type => 
      !COMMON_GOOGLE_PLACES_TYPES.includes(type as any)
    );

    // Calculate confidence based on mapping quality
    let confidence: 'high' | 'medium' | 'low' = 'low';
    
    if (validTypes.length > 0 && hasKeywords) {
      confidence = 'high';
    } else if (validTypes.length > 0 || (hasKeywords && subtype.google!.keywords.length >= 2)) {
      confidence = 'medium';
    }

    // Live API check (if enabled)
    if (this.LIVE_MODE && confidence !== 'low') {
      try {
        const liveResult = await this.testGooglePlacesLive(subtype);
        if (!liveResult.hasResults) {
          confidence = confidence === 'high' ? 'medium' : 'low';
        }
      } catch (error) {
        console.warn(`⚠️ Live Google check failed for ${subtype.id}:`, error);
      }
    }

    return {
      hasTypes,
      hasKeywords,
      validTypes,
      invalidTypes,
      confidence
    };
  }

  private checkOSM(subtype: ActivitySubtype): ProviderCheck['osm'] {
    const hasMapping = !!(subtype.osm?.tags || subtype.osm?.ql);
    
    if (!hasMapping) {
      return { hasMapping: false, confidence: 'low' };
    }

    // Heuristic confidence based on tag quality
    let confidence: 'high' | 'medium' | 'low' = 'medium';
    
    if (subtype.osm?.tags) {
      const tagCount = Object.keys(subtype.osm.tags).length;
      const hasSpecificTags = Object.keys(subtype.osm.tags).some(key => 
        ['amenity', 'leisure', 'tourism', 'sport'].includes(key)
      );
      
      if (hasSpecificTags && tagCount >= 2) {
        confidence = 'high';
      } else if (hasSpecificTags || tagCount >= 1) {
        confidence = 'medium';
      } else {
        confidence = 'low';
      }
    }

    return { hasMapping, confidence };
  }

  private checkOTM(subtype: ActivitySubtype): ProviderCheck['otm'] {
    const hasMapping = !!(subtype.otm?.kinds && subtype.otm.kinds.length > 0);
    
    if (!hasMapping) {
      return { hasMapping: false, confidence: 'low' };
    }

    // OTM kinds are generally reliable if they exist
    const confidence: 'high' | 'medium' | 'low' = subtype.otm!.kinds!.length >= 2 ? 'high' : 'medium';

    return { hasMapping, confidence };
  }

  private async testGooglePlacesLive(subtype: ActivitySubtype): Promise<{ hasResults: boolean; count: number }> {
    try {
      // Import Google Maps client directly
      const { Client } = await import('@googlemaps/google-maps-services-js');
      const client = new Client({});
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ Google Maps API key not configured, using heuristic');
        throw new Error('Google Maps API key not configured');
      }
      
      console.log(`🌐 Testing live Google Places API for: ${subtype.label}`);
      
      let totalResults = 0;
      const location = `${this.ROMANIA_TEST_COORDS.lat},${this.ROMANIA_TEST_COORDS.lng}`;
      
      // Test with types if available
      if (subtype.google?.types && subtype.google.types.length > 0) {
        for (const type of subtype.google.types.slice(0, 2)) { // Test first 2 types
          try {
            const response = await client.placesNearby({
              params: {
                key: apiKey,
                location: location,
                radius: 10000, // 10km around Bucharest
                type: type as any
              }
            });
            
            const results = response.data.results || [];
            totalResults += results.length;
            console.log(`  Type "${type}": ${results.length} results`);
            
            if (results.length > 0) break; // Found results, no need to test more types
          } catch (error) {
            console.warn(`  Type "${type}" failed:`, error instanceof Error ? error.message : error);
          }
        }
      }
      
      // Test with keywords if no type results and keywords available
      if (totalResults === 0 && subtype.google?.keywords && subtype.google.keywords.length > 0) {
        for (const keyword of subtype.google.keywords.slice(0, 2)) { // Test first 2 keywords
          try {
            const response = await client.textSearch({
              params: {
                key: apiKey,
                query: `${keyword} Bucharest Romania`,
                location: location,
                radius: 20000 // 20km for text search
              }
            });
            
            const results = response.data.results || [];
            totalResults += results.length;
            console.log(`  Keyword "${keyword}": ${results.length} results`);
            
            if (results.length > 0) break; // Found results, no need to test more keywords
          } catch (error) {
            console.warn(`  Keyword "${keyword}" failed:`, error instanceof Error ? error.message : error);
          }
        }
      }
      
      const hasResults = totalResults > 0;
      console.log(`  Total results for ${subtype.label}: ${totalResults}`);
      
      return { hasResults, count: totalResults };
      
    } catch (error) {
      console.error(`❌ Live Google Places test failed for ${subtype.label}:`, error);
      
      // Fallback to heuristic if API fails
      const hasStrongTypes = subtype.google?.types?.some(type => 
        ['restaurant', 'cafe', 'park', 'museum', 'gym', 'tourist_attraction'].includes(type)
      );
      
      const hasStrongKeywords = subtype.google?.keywords?.some(keyword =>
        keyword.length > 3 && !keyword.includes('generic')
      );

      const fallbackHasResults = hasStrongTypes || hasStrongKeywords;
      const fallbackCount = fallbackHasResults ? 5 : 0; // Conservative estimate
      
      console.log(`  Using fallback heuristic: ${fallbackHasResults ? 'likely has results' : 'unlikely to have results'}`);
      
      return { hasResults: fallbackHasResults, count: fallbackCount };
    }
  }

  private generateReport(checks: ProviderCheck[]): VerifiabilityReport {
    const productionReady = checks.filter(c => c.overall.recommendation === 'production').length;
    const experimental = checks.filter(c => c.overall.recommendation === 'experimental').length;
    const needsWork = checks.filter(c => c.overall.recommendation === 'needs_work').length;

    const googleCoverage = checks.filter(c => c.google.confidence !== 'low').length / checks.length;
    const osmCoverage = checks.filter(c => c.osm.confidence !== 'low').length / checks.length;
    const otmCoverage = checks.filter(c => c.otm.confidence !== 'low').length / checks.length;
    const overallVerifiable = checks.filter(c => c.overall.verifiable).length / checks.length;

    return {
      totalSubtypes: checks.length,
      productionReady,
      experimental,
      needsWork,
      checks,
      summary: {
        googleCoverage: Math.round(googleCoverage * 100),
        osmCoverage: Math.round(osmCoverage * 100),
        otmCoverage: Math.round(otmCoverage * 100),
        overallVerifiable: Math.round(overallVerifiable * 100)
      }
    };
  }
}

async function loadProposal(proposalPath: string): Promise<ActivitySubtype[]> {
  const content = await fs.readFile(proposalPath, 'utf-8');
  const proposal = JSON.parse(content);
  return proposal.newSubtypes || [];
}

async function saveReport(report: VerifiabilityReport, proposalPath: string): Promise<string> {
  const reportsDir = path.resolve(__dirname, '../src/domain/activities/ontology/reports');
  await fs.mkdir(reportsDir, { recursive: true });
  
  const timestamp = new Date().toISOString().split('T')[0];
  const basename = path.basename(proposalPath, '.json');
  const reportPath = path.join(reportsDir, `${basename}-verifiability-${timestamp}.json`);
  
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  return reportPath;
}

function displayReport(report: VerifiabilityReport): void {
  console.log('\n📊 Provider Verifiability Report:');
  console.log(`   Total subtypes: ${report.totalSubtypes}`);
  console.log(`   Production ready: ${report.productionReady} (${Math.round(report.productionReady/report.totalSubtypes*100)}%)`);
  console.log(`   Experimental: ${report.experimental} (${Math.round(report.experimental/report.totalSubtypes*100)}%)`);
  console.log(`   Needs work: ${report.needsWork} (${Math.round(report.needsWork/report.totalSubtypes*100)}%)`);
  
  console.log('\n🎯 Provider Coverage:');
  console.log(`   Google Places: ${report.summary.googleCoverage}%`);
  console.log(`   OpenStreetMap: ${report.summary.osmCoverage}%`);
  console.log(`   OpenTripMap: ${report.summary.otmCoverage}%`);
  console.log(`   Overall verifiable: ${report.summary.overallVerifiable}%`);

  console.log('\n✅ Production Ready Activities:');
  report.checks
    .filter(c => c.overall.recommendation === 'production')
    .slice(0, 5)
    .forEach(check => {
      console.log(`   • ${check.subtype.label} (${check.subtype.category})`);
      console.log(`     Google: ${check.google.validTypes.join(', ')} | ${check.subtype.google?.keywords?.join(', ') || 'none'}`);
    });

  if (report.needsWork > 0) {
    console.log('\n❌ Activities Needing Work:');
    report.checks
      .filter(c => c.overall.recommendation === 'needs_work')
      .slice(0, 3)
      .forEach(check => {
        console.log(`   • ${check.subtype.label}: ${check.overall.confidence} confidence`);
        if (!check.google.hasTypes && !check.google.hasKeywords) {
          console.log(`     Missing Google mappings`);
        }
        if (check.google.invalidTypes.length > 0) {
          console.log(`     Invalid Google types: ${check.google.invalidTypes.join(', ')}`);
        }
      });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const proposalPath = args[0];
  
  if (!proposalPath) {
    console.error('Usage: tsx check_providers.ts <proposal-file.json>');
    console.error('Environment: LIVE=1 to enable live API testing');
    process.exit(1);
  }

  try {
    const subtypes = await loadProposal(proposalPath);
    
    const verifier = new ProviderVerifier();
    const report = await verifier.checkProviders(subtypes);
    
    displayReport(report);
    
    const reportPath = await saveReport(report, proposalPath);
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
    // Exit with error if too many activities need work
    if (report.needsWork > report.totalSubtypes * 0.3) {
      console.log('\n⚠️ Too many activities need work (>30%). Consider improving provider mappings.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Provider check failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
