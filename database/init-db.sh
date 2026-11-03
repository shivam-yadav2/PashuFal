#!/usr/bin/env bash
# ==============================================================================
# Purvanchal Dairy & Pashu Kendra — MySQL Local Database Setup Script
# ==============================================================================
# Usage:
#   bash database/init-db.sh
#   Or with custom user/password:
#   DB_USER=root DB_PASS=mysecret DB_NAME=purvanchal_dairy bash database/init-db.sh
# ==============================================================================

set -e

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-}"
DB_NAME="${DB_NAME:-purvanchal_dairy}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "----------------------------------------------------------------------"
echo "  Purvanchal Dairy & Pashu Kendra — MySQL Local Initializer"
echo "  Target Database: ${DB_NAME} at ${DB_HOST}:${DB_PORT} (User: ${DB_USER})"
echo "----------------------------------------------------------------------"

# Build MySQL authentication arguments
MYSQL_AUTH="-h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER}"
if [ -n "${DB_PASS}" ]; then
  MYSQL_AUTH="${MYSQL_AUTH} -p${DB_PASS}"
fi

echo "1. Checking MySQL connection & creating database '${DB_NAME}'..."
mysql ${MYSQL_AUTH} -e "CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "2. Applying database schema (tables, foreign keys, indexes)..."
mysql ${MYSQL_AUTH} "${DB_NAME}" < "${SCRIPT_DIR}/schema.sql"

echo "3. Seeding initial business data (cattle, contacts, orders, dairy entries)..."
mysql ${MYSQL_AUTH} "${DB_NAME}" < "${SCRIPT_DIR}/seed.sql"

echo "----------------------------------------------------------------------"
echo "  [SUCCESS] Database '${DB_NAME}' initialized successfully!"
echo "  You can now update your .env file:"
echo "    MYSQL_HOST=${DB_HOST}"
echo "    MYSQL_PORT=${DB_PORT}"
echo "    MYSQL_USER=${DB_USER}"
echo "    MYSQL_PASSWORD=${DB_PASS}"
echo "    MYSQL_DATABASE=${DB_NAME}"
echo "----------------------------------------------------------------------"
