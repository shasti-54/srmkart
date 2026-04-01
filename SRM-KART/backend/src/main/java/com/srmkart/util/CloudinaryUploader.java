package com.srmkart.util;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.InputStream;
import java.util.Map;
import java.util.Properties;

public class CloudinaryUploader {
    private static Cloudinary cloudinary;

    static {
        try (InputStream input = CloudinaryUploader.class.getClassLoader()
                .getResourceAsStream("cloudinary.properties")) {
            Properties props = new Properties();
            props.load(input);

            String cloudName = System.getenv("CLOUDINARY_CLOUD_NAME") != null ? 
                              System.getenv("CLOUDINARY_CLOUD_NAME") : props.getProperty("CLOUDINARY_CLOUD_NAME");
            String apiKey = System.getenv("CLOUDINARY_API_KEY") != null ? 
                           System.getenv("CLOUDINARY_API_KEY") : props.getProperty("CLOUDINARY_API_KEY");
            String apiSecret = System.getenv("CLOUDINARY_API_SECRET") != null ? 
                              System.getenv("CLOUDINARY_API_SECRET") : props.getProperty("CLOUDINARY_API_SECRET");

            cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
            ));
        } catch (Exception e) {
            throw new RuntimeException("Failed to load Cloudinary config: " + e.getMessage(), e);
        }
    }

    public static String uploadImage(InputStream imageStream, String fileName) throws Exception {
        // Read bytes from stream
        byte[] fileBytes = imageStream.readAllBytes();
        
        Map<?, ?> uploadResult = cloudinary.uploader().upload(fileBytes, ObjectUtils.asMap(
            "public_id", fileName.substring(0, fileName.lastIndexOf('.')),
            "folder", "srmkart/products"
        ));
        
        return (String) uploadResult.get("secure_url");
    }
}
