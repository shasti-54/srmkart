package com.srmkart.dao;

import com.srmkart.model.Purchase;
import com.srmkart.util.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PurchaseDAO {

    public boolean createPurchase(Purchase purchase) {
        String sql = "INSERT INTO purchases (buyer_id, listing_id, price) VALUES (?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, purchase.getBuyerId());
            stmt.setInt(2, purchase.getListingId());
            stmt.setBigDecimal(3, purchase.getPrice());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Purchase> getPurchasesByBuyerId(int buyerId) {
        List<Purchase> purchases = new ArrayList<>();
        String sql = "SELECT p.*, l.title as listing_title, u.id as seller_id, u.name as seller_name, " +
                     "(SELECT image_url FROM listing_images WHERE listing_id = l.id LIMIT 1) as listing_image_url " +
                     "FROM purchases p " +
                     "JOIN listings l ON p.listing_id = l.id " +
                     "JOIN users u ON l.user_id = u.id " +
                     "WHERE p.buyer_id = ? ORDER BY p.purchase_date DESC";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, buyerId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Purchase p = new Purchase();
                    p.setId(rs.getInt("id"));
                    p.setBuyerId(rs.getInt("buyer_id"));
                    p.setSellerId(rs.getInt("seller_id"));
                    p.setListingId(rs.getInt("listing_id"));
                    p.setPrice(rs.getBigDecimal("price"));
                    p.setPurchaseDate(rs.getTimestamp("purchase_date"));
                    p.setListingTitle(rs.getString("listing_title"));
                    p.setListingImageUrl(rs.getString("listing_image_url"));
                    p.setSellerName(rs.getString("seller_name"));
                    purchases.add(p);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return purchases;
    }
}
