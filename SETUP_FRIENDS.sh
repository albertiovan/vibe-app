#!/bin/bash

# Friends System Setup Script
# Run this to set up the friends system database

echo "🚀 Setting up Friends System..."
echo ""

# Check if PostgreSQL is running
echo "1️⃣ Checking PostgreSQL..."
if ! psql -d vibe_app -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Error: PostgreSQL is not running or vibe_app database doesn't exist"
    echo "   Please start PostgreSQL and ensure vibe_app database exists"
    exit 1
fi
echo "✅ PostgreSQL is running"
echo ""

# Run the migration
echo "2️⃣ Running database migration..."
cd backend
psql -d vibe_app -f database/migrations/014_friends_system.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed. Check the error messages above."
    exit 1
fi
echo ""

# Verify tables were created
echo "3️⃣ Verifying tables..."
TABLES=$(psql -d vibe_app -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('users', 'friendships', 'blocked_users', 'user_reports');")

if [ "$TABLES" -eq 4 ]; then
    echo "✅ All 4 tables created successfully!"
else
    echo "⚠️  Warning: Expected 4 tables, found $TABLES"
fi
echo ""

echo "🎉 Friends System setup complete!"
echo ""
echo "Next steps:"
echo "1. Restart your backend server: cd backend && npm run dev"
echo "2. Reload your app (press 'r' in Expo)"
echo "3. Navigate to Profile > Friends"
echo ""
echo "Your new IP: 192.168.3.77"
echo "API URL: http://192.168.3.77:3000"
