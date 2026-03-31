package com.srmkart.util;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;

import java.io.InputStream;
import java.io.IOException;
import java.util.Properties;

public class S3Uploader {

    private static S3Client s3Client;
    private static String bucketName;
    private static String folder;
    private static String region;

    static {
        try (InputStream input = S3Uploader.class.getClassLoader()
                .getResourceAsStream("aws.properties")) {
            Properties props = new Properties();
            props.load(input);

            String accessKey = System.getenv("AWS_ACCESS_KEY") != null ? System.getenv("AWS_ACCESS_KEY") : props.getProperty("AWS_ACCESS_KEY");
            String secretKey = System.getenv("AWS_SECRET_KEY") != null ? System.getenv("AWS_SECRET_KEY") : props.getProperty("AWS_SECRET_KEY");
            region = System.getenv("AWS_REGION") != null ? System.getenv("AWS_REGION") : props.getProperty("AWS_REGION", "ap-south-1");
            bucketName = System.getenv("AWS_S3_BUCKET") != null ? System.getenv("AWS_S3_BUCKET") : props.getProperty("AWS_S3_BUCKET", "srmkart");
            folder = System.getenv("AWS_S3_FOLDER") != null ? System.getenv("AWS_S3_FOLDER") : props.getProperty("AWS_S3_FOLDER", "product-images");


            AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKey, secretKey);
            s3Client = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                    .build();
        } catch (IOException e) {
            throw new RuntimeException("Failed to load AWS config: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads an image to S3 and returns the public URL.
     */
    public static String uploadImage(InputStream imageStream, String fileName, String contentType, long contentLength) {
        String key = folder + "/" + fileName;

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .contentLength(contentLength)
                .acl(ObjectCannedACL.PUBLIC_READ)
                .build();

        s3Client.putObject(putRequest,
                software.amazon.awssdk.core.sync.RequestBody.fromInputStream(imageStream, contentLength));

        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
    }
}
