package com.srmkart.dao;

import com.srmkart.model.Listing;
import com.srmkart.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class WishlistDAO {
    
    public boolean toggleWishlist(int userId, int listingId) {
        boolean exists = false;
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT id FROM wishlist WHERE user_id = ? AND listing_id = ?")) {
            ps.setInt(1, userId);
            ps.setInt(2, listingId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) exists = true;
        } catch (Exception e) { 
            e.printStackTrace(); 
            return false; 
        }

        if (exists) {
            try (Connection conn = DBConnection.getConnection();
                 PreparedStatement ps = conn.prepareStatement("DELETE FROM wishlist WHERE user_id = ? AND listing_id = ?")) {
                ps.setInt(1, userId);
                ps.setInt(2, listingId);
                return ps.executeUpdate() > 0;
            } catch (Exception e) { e.printStackTrace(); return false; }
        } else {
            try (Connection conn = DBConnection.getConnection();
                 PreparedStatement ps = conn.prepareStatement("INSERT INTO wishlist (user_id, listing_id) VALUES (?, ?)")) {
                ps.setInt(1, userId);
                ps.setInt(2, listingId);
                return ps.executeUpdate() > 0;
            } catch (Exception e) { e.printStackTrace(); return false; }
        }
    }

    public List<Integer> getUserWishlistIds(int userId) {
        List<Integer> list = new ArrayList<>();
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement("SELECT listing_id FROM wishlist WHERE user_id = ?")) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                list.add(rs.getInt("listing_id"));
            }
        } catch (Exception e) { e.printStackTrace(); }
        return list;
    }

    public List<Listing> getWishlistForUser(int userId) {
        List<Listing> list = new ArrayList<>();
        String query = "SELECT l.* FROM wishlist w JOIN listings l ON w.listing_id = l.id WHERE w.user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Listing item = new Listing();
                item.setId(rs.getInt("id"));
                item.setUserId(rs.getInt("user_id"));
                item.setTitle(rs.getString("title"));
                item.setPrice(rs.getBigDecimal("price"));
                item.setConditionStatus(rs.getString("condition_status"));
                item.setStatus(rs.getString("status"));
                list.add(item);
            }
        } catch (Exception e) { e.printStackTrace(); }
        return list;
    }
}
