package com.srmkart.servlet;

import com.google.gson.Gson;
import com.srmkart.model.Listing;
import com.srmkart.service.ListingService;
import com.srmkart.util.S3Uploader;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@WebServlet(urlPatterns = {"/api/listings/*", "/api/search"})
@MultipartConfig(
    fileSizeThreshold = 1024 * 1024 * 2, // 2MB
    maxFileSize = 1024 * 1024 * 10,      // 10MB
    maxRequestSize = 1024 * 1024 * 50    // 50MB
)
public class ListingServlet extends HttpServlet {
    private ListingService listingService = new ListingService();
    private Gson gson = new Gson();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        String pathInfo = req.getPathInfo();
        String servletPath = req.getServletPath();

        try {
            if ("/api/search".equals(servletPath)) {
                String query = req.getParameter("q");
                String categoryId = req.getParameter("category");
                String minPriceStr = req.getParameter("minPrice");
                String maxPriceStr = req.getParameter("maxPrice");
                
                Double minPrice = (minPriceStr != null && !minPriceStr.isEmpty()) ? Double.parseDouble(minPriceStr) : null;
                Double maxPrice = (maxPriceStr != null && !maxPriceStr.isEmpty()) ? Double.parseDouble(maxPriceStr) : null;
                
                List<Listing> listings = listingService.searchListings(query, categoryId, minPrice, maxPrice);
                resp.getWriter().write(gson.toJson(listings));
                return;
            }

            if (pathInfo == null || pathInfo.equals("/")) {
                List<Listing> listings = listingService.getAllListings();
                resp.getWriter().write(gson.toJson(listings));
            } else {
                int id = Integer.parseInt(pathInfo.substring(1));
                Listing listing = listingService.getListingById(id);
                if (listing != null) {
                    resp.getWriter().write(gson.toJson(listing));
                } else {
                    resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    resp.getWriter().write("{\"error\": \"Listing not found\"}");
                }
            }
        } catch (Exception e) {
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            e.printStackTrace();
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        try {
            Integer userId = (Integer) req.getAttribute("userId");
            if (userId == null) {
                System.err.println("Listing creation failed: User ID not found in request (Unauthorized)");
                resp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            Listing newListing;
            String contentType = req.getContentType();
            
            if (contentType != null && contentType.toLowerCase().startsWith("multipart/form-data")) {
                String listingJson = req.getParameter("listing");
                if (listingJson == null) {
                    System.err.println("Listing creation failed: 'listing' parameter missing in multipart request");
                    resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    return;
                }
                newListing = gson.fromJson(listingJson, Listing.class);
                
                Part filePart = req.getPart("image");
                if (filePart != null && filePart.getSize() > 0) {
                    String originalName = filePart.getSubmittedFileName();
                    String fileName = UUID.randomUUID().toString() + "-" + originalName;
                    String mimeType = filePart.getContentType() != null ? filePart.getContentType() : "image/jpeg";
                    
                    try {
                        // Upload to AWS S3
                        String imageUrl = S3Uploader.uploadImage(
                            filePart.getInputStream(),
                            fileName,
                            mimeType,
                            filePart.getSize()
                        );
                        newListing.setImageUrl(imageUrl);
                        System.out.println("Image uploaded successfully to S3: " + imageUrl);
                    } catch (Exception s3Ex) {
                        System.err.println("S3 Upload FAILED: " + s3Ex.getMessage());
                        s3Ex.printStackTrace();
                        resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        resp.getWriter().write("{\"error\": \"Failed to upload image: " + s3Ex.getMessage() + "\"}");
                        return;
                    }
                }
            } else {
                newListing = gson.fromJson(req.getReader(), Listing.class);
            }

            newListing.setUserId(userId);
            newListing.setStatus("active");
            
            if (listingService.createListing(newListing)) {
                System.out.println("Listing created successfully in database for user " + userId);
                resp.setStatus(HttpServletResponse.SC_CREATED);
                resp.getWriter().write(gson.toJson(newListing));
            } else {
                System.err.println("Database error: Failed to save listing for user " + userId);
                resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                resp.getWriter().write("{\"error\": \"Failed to save listing to database. Check if category ID is valid.\"}");
            }
        } catch (Exception e) {
            System.err.println("Unexpected error in ListingServlet: " + e.getMessage());
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Error processing request: " + e.getMessage() + "\"}");
        }
    }
}
