package com.srmkart.dao;

import com.srmkart.model.Listing;
import com.srmkart.util.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ListingDAO {
    
    public List<Listing> getAllListings() {
        List<Listing> listings = new ArrayList<>();
        String sql = "SELECT l.*, u.name as seller_name, c.name as category_name, " +
                     "(SELECT AVG(rating) FROM ratings WHERE seller_id = l.user_id) as seller_rating " +
                     "FROM listings l " +
                     "JOIN users u ON l.user_id = u.id " +
                     "JOIN categories c ON l.category_id = c.id " +
                     "WHERE l.status = 'active' ORDER BY l.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                listings.add(extractListingFromResultSet(rs, conn));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return listings;
    }

    public Listing findById(int id) {
        String sql = "SELECT l.*, u.name as seller_name, c.name as category_name, " +
                     "(SELECT AVG(rating) FROM ratings WHERE seller_id = l.user_id) as seller_rating " +
                     "FROM listings l " +
                     "JOIN users u ON l.user_id = u.id " +
                     "JOIN categories c ON l.category_id = c.id " +
                     "WHERE l.id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return extractListingFromResultSet(rs, conn);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean createListing(Listing listing) {
        String sql = "INSERT INTO listings (user_id, title, description, price, category_id, condition_status) VALUES (?, ?, ?, ?, ?, ?)";
        String imgSql = "INSERT INTO listing_images (listing_id, image_url) VALUES (?, ?)";
        
        Connection conn = null;
        try {
            conn = DBConnection.getConnection();
            conn.setAutoCommit(false); // Start transaction

            try (PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setInt(1, listing.getUserId());
                stmt.setString(2, listing.getTitle());
                stmt.setString(3, listing.getDescription());
                stmt.setBigDecimal(4, listing.getPrice());
                stmt.setInt(5, listing.getCategoryId());
                stmt.setString(6, listing.getConditionStatus());
                
                int affectedRows = stmt.executeUpdate();
                if (affectedRows == 0) {
                    conn.rollback();
                    return false;
                }

                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        int listingId = generatedKeys.getInt(1);
                        listing.setId(listingId);

                        // Insert All Image URLs
                        List<String> imageUrls = listing.getImageUrls();
                        if (imageUrls != null && !imageUrls.isEmpty()) {
                            try (PreparedStatement imgStmt = conn.prepareStatement(imgSql)) {
                                for (String url : imageUrls) {
                                    imgStmt.setInt(1, listingId);
                                    imgStmt.setString(2, url);
                                    imgStmt.executeUpdate();
                                }
                            }
                        }
                    }
                }
                
                conn.commit(); // Commit transaction
                return true;
            } catch (SQLException e) {
                if (conn != null) {
                    try { conn.rollback(); } catch (SQLException rollbackEx) { rollbackEx.printStackTrace(); }
                }
                System.err.println("SQL Error during listing creation:");
                System.err.println("Message: " + e.getMessage());
                System.err.println("SQL State: " + e.getSQLState());
                System.err.println("Error Code: " + e.getErrorCode());
                System.err.println("Parameters: UserID=" + listing.getUserId() + 
                                   ", Title=" + listing.getTitle() + 
                                   ", Price=" + listing.getPrice() + 
                                   ", CategoryID=" + listing.getCategoryId());
                e.printStackTrace();
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        } finally {
            if (conn != null) {
                try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
            }
        }
    }
    
    public List<Listing> searchListings(String query, String categoryId, Double minPrice, Double maxPrice) {
        List<Listing> listings = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT l.*, u.name as seller_name, c.name as category_name, " +
                     "(SELECT AVG(rating) FROM ratings WHERE seller_id = l.user_id) as seller_rating " +
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
        if (minPrice != null) {
            sql.append("AND l.price >= ? ");
            params.add(minPrice);
        }
        if (maxPrice != null) {
            sql.append("AND l.price <= ? ");
            params.add(maxPrice);
        }
        
        sql.append("ORDER BY l.created_at DESC");

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {
            
            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    listings.add(extractListingFromResultSet(rs, conn));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return listings;
    }

    public List<Listing> getListingsByUserId(int userId) {
        List<Listing> listings = new ArrayList<>();
        String sql = "SELECT l.*, u.name as seller_name, c.name as category_name, " +
                     "(SELECT AVG(rating) FROM ratings WHERE seller_id = l.user_id) as seller_rating " +
                     "FROM listings l " +
                     "JOIN users u ON l.user_id = u.id " +
                     "JOIN categories c ON l.category_id = c.id " +
                     "WHERE l.user_id = ? ORDER BY l.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    listings.add(extractListingFromResultSet(rs, conn));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return listings;
    }

    private Listing extractListingFromResultSet(ResultSet rs, Connection conn) throws SQLException {
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
        listing.setSellerRating(rs.getDouble("seller_rating"));
        
        // Image URLs (fetch all related images from listing_images table)
        try (PreparedStatement stmt = conn.prepareStatement("SELECT image_url FROM listing_images WHERE listing_id = ? ORDER BY id ASC")) {
            stmt.setInt(1, listing.getId());
            try (ResultSet imgRs = stmt.executeQuery()) {
                List<String> images = new ArrayList<>();
                while (imgRs.next()) {
                    images.add(imgRs.getString("image_url"));
                }
                listing.setImageUrls(images);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        
        return listing;
    }
}
