package com.srmkart.servlet;

import com.google.gson.Gson;
import com.srmkart.service.AuthService;
import com.srmkart.model.User;
import com.srmkart.dao.UserDAO;
import com.srmkart.util.JwtUtil;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    private AuthService authService = new AuthService();
    private UserDAO userDAO = new UserDAO();
    private Gson gson = new Gson();

    @SuppressWarnings("unused")
    private static class AuthRequest {
        String name;
        String email;
        String password;
        String college;
    }

    @SuppressWarnings("unused")
    private static class AuthResponse {
        String token;
        User user;
        String error;

        AuthResponse(String token, User user, String error) {
            this.token = token;
            this.user = user;
            this.error = error;
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        String dbStatus = "Unknown";
        try (java.sql.Connection conn = com.srmkart.util.DBConnection.getConnection()) {
            dbStatus = "Connected!";
        } catch (Exception e) {
            dbStatus = "FAILED: " + e.getMessage();
        }
        resp.getWriter().write("SRM Kart Auth Servlet is active. \nPathInfo: " + req.getPathInfo() + "\nDB Status: " + dbStatus);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        String pathInfo = req.getPathInfo();
        
        AuthRequest authReq;
        try {
            authReq = gson.fromJson(req.getReader(), AuthRequest.class);
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new AuthResponse(null, null, "Invalid request format.")));
            return;
        }

        if (authReq == null || authReq.email == null || authReq.password == null) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write(gson.toJson(new AuthResponse(null, null, "Missing email or password.")));
            return;
        }

        if ("/register".equals(pathInfo)) {
            if (authReq.name == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write(gson.toJson(new AuthResponse(null, null, "Name is required for registration.")));
                return;
            }
            
            try {
                int result = authService.registerUser(authReq.name, authReq.email, authReq.password, authReq.college);
                
                if (result == 1) {
                    User user = userDAO.findByEmail(authReq.email.toLowerCase().trim());
                    String token = JwtUtil.generateToken(user.getId(), user.getEmail());
                    if (user != null) user.setPasswordHash(null);
                    resp.getWriter().write(gson.toJson(new AuthResponse(token, user, null)));
                } else {
                    String msg = "Registration failed.";
                    if (result == -1) msg = "This email is already registered. Please login instead.";
                    else if (result == -3) msg = "Please use your official college email ending in .edu, .edu.in, or .ac.in";
                    else if (result == -2) msg = "Invalid email format.";
                    
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().write(gson.toJson(new AuthResponse(null, null, msg)));
                }
            } catch (Exception e) {
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write(gson.toJson(new AuthResponse(null, null, "Internal server error: " + e.getMessage())));
                e.printStackTrace();
            }
        } else if ("/login".equals(pathInfo)) {
            String token = authService.loginUser(authReq.email, authReq.password);
            if (token != null) {
                User user = userDAO.findByEmail(authReq.email.toLowerCase().trim());
                if (user != null) user.setPasswordHash(null);
                resp.getWriter().write(gson.toJson(new AuthResponse(token, user, null)));
            } else {
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                resp.getWriter().write(gson.toJson(new AuthResponse(null, null, "Invalid email or password.")));
            }
        } else {
            resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
        }
    }
}
