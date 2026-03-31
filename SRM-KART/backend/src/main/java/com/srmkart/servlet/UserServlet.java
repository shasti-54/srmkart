package com.srmkart.servlet;

import com.google.gson.Gson;
import com.srmkart.dao.ListingDAO;
import com.srmkart.dao.WishlistDAO;
import com.srmkart.model.Listing;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/users/*")
public class UserServlet extends HttpServlet {
    private ListingDAO listingDAO = new ListingDAO();
    private WishlistDAO wishlistDAO = new WishlistDAO();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        String pathInfo = req.getPathInfo(); // /{id}/listings or /{id}/wishlist

        if (pathInfo == null || pathInfo.split("/").length < 3) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            return;
        }

        String[] parts = pathInfo.split("/");
        int id = Integer.parseInt(parts[1]);
        String action = parts[2];

        try {
            if ("listings".equals(action)) {
                // Fetch listings by this user. (We need a method in ListingDAO for this, but for now we filter in memory or we can just return all for simplicity)
                // Assuming we add a method getListingsByUserId in ListingDAO.
                // For now, return empty or implement it. 
                // Creating a basic implementation:
                resp.getWriter().write(gson.toJson(listingDAO.getAllListings().stream().filter(l -> l.getUserId() == id).toArray()));
            } else if ("wishlist".equals(action)) {
                List<Listing> wishlist = wishlistDAO.getWishlistForUser(id);
                resp.getWriter().write(gson.toJson(wishlist));
            } else {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        Integer authUserId = (Integer) req.getAttribute("userId");
        if (authUserId == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String pathInfo = req.getPathInfo();
        if (pathInfo != null && pathInfo.endsWith("/wishlist")) {
            String[] parts = pathInfo.split("/");
            if (parts.length >= 3) {
                int id = Integer.parseInt(parts[1]); // The user ID in the URL
                
                // Security check to only modify your own wishlist
                if (id != authUserId) {
                    resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    return;
                }

                // Expecting {"listingId": 123} in body
                WishlistRequest body = gson.fromJson(req.getReader(), WishlistRequest.class);
                if (wishlistDAO.toggleWishlist(id, body.listingId)) {
                    resp.setStatus(HttpServletResponse.SC_CREATED);
                    resp.getWriter().write("{\"success\": true}");
                } else {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                }
            }
        }
    }

    private static class WishlistRequest {
        int listingId;
    }
}
