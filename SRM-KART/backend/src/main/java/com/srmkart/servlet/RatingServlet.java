package com.srmkart.servlet;

import com.google.gson.Gson;
import com.srmkart.dao.RatingDAO;
import com.srmkart.model.Rating;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/ratings")
public class RatingServlet extends HttpServlet {
    private RatingDAO ratingDAO = new RatingDAO();
    private Gson gson = new Gson();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        Integer authUserId = (Integer) req.getAttribute("userId");
        
        if (authUserId == null) {
            resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        try {
            Rating rating = gson.fromJson(req.getReader(), Rating.class);
            rating.setBuyerId(authUserId);
            
            if (ratingDAO.createRating(rating)) {
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.getWriter().write("{\"success\": true}");
            } else {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}

