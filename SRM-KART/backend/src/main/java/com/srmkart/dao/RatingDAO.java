package com.srmkart.dao;

import com.srmkart.model.Rating;
import com.srmkart.util.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RatingDAO {

    public boolean createRating(Rating rating) {
        String sql = "INSERT INTO ratings (seller_id, buyer_id, listing_id, rating, comment) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, rating.getSellerId());
            stmt.setInt(2, rating.getBuyerId());
            stmt.setInt(3, rating.getListingId());
            stmt.setInt(4, rating.getRating());
            stmt.setString(5, rating.getComment());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Rating> getRatingsForSeller(int sellerId) {
        List<Rating> ratings = new ArrayList<>();
        String sql = "SELECT * FROM ratings WHERE seller_id = ? ORDER BY created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, sellerId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Rating r = new Rating();
                    r.setId(rs.getInt("id"));
                    r.setSellerId(rs.getInt("seller_id"));
                    r.setBuyerId(rs.getInt("buyer_id"));
                    r.setListingId(rs.getInt("listing_id"));
                    r.setRating(rs.getInt("rating"));
                    r.setComment(rs.getString("comment"));
                    r.setCreatedAt(rs.getTimestamp("created_at"));
                    ratings.add(r);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return ratings;
    }

    public double getAverageRatingForSeller(int sellerId) {
        String sql = "SELECT AVG(rating) FROM ratings WHERE seller_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, sellerId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble(1);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0.0;
    }

    public double getPlatformAverageRating() {
        String sql = "SELECT AVG(rating) FROM ratings";
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            if (rs.next()) {
                double avg = rs.getDouble(1);
                return avg > 0 ? avg : 4.8; // Fallback to premium feeling 4.8 if no ratings yet
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 4.8;
    }
}

