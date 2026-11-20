# Multi-stage build for optimized image size
FROM eclipse-temurin:25-jdk-alpine AS build

WORKDIR /app

# Copy gradle files
COPY gradle gradle
COPY gradlew .
COPY build.gradle .
COPY settings.gradle .

# Copy source code
COPY src src

# Build the application
RUN ./gradlew bootJar --no-daemon

# Runtime stage
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR from build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check: the app has no actuator, so check that the port accepts connections.
# Spring only opens it once the context (including the DB connection) is up.
HEALTHCHECK --interval=15s --timeout=3s --start-period=60s --retries=5 \
  CMD nc -z 127.0.0.1 ${SERVER_PORT:-8080} || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]