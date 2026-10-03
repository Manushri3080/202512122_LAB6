# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /build

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests


# Run stage
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY --from=build /build/target/*.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]