# MCP PostgreSQL Setup Guide

## Overview
This guide explains how to set up the PostgreSQL MCP (Model Context Protocol) server for Vibe App, enabling Claude Haiku to query our curated activity and venue database.

## Architecture
- **Database**: PostgreSQL with curated activities and venues
- **MCP Server**: Read-only access via `@modelcontextprotocol/server-postgres`
- **Runtime LLM**: Claude 3 Haiku (20240307) queries via MCP tools
- **Builder LLM**: Claude Sonnet 4.5 (Windsurf) for development

## Prerequisites
1. PostgreSQL 16+ installed and running
2. Windsurf IDE (VS Code-based)
3. Node.js 18+ for NPX

## Step 1: Install PostgreSQL

```bash
# Install via Homebrew (macOS)
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Verify installation
psql --version
```

## Step 2: Create Vibe Database

```bash
# Create database
createdb vibe_app

# Verify connection
psql vibe_app
```

## Step 3: Configure MCP in Windsurf

### Option A: User Settings (Global)
1. Press `Cmd + Shift + P`
2. Type: "Preferences: Open User Settings (JSON)"
3. Add the MCP configuration from `mcp-config.template.json`

### Option B: Workspace Settings (Project-specific)
1. Create `.vscode/mcp.json` in project root
2. Copy contents from `backend/mcp-config.template.json`
3. Update the PostgreSQL URL with your credentials

**Connection String Format:**
```
postgresql://username:password@localhost:5432/vibe_app
```

**Default (no password):**
```
postgresql://localhost/vibe_app
```

## Step 4: Run Database Migrations

```bash
cd backend
npm run db:migrate
```

## Step 5: Seed Initial Data

```bash
npm run db:seed
```

## Step 6: Test MCP Connection

The MCP server provides:
- **Tool**: `query` - Execute read-only SQL queries
- **Resources**: Schema information for each table

Test by asking Claude:
```
"Show me all activities in the database"
```

Claude will execute:
```sql
SELECT id, name, category, region FROM activities LIMIT 10;
```

## Database Schema

### Activities Table
```sql
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  seasonality TEXT[],
  indoor_outdoor TEXT,
  energy_level TEXT,
  duration_min INT,
  duration_max INT,
  tags TEXT[],
  hero_image_url TEXT,
  youtube_video_ids TEXT[],
  city TEXT,
  region TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Venues Table
```sql
CREATE TABLE venues (
  id SERIAL PRIMARY KEY,
  activity_id INT REFERENCES activities(id),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  region TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  price_tier TEXT,
  booking_url TEXT,
  seasonality TEXT[],
  tags TEXT[],
  phone TEXT,
  website TEXT,
  rating NUMERIC,
  rating_count INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Notes
- MCP server operates in **READ-ONLY** mode for Claude queries
- Admin operations use separate backend API with full read/write access
- Never commit database credentials to git
- Use environment variables for connection strings

## Troubleshooting

### "Server not found" error
- Verify MCP configuration in Windsurf settings
- Check PostgreSQL is running: `brew services list`
- Restart Windsurf after config changes

### Connection refused
- Ensure PostgreSQL service is running
- Verify database exists: `psql -l`
- Check connection string format

### Query timeout
- Optimize database queries with indexes
- Check query complexity
- Increase timeout in MCP config if needed

## References
- [MCP PostgreSQL Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Windsurf MCP Guide](https://docs.windsurf.ai/mcp)
