package tools;

import java.io.BufferedReader;
import java.io.FileReader;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class DatabaseSetup {
    // Database credentials
    private static final String DB_URL = "jdbc:mysql://srmkart.cpyqq6omexjw.ap-south-1.rds.amazonaws.com:3306/?allowMultiQueries=true";
    private static final String USER = "admin";
    private static final String PASS = "Moorthi_9787";

    public static void main(String[] args) {
        System.out.println("Starting Database Setup...");

        try (Connection conn = DriverManager.getConnection(DB_URL, USER, PASS);
                Statement stmt = conn.createStatement()) {

            System.out.println("Connected to MySQL Server successfully.");

            // Read schema file
            String schemaFilePath = "tools/schema.sql";
            StringBuilder sqlBuilder = new StringBuilder();

            try (BufferedReader reader = new BufferedReader(new FileReader(schemaFilePath))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    // Ignore comments and empty lines
                    if (!line.trim().startsWith("--") && !line.trim().isEmpty()) {
                        sqlBuilder.append(line).append(" ");
                    }
                }
            }

            String[] sqlStatements = sqlBuilder.toString().split(";");

            for (String sql : sqlStatements) {
                if (!sql.trim().isEmpty()) {
                    System.out.println(
                            "Executing: " + sql.trim().substring(0, Math.min(sql.trim().length(), 50)) + "...");
                    stmt.execute(sql.trim());
                }
            }

            System.out.println("Database and tables created successfully!");

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Setup failed. Please check your MySQL credentials and status.");
        }
    }
}
