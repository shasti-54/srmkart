package com.srmkart.dao;

import com.srmkart.model.Listing;
import com.srmkart.util.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ListingDAO {
    
    public List<Listing> getAllListings() {
        List<Listing> listings = new ArrayList<>();
        String sql = "SELECT l.*, u.name as seller_name, c.name as category_name " +
                     "FROM listings l " +
                     "JOIN users u ON l.user_id = u.id " +
                     "JOIN categories c ON l.category_id = c.id " +
                     "WHERE l.status = 'active' ORDER BY l.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                listings.add(extractListingFromResultSet(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return listings;
    }

    public Listing findById(int id) {
        String sql = "SELECT l.*, u.name as seller_name, c.name as category_name " +
                     "FROM listings l " +
                     "JOIN users u ON l.user_id = u.id " +
                     "JOIN categories c ON l.category_id = c.id " +
                     "WHERE l.id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return extractListingFromResultSet(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean createListing(Listing listing) {
        String sql = "INSERT INTO listings (user_id, title, description, price, category_id, condition_status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, listing.getUserId());
            stmt.setString(2, listing.getTitle());
            stmt.setString(3, listing.getDescription());
            stmt.setBigDecimal(4, listing.getPrice());
            stmt.setInt(5, listing.getCategoryId());
            stmt.setString(6, listing.getConditionStatus());
            
            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        listing.setId(generatedKeys.getInt(1));
                    }
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public List<Listing> searchListings(String query, String categoryId) {
        List<Listing> listings = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT l.*, u.name as seller_name, c.name as category_name " +
                     "FROM listings l JOIN users u ON l.user_id = u.id JOIN categories c ON l.category_id = c.id " +
                     "WHERE l.status = 'active' ");
        
        List<Object> params = new ArrayList<>();
        if (query != null && !query.trim().isEmpty()) {
            sql.append("AND l.title LIKE ? ");
            params.add("%" + query.trim() + "%");
        }
        if (categoryId != null && !categoryId.trim().isEmpty()) {
            sql.append("AND l.category_id = ? ");
            params.add(Integer.parseInt(categoryId));
        }
        
        sql.append("ORDER BY l.created_at DESC");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    listings.add(extractListingFromResultSet(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return listings;
    }

    private Listing extractListingFromResultSet(ResultSet rs) throws SQLException {
        Listing listing = new Listing();
        listing.setId(rs.getInt("id"));
        listing.setUserId(rs.getInt("user_id"));
        listing.setTitle(rs.getString("title"));
        listing.setDescription(rs.getString("description"));
        listing.setPrice(rs.getBigDecimal("price"));
        listing.setCategoryId(rs.getInt("category_id"));
        listing.setConditionStatus(rs.getString("condition_status"));
        listing.setStatus(rs.getString("status"));
        listing.setCreatedAt(rs.getTimestamp("created_at"));
        
        // Joined fields
        listing.setSellerName(rs.getString("seller_name"));
        listing.setCategoryName(rs.getString("category_name"));
        
        // Fetch first image URL if needed (we could also do this via another DAO or a JOIN)
        return listing;
    }
}
