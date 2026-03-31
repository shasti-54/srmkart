package com.srmkart.servlet;

import com.google.gson.Gson;
import com.srmkart.dao.WishlistDAO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/wishlist/*")
public class WishlistServlet extends HttpServlet {
    private WishlistDAO wishlistDAO = new WishlistDAO();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        Integer userId = (Integer) req.getAttribute("userId");
        if (userId == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        try {
            List<Integer> wishlistIds = wishlistDAO.getUserWishlistIds(userId);
            resp.getWriter().write(gson.toJson(wishlistIds));
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        Integer userId = (Integer) req.getAttribute("userId");
        if (userId == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        try {
            WishlistRequest request = gson.fromJson(req.getReader(), WishlistRequest.class);
            if (wishlistDAO.toggleWishlist(userId, request.getListingId())) {
                resp.setStatus(HttpServletResponse.SC_OK);
                resp.getWriter().write("{\"success\": true}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }

    private class WishlistRequest {
        private int listingId;
        public int getListingId() { return listingId; }
    }
}
