package com.srmkart.servlet;

import com.srmkart.util.DBConnection;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.Statement;

@WebServlet("/api/setup")
public class SetupServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("text/plain");
        try {
            String schemaSql = loadSchema();
            executeSql(schemaSql);
            resp.getWriter().write("Database Setup Successful! Tables created.");
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("Setup Failed: " + e.getMessage());
            e.printStackTrace(resp.getWriter());
        }
    }

    private String loadSchema() throws IOException {
        // Since schema.sql is in tools/ in root, but at runtime we need it accessible.
        // Actually, we can just hardcode the core tables here for safety or read from classpath if we move it.
        // I will provide the core SQL directly to ensure it works.
        return "CREATE TABLE IF NOT EXISTS users (" +
               "    id INT AUTO_INCREMENT PRIMARY KEY," +
               "    name VARCHAR(255) NOT NULL," +
               "    email VARCHAR(255) NOT NULL UNIQUE," +
               "    password_hash VARCHAR(255) NOT NULL," +
               "    college VARCHAR(255) DEFAULT 'SRM'," +
               "    profile_pic VARCHAR(500)," +
               "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
               ");" +
               "CREATE TABLE IF NOT EXISTS categories (" +
               "    id INT AUTO_INCREMENT PRIMARY KEY," +
               "    name VARCHAR(100) NOT NULL UNIQUE," +
               "    icon VARCHAR(255)" +
               ");" +
               "CREATE TABLE IF NOT EXISTS listings (" +
               "    id INT AUTO_INCREMENT PRIMARY KEY," +
               "    user_id INT NOT NULL," +
               "    title VARCHAR(255) NOT NULL," +
               "    description TEXT," +
               "    price DECIMAL(10,2) NOT NULL," +
               "    category_id INT NOT NULL," +
               "    condition_status VARCHAR(50) NOT NULL," +
               "    status VARCHAR(50) DEFAULT 'active'," +
               "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
               "    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE," +
               "    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT" +
               ");" +
               "CREATE TABLE IF NOT EXISTS listing_images (" +
               "    id INT AUTO_INCREMENT PRIMARY KEY," +
               "    listing_id INT NOT NULL," +
               "    image_url VARCHAR(500) NOT NULL," +
               "    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE" +
               ");" +
               "CREATE TABLE IF NOT EXISTS messages (" +
               "    id INT AUTO_INCREMENT PRIMARY KEY," +
               "    listing_id INT NOT NULL," +
               "    sender_id INT NOT NULL," +
               "    receiver_id INT NOT NULL," +
               "    content TEXT NOT NULL," +
               "    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
               "    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE," +
               "    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE," +
               "    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE" +
               ");" +
               "CREATE TABLE IF NOT EXISTS wishlist (" +
               "    id INT AUTO_INCREMENT PRIMARY KEY," +
               "    user_id INT NOT NULL," +
               "    listing_id INT NOT NULL," +
               "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
               "    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE," +
               "    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE," +
               "    UNIQUE(user_id, listing_id)" +
               ");" +
               "INSERT IGNORE INTO categories (name, icon) VALUES " +
               "('Books', 'book'), ('Electronics', 'laptop'), ('Stationery', 'pencil'), " +
               "('Lab Tools', 'beaker'), ('Furniture', 'chair'), ('Others', 'box');";
    }

    private void executeSql(String sql) throws Exception {
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {
            String[] queries = sql.split(";");
            for (String query : queries) {
                if (!query.trim().isEmpty()) {
                    stmt.execute(query);
                }
            }
        }
    }
}
