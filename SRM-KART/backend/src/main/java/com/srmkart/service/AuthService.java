package com.srmkart.service;

import com.srmkart.dao.UserDAO;
import com.srmkart.model.User;
import com.srmkart.util.JwtUtil;
import org.mindrot.jbcrypt.BCrypt;

public class AuthService {
    private UserDAO userDAO = new UserDAO();

    /**
     * Re-designed for better error reporting
     * Returns:
     * 1: Success
     * -1: Email already taken
     * -2: Invalid format
     * -3: Invalid domain (not .edu / .edu.in / .ac.in)
     * 0: Database error
     */
    public int registerUser(String name, String email, String password, String college) {
        if (email == null || email.trim().isEmpty()) return -2;
        String lowerEmail = email.toLowerCase().trim();
        
        // Broadened domain check for safety
        if (!lowerEmail.endsWith(".edu") && !lowerEmail.endsWith(".edu.in") && !lowerEmail.endsWith(".ac.in")) {
            return -3; // Invalid Domain
        }
        
        if (userDAO.findByEmail(lowerEmail) != null) {
            return -1; // Email already taken
        }

        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        
        User user = new User();
        user.setName(name != null ? name.trim() : "Student");
        user.setEmail(lowerEmail);
        user.setPasswordHash(hashedPassword);
        user.setCollege(college != null ? college.trim() : "SRM");
        user.setVerified(true); 

        if (userDAO.createUser(user)) {
            return 1; // Success
        }
        return 0; // Other DB failure
    }

    public String loginUser(String email, String password) {
        if (email == null) return null;
        User user = userDAO.findByEmail(email.toLowerCase().trim());
        if (user != null && BCrypt.checkpw(password, user.getPasswordHash())) {
            return JwtUtil.generateToken(user.getId(), user.getEmail());
        }
        return null;
    }
}
