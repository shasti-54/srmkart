package com.srmkart.servlet;

import com.google.gson.Gson;
import com.srmkart.service.AuthService;
import com.srmkart.model.User;
import com.srmkart.dao.UserDAO;
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

    private static class AuthRequest {
        String name;
        String email;
        String password;
        String college;
    }

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
        System.out.println("DEBUG: AuthServlet Received POST request at " + req.getPathInfo());
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
                String token = authService.registerUser(authReq.name, authReq.email, authReq.password, authReq.college);
                if (token != null) {
                    User user = userDAO.findByEmail(authReq.email);
                    if (user != null) user.setPasswordHash(null);
                    resp.getWriter().write(gson.toJson(new AuthResponse(token, user, null)));
                } else {
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    resp.getWriter().write(gson.toJson(new AuthResponse(null, null, "Registration failed. Ensure email ends in .edu and is not taken.")));
                }
            } catch (Exception e) {
                System.err.println("Registration error for " + authReq.email + ": " + e.getMessage());
                e.printStackTrace();
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write(gson.toJson(new AuthResponse(null, null, "Internal server error: " + e.getMessage())));
            }
        } else if ("/login".equals(pathInfo)) {
            String token = authService.loginUser(authReq.email, authReq.password);
            if (token != null) {
                User user = userDAO.findByEmail(authReq.email);
                if (user != null) user.setPasswordHash(null); // Safety first
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
