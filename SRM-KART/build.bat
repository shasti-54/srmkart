@echo off
echo ==============================================
echo SRM Kart - Build and Deploy Script
echo ==============================================

echo [1/3] Building Angular Frontend...
cd frontend
call npm install
call npx ng build --configuration production
if %ERRORLEVEL% neq 0 (
    echo Frontend build failed!
    exit /b %ERRORLEVEL%
)
cd ..

echo [2/3] Copying Frontend to Backend Webapp Directory...
rmdir /s /q "backend\src\main\webapp\browser" 2>nul
rmdir /s /q "backend\src\main\webapp\assets" 2>nul
del "backend\src\main\webapp\index.html" 2>nul
del "backend\src\main\webapp\*.js" 2>nul
del "backend\src\main\webapp\*.css" 2>nul

xcopy /E /Y /I "frontend\dist\frontend\browser" "backend\src\main\webapp\"

echo [3/3] Building Java Backend WAR File...
cd backend
SET MVN_CMD=mvn
IF NOT DEFINED MVN_CMD (SET MVN_CMD=%TEMP%\maven\apache-maven-3.9.6\bin\mvn.cmd)
IF NOT EXIST "%MVN_CMD%" (SET MVN_CMD=%TEMP%\maven\apache-maven-3.9.6\bin\mvn.cmd)
call "%TEMP%\maven\apache-maven-3.9.6\bin\mvn.cmd" package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo Backend build failed!
    exit /b %ERRORLEVEL%
)
cd ..

echo ==============================================
echo Build completed successfully!
echo The deployable WAR file is located at:
echo backend\target\srmkart.war
echo ==============================================
echo Please drop this WAR file into your Tomcat "webapps" folder and start Tomcat.
pause
