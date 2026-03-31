package com.srmkart.service;

import com.srmkart.dao.ListingDAO;
import com.srmkart.model.Listing;
import java.util.List;

public class ListingService {
    private ListingDAO listingDAO = new ListingDAO();

    public List<Listing> getAllListings() {
        return listingDAO.getAllListings();
    }

    public Listing getListingById(int id) {
        return listingDAO.findById(id);
    }

    public boolean createListing(Listing listing) {
        return listingDAO.createListing(listing);
    }

    public List<Listing> searchListings(String query, String categoryId, Double minPrice, Double maxPrice) {
        return listingDAO.searchListings(query, categoryId, minPrice, maxPrice);
    }
}
