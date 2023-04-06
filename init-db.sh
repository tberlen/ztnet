#!/bin/bash

set -e

cmd="$@"

# Create .env file
cat << EOF > .env
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public
ZT_ADDR=${ZT_ADDR}
NEXT_PUBLIC_SITE_NAME=${NEXT_PUBLIC_SITE_NAME}
NEXT_PUBLIC_APP_VERSION=${NEXT_PUBLIC_APP_VERSION}
EOF

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

# apply migrations to the database
echo "Applying migrations to the database..."
npx prisma migrate deploy
echo "Migrations applied successfully!"

>&2 echo "Executing command"
exec $cmd