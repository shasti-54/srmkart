package com.srmkart.servlet;

import com.google.gson.Gson;
import com.srmkart.dao.ListingDAO;
import com.srmkart.dao.WishlistDAO;
import com.srmkart.dao.UserDAO;
import com.srmkart.dao.PurchaseDAO;
import com.srmkart.model.Listing;
import com.srmkart.model.User;
import com.srmkart.model.Purchase;
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
    private UserDAO userDAO = new UserDAO();
    private PurchaseDAO purchaseDAO = new PurchaseDAO();
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
                List<Listing> userListings = listingDAO.getListingsByUserId(id);
                resp.getWriter().write(gson.toJson(userListings));
            } else if ("wishlist".equals(action)) {
                List<Listing> wishlist = wishlistDAO.getWishlistForUser(id);
                resp.getWriter().write(gson.toJson(wishlist));
            } else if ("profile".equals(action)) {
                User user = userDAO.findById(id);
                if (user != null) {
                    user.setPasswordHash(null);
                    resp.getWriter().write(gson.toJson(user));
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                }
            } else if ("purchases".equals(action)) {
                List<Purchase> purchases = purchaseDAO.getPurchasesByBuyerId(id);
                resp.getWriter().write(gson.toJson(purchases));
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
        } else if (pathInfo != null && pathInfo.endsWith("/profile")) {
            String[] parts = pathInfo.split("/");
            int id = Integer.parseInt(parts[1]);
            if (id != authUserId) {
                resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
            User updateReq = gson.fromJson(req.getReader(), User.class);
            updateReq.setId(id);
            if (userDAO.updateUser(updateReq)) {
                resp.getWriter().write("{\"success\": true}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } else if (pathInfo != null && pathInfo.endsWith("/purchases")) {
            String[] parts = pathInfo.split("/");
            int id = Integer.parseInt(parts[1]);
            if (id != authUserId) {
                resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
            Purchase purchase = gson.fromJson(req.getReader(), Purchase.class);
            purchase.setBuyerId(id);
            if (purchaseDAO.createPurchase(purchase)) {
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.getWriter().write("{\"success\": true}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        }
    }

    private static class WishlistRequest {
        int listingId;
    }
}
