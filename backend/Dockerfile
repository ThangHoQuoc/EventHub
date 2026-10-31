# ==========================================
# Multi-stage Dockerfile for EventHub Backend
# ==========================================

# Stage 1: Build JAR with Maven & Eclipse Temurin JDK 21
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Copy Maven Wrapper & pom.xml
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Download dependencies (offline mode cache)
RUN ./mvnw dependency:go-offline -B || true

# Copy source code and build production jar
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Minimal Production JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create unprivileged application user
RUN addgroup -S eventhub && adduser -S eventhub -G eventhub

# Copy compiled JAR from builder stage
COPY --from=builder /workspace/target/*.jar app.jar
RUN chown -R eventhub:eventhub /app

USER eventhub

EXPOSE 8080

ENV JAVA_TOOL_OPTIONS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -Duser.timezone=Asia/Ho_Chi_Minh"

ENTRYPOINT ["java", "-jar", "app.jar"]
