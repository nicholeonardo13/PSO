#!/bin/zsh

export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH="$JAVA_HOME/bin:$PATH"

# Kill anything on port 4000 first
lsof -ti :4000 | xargs kill -9 2>/dev/null && echo "Stopped existing process on port 4000" || true

cd "$(dirname "$0")/backend-spring"

JDBC_DATABASE_URL=jdbc:postgresql://localhost:5432/pso_db \
DATABASE_USERNAME=pso_user \
DATABASE_PASSWORD=pso_password \
JWT_SECRET=pso_super_secret_jwt_key_change_in_production \
mvn spring-boot:run
