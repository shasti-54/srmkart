package com.srmkart.service;

import com.srmkart.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

public class StatsService {
    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        com.srmkart.dao.RatingDAO ratingDAO = new com.srmkart.dao.RatingDAO();
        
        try (Connection conn = DBConnection.getConnection()) {
            // 1. Active Listings
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM listings WHERE status = 'active'")) {
                ResultSet rs = ps.executeQuery();
                if (rs.next()) stats.put("activeListings", String.format("%,d", rs.getInt(1)));
            }
            
            // 2. Registered Students
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM users")) {
                ResultSet rs = ps.executeQuery();
                if (rs.next()) stats.put("registeredStudents", String.format("%,d", rs.getInt(1)));
            }
            
            // 3. Traded on Campus (Sum of purchase prices)
            try (PreparedStatement ps = conn.prepareStatement("SELECT SUM(price) FROM purchases")) {
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    double totalValue = rs.getDouble(1);
                    if (totalValue >= 100000) {
                        stats.put("tradedOnCampus", String.format("₹%.1fL", totalValue / 100000.0));
                    } else {
                        stats.put("tradedOnCampus", String.format("₹%,.0f", totalValue));
                    }
                }
            }
            
            // 4. Average Seller Rating
            double avgRating = ratingDAO.getPlatformAverageRating();
            stats.put("avgSellerRating", String.format("%.1f", avgRating));

        } catch (Exception e) {
            e.printStackTrace();
            // Fallbacks
            stats.putIfAbsent("activeListings", "0");
            stats.putIfAbsent("registeredStudents", "0");
            stats.putIfAbsent("tradedOnCampus", "0");
            stats.putIfAbsent("avgSellerRating", "4.8");
        }
        
        return stats;
    }
}
