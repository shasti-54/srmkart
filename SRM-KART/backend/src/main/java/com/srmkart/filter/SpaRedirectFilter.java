package com.srmkart.filter;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter("/*")
public class SpaRedirectFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest req = (HttpServletRequest) request;
        String path = req.getRequestURI().substring(req.getContextPath().length());

        if (path.startsWith("/api") || path.startsWith("/assets") || path.contains(".")) {
            // Let the request proceed normally for APIs and static files
            chain.doFilter(request, response);
        } else {
            // Forward everything else to index.html for Angular Router to handle
            req.getRequestDispatcher("/index.html").forward(request, response);
        }
    }

    @Override
    public void destroy() {}
}
