/**
 * Claude Agent Memory System
 * 
 * Persistent memory layer that allows Claude to learn from past experiences,
 * avoid repeating mistakes, and improve vibe-to-activity mappings over time.
 */

import fs from 'fs/promises';
import path from 'path';

export interface MemoryEntry {
  vibe: string;
  successful: boolean;
  issues?: string[];
  bestActivities?: string[];
  timestamp: number;
  userFeedback?: 'helpful' | 'not_helpful' | 'mixed';
  searchResults?: {
    totalFound: number;
    topFiveTypes: string[];
    diversityScore: number;
    avgRating: number;
  };
  reflections?: string[];
  adaptations?: string[];
}

export interface SemanticMatch {
  vibe: string;
  similarity: number;
  entry: MemoryEntry;
}

class ClaudeAgentMemory {
  private store: Map<string, MemoryEntry[]> = new Map();
  private memoryFilePath: string;
  private isLoaded: boolean = false;

  constructor() {
    this.memoryFilePath = path.join(process.cwd(), 'data', 'agent_memory.json');
  }

  /**
   * Load memory from persistent storage
   */
  async load(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.memoryFilePath);
      await fs.mkdir(dataDir, { recursive: true });

      // Load existing memory
      const data = await fs.readFile(this.memoryFilePath, 'utf-8');
      const memoryData = JSON.parse(data);
      
      this.store = new Map(Object.entries(memoryData));
      console.log('🧠 Claude memory loaded:', this.store.size, 'vibe categories');
    } catch (error) {
      // File doesn't exist or is corrupted, start fresh
      console.log('🧠 Starting with fresh Claude memory');
      this.store = new Map();
    }
    
    this.isLoaded = true;
  }

  /**
   * Save memory to persistent storage
   */
  async save(): Promise<void> {
    try {
      const memoryData = Object.fromEntries(this.store);
      await fs.writeFile(this.memoryFilePath, JSON.stringify(memoryData, null, 2));
      console.log('💾 Claude memory saved:', this.store.size, 'vibe categories');
    } catch (error) {
      console.error('❌ Failed to save Claude memory:', error);
    }
  }

  /**
   * Store a new memory entry
   */
  async storeEntry(vibe: string, entry: MemoryEntry): Promise<void> {
    await this.load();
    
    const normalizedVibe = this.normalizeVibe(vibe);
    const entries = this.store.get(normalizedVibe) || [];
    
    // Add timestamp if not provided
    if (!entry.timestamp) {
      entry.timestamp = Date.now();
    }
    
    entries.push(entry);
    
    // Keep only last 10 entries per vibe to prevent memory bloat
    if (entries.length > 10) {
      entries.splice(0, entries.length - 10);
    }
    
    this.store.set(normalizedVibe, entries);
    await this.save();
    
    console.log(`🧠 Stored memory for "${vibe}":`, entry.successful ? '✅ Success' : '❌ Issues');
  }

  /**
   * Recall similar past experiences for a vibe
   */
  async recall(vibe: string, limit: number = 5): Promise<SemanticMatch[]> {
    await this.load();
    
    const normalizedVibe = this.normalizeVibe(vibe);
    const matches: SemanticMatch[] = [];
    
    // First, look for exact matches
    const exactEntries = this.store.get(normalizedVibe) || [];
    exactEntries.forEach(entry => {
      matches.push({
        vibe: normalizedVibe,
        similarity: 1.0,
        entry
      });
    });
    
    // Then, look for semantic similarities
    for (const [storedVibe, entries] of this.store) {
      if (storedVibe === normalizedVibe) continue;
      
      const similarity = this.calculateSimilarity(normalizedVibe, storedVibe);
      if (similarity > 0.3) { // Threshold for relevance
        entries.forEach(entry => {
          matches.push({
            vibe: storedVibe,
            similarity,
            entry
          });
        });
      }
    }
    
    // Sort by similarity and recency, return top matches
    return matches
      .sort((a, b) => {
        // Prioritize similarity, then recency
        if (Math.abs(a.similarity - b.similarity) > 0.1) {
          return b.similarity - a.similarity;
        }
        return b.entry.timestamp - a.entry.timestamp;
      })
      .slice(0, limit);
  }

  /**
   * Get learning insights from memory
   */
  async getLearningInsights(vibe: string): Promise<{
    successPatterns: string[];
    commonIssues: string[];
    bestActivities: string[];
    adaptationSuggestions: string[];
  }> {
    const matches = await this.recall(vibe, 10);
    
    const successPatterns: string[] = [];
    const commonIssues: string[] = [];
    const bestActivities: string[] = [];
    const adaptationSuggestions: string[] = [];
    
    matches.forEach(match => {
      if (match.entry.successful) {
        if (match.entry.bestActivities) {
          bestActivities.push(...match.entry.bestActivities);
        }
        if (match.entry.reflections) {
          successPatterns.push(...match.entry.reflections);
        }
      } else {
        if (match.entry.issues) {
          commonIssues.push(...match.entry.issues);
        }
      }
      
      if (match.entry.adaptations) {
        adaptationSuggestions.push(...match.entry.adaptations);
      }
    });
    
    return {
      successPatterns: [...new Set(successPatterns)],
      commonIssues: [...new Set(commonIssues)],
      bestActivities: [...new Set(bestActivities)],
      adaptationSuggestions: [...new Set(adaptationSuggestions)]
    };
  }

  /**
   * Update memory based on user feedback
   */
  async updateWithFeedback(vibe: string, feedback: 'helpful' | 'not_helpful' | 'mixed'): Promise<void> {
    await this.load();
    
    const normalizedVibe = this.normalizeVibe(vibe);
    const entries = this.store.get(normalizedVibe) || [];
    
    // Update the most recent entry
    if (entries.length > 0) {
      const latestEntry = entries[entries.length - 1];
      latestEntry.userFeedback = feedback;
      latestEntry.successful = feedback === 'helpful';
      
      await this.save();
      console.log(`🔄 Updated memory with feedback: ${feedback} for "${vibe}"`);
    }
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<{
    totalVibes: number;
    totalEntries: number;
    successRate: number;
    topIssues: string[];
    recentAdaptations: string[];
  }> {
    await this.load();
    
    let totalEntries = 0;
    let successfulEntries = 0;
    const allIssues: string[] = [];
    const recentAdaptations: string[] = [];
    
    for (const entries of this.store.values()) {
      totalEntries += entries.length;
      
      entries.forEach(entry => {
        if (entry.successful) successfulEntries++;
        if (entry.issues) allIssues.push(...entry.issues);
        if (entry.adaptations && entry.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000) {
          recentAdaptations.push(...entry.adaptations);
        }
      });
    }
    
    // Count issue frequency
    const issueCounts = new Map<string, number>();
    allIssues.forEach(issue => {
      issueCounts.set(issue, (issueCounts.get(issue) || 0) + 1);
    });
    
    const topIssues = Array.from(issueCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
    
    return {
      totalVibes: this.store.size,
      totalEntries,
      successRate: totalEntries > 0 ? successfulEntries / totalEntries : 0,
      topIssues,
      recentAdaptations: [...new Set(recentAdaptations)]
    };
  }

  /**
   * Clear old memories (cleanup)
   */
  async cleanup(olderThanDays: number = 30): Promise<void> {
    await this.load();
    
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    let removedCount = 0;
    
    for (const [vibe, entries] of this.store) {
      const filteredEntries = entries.filter(entry => entry.timestamp > cutoffTime);
      
      if (filteredEntries.length !== entries.length) {
        removedCount += entries.length - filteredEntries.length;
        
        if (filteredEntries.length === 0) {
          this.store.delete(vibe);
        } else {
          this.store.set(vibe, filteredEntries);
        }
      }
    }
    
    if (removedCount > 0) {
      await this.save();
      console.log(`🧹 Cleaned up ${removedCount} old memory entries`);
    }
  }

  /**
   * Normalize vibe text for consistent storage
   */
  private normalizeVibe(vibe: string): string {
    return vibe.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate semantic similarity between two vibes
   */
  private calculateSimilarity(vibe1: string, vibe2: string): number {
    const words1 = new Set(vibe1.split(' '));
    const words2 = new Set(vibe2.split(' '));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    // Jaccard similarity with length bonus
    const jaccard = intersection.size / union.size;
    const lengthBonus = Math.min(words1.size, words2.size) / Math.max(words1.size, words2.size);
    
    return jaccard * 0.7 + lengthBonus * 0.3;
  }
}

// Singleton instance
export const AgentMemory = new ClaudeAgentMemory();

// Helper functions for easy access
export async function storeMemory(vibe: string, entry: MemoryEntry): Promise<void> {
  return AgentMemory.storeEntry(vibe, entry);
}

export async function recallMemory(vibe: string, limit?: number): Promise<SemanticMatch[]> {
  return AgentMemory.recall(vibe, limit);
}

export async function updateMemoryFeedback(vibe: string, feedback: 'helpful' | 'not_helpful' | 'mixed'): Promise<void> {
  return AgentMemory.updateWithFeedback(vibe, feedback);
}

export async function getMemoryStats(): Promise<ReturnType<ClaudeAgentMemory['getStats']>> {
  return AgentMemory.getStats();
}
