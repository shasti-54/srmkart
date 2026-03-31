# Stage 1: Build the Angular Frontend
FROM node:20 AS frontend-build
WORKDIR /app/frontend

# Install dependencies first (for caching)
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build
COPY frontend/ ./
RUN npx ng build --configuration production

# Stage 2: Build the Java Backend (Maven)
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app

# Copy Maven files
COPY backend/pom.xml backend/
COPY backend/src backend/src

# Copy the built Angular frontend into Tomcat's webapp directory inside the backend source
COPY --from=frontend-build /app/frontend/dist/frontend/browser backend/src/main/webapp/

# Build the WAR file using Maven
RUN cd backend && mvn clean package -DskipTests

# Stage 3: Run the Application on Tomcat 9 (Java 21)
# Tomcat 9 is required because the backend uses javax.servlet (not jakarta)
FROM tomcat:9.0-jdk21-corretto

# Clear out any default Tomcat applications to keep it clean
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy our generated WAR file to ROOT.war so it serves at the bare domain (e.g. https://srmkart.render.com/)
COPY --from=backend-build /app/backend/target/srmkart.war /usr/local/tomcat/webapps/ROOT.war

# Render requires applications to bind to a port, Tomcat uses 8080 by default.
EXPOSE 8080

CMD ["catalina.sh", "run"]
