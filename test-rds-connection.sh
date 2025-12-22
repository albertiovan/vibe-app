#!/bin/bash

# Test RDS Connection
echo "Testing RDS connection..."

# Load production environment
source backend/.env.production

# Extract connection details from DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\(.*\)/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\(.*\):.*/\1/p')

echo "Connecting to: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Test connection
PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\/\/.*:\(.*\)@.*/\1/p') \
/opt/homebrew/Cellar/postgresql@16/16.10/bin/psql \
  -h $DB_HOST \
  -p $DB_PORT \
  -U $DB_USER \
  -d $DB_NAME \
  -c "SELECT version();"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ RDS connection successful!"
else
    echo ""
    echo "❌ RDS connection failed!"
    echo "Please check:"
    echo "1. Database password is correct"
    echo "2. Security group allows your IP (109.96.66.162)"
    echo "3. RDS instance is 'Available'"
fi
