package com.srmkart.service;

import com.srmkart.dao.UserDAO;
import com.srmkart.model.User;
import com.srmkart.util.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;

public class AuthService {
    private UserDAO userDAO = new UserDAO();

    public String registerUser(String name, String email, String password, String college) {
        if (email == null) return null;
        if (!email.toLowerCase().endsWith(".edu") && !email.toLowerCase().endsWith(".edu.in")) {
            return null; // Invalid email domain
        }
        
        if (userDAO.findByEmail(email) != null) {
            return null; // User already exists
        }

        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);
        user.setCollege(college);
        user.setVerified(true); // Auto-verify

        if (userDAO.createUser(user)) {
            User savedUser = userDAO.findByEmail(email);
            return JwtUtil.generateToken(savedUser.getId(), savedUser.getEmail());
        }
        return null;
    }

    public String loginUser(String email, String password) {
        User user = userDAO.findByEmail(email);
        if (user != null && BCrypt.checkpw(password, user.getPasswordHash())) {
            return JwtUtil.generateToken(user.getId(), user.getEmail());
        }
        return null;
    }
}
