package com.srmkart.filter;

import com.srmkart.util.JwtUtil;
import io.jsonwebtoken.Claims;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter("/api/*")
public class AuthFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
            
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        String path = request.getRequestURI();
        
        // Skip auth for login/register, setup, and public GET requests
        if (path.contains("/api/auth/") || 
            path.contains("/api/setup") ||
           (request.getMethod().equalsIgnoreCase("GET") && 
            (path.contains("/api/listings") || path.contains("/api/search") || path.contains("/api/categories")))) {
            chain.doFilter(req, res);
            return;
        }

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(req, res);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Claims claims = JwtUtil.validateToken(token);
            if (claims != null) {
                request.setAttribute("userId", Integer.parseInt(claims.getSubject()));
                request.setAttribute("userEmail", claims.get("email"));
                chain.doFilter(req, res);
                return;
            }
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("{\"error\": \"Unauthorized or expired token\"}");
    }

    @Override
    public void destroy() {}
}
