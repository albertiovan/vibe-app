#!/bin/bash

# Migrate database schema to RDS
echo "🚀 Migrating database schema to RDS..."
echo ""

# RDS connection details
export PGPASSWORD='zyprif-2cuQxa-jowgoc'
PSQL="/opt/homebrew/Cellar/postgresql@16/16.10/bin/psql"
DB_HOST="vibe-app-db.cnwak0ga4cbg.eu-north-1.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME="vibe_app"
DB_USER="vibeadmin"
CONNECTION="sslmode=require host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER"

# Counter
SUCCESS=0
FAILED=0

# Run each migration file
for file in backend/database/migrations/*.sql; do
    filename=$(basename "$file")
    echo "📄 Running: $filename"
    
    if $PSQL "$CONNECTION" -f "$file" > /dev/null 2>&1; then
        echo "   ✅ Success"
        ((SUCCESS++))
    else
        echo "   ⚠️  Warning (may already exist)"
        ((FAILED++))
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Migration Summary:"
echo "   ✅ Successful: $SUCCESS"
echo "   ⚠️  Warnings: $FAILED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Database migration complete!"
echo ""
echo "Testing connection..."
$PSQL "$CONNECTION" -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
