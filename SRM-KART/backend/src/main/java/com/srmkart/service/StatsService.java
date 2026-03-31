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
        
        // Mock fallback values
        stats.put("activeListings", "2,400+");
        stats.put("registeredStudents", "1,800");
        stats.put("tradedOnCampus", "₹4.2L");
        stats.put("avgSellerRating", "4.8");

        try (Connection conn = DBConnection.getConnection()) {
            // Get actual number of listings
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM listings WHERE status = 'active'")) {
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    int count = rs.getInt(1);
                    if (count > 0) {
                        stats.put("activeListings", String.format("%,d", count));
                    }
                }
            }
            
            // Get actual number of registered users
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM users")) {
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    int count = rs.getInt(1);
                    if (count > 0) {
                        stats.put("registeredStudents", String.format("%,d", count));
                    }
                }
            }
            
            // Calculate total generic traded value (sum of all listing prices)
            try (PreparedStatement ps = conn.prepareStatement("SELECT SUM(price) FROM listings")) {
                ResultSet rs = ps.executeQuery();
                if (rs.next()) {
                    double totalValue = rs.getDouble(1);
                    if (totalValue > 0) {
                        double lakhs = totalValue / 100000.0;
                        if (lakhs >= 1.0) {
                            stats.put("tradedOnCampus", String.format("₹%.1fL", lakhs));
                        } else {
                            stats.put("tradedOnCampus", String.format("₹%,.0f", totalValue));
                        }
                    }
                }
            }
            
            // Average seller rating remains a static 4.8 for now until a reviews table is created.

        } catch (Exception e) {
            e.printStackTrace();
        }
        
        return stats;
    }
}
