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
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        String pathInfo = req.getPathInfo();
        AuthRequest authReq = gson.fromJson(req.getReader(), AuthRequest.class);

        if ("/register".equals(pathInfo)) {
            String token = authService.registerUser(authReq.name, authReq.email, authReq.password, authReq.college);
            if (token != null) {
                User user = userDAO.findByEmail(authReq.email);
                if (user != null) user.setPasswordHash(null); // Safety first
                resp.getWriter().write(gson.toJson(new AuthResponse(token, user, null)));
            } else {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write(gson.toJson(new AuthResponse(null, null, "Registration failed. Ensure email is an edu domain and not already taken.")));
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
