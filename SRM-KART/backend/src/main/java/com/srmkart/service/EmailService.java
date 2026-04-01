package com.srmkart.service;

import java.util.Properties;
import javax.mail.*;
import javax.mail.internet.*;
import java.io.InputStream;

public class EmailService {
    private Properties props = new Properties();
    private String username;
    private String password;

    public EmailService() {
        try (InputStream input = getClass().getClassLoader().getResourceAsStream("mail.properties")) {
            if (input == null) {
                System.out.println("Sorry, unable to find mail.properties");
                return;
            }
            props.load(input);
            this.username = props.getProperty("mail.user");
            this.password = props.getProperty("mail.password");
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public void sendVerificationEmail(String toEmail, String code) {
        if (username == null || username.contains("@example.com")) {
            System.out.println("Email not configured. Verification Code: " + code);
            return;
        }

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(username, "SRMKart Support"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject("Verify your SRMKart Account");
            
            String htmlContent = "<h2>Welcome to SRMKart!</h2>" +
                               "<p>Your 6-digit verification code is:</p>" +
                               "<h1 style='color: #1d5f8f; letter-spacing: 5px;'>" + code + "</h1>" +
                               "<p>This code expires in 10 minutes.</p>" +
                               "<br><p>Best regards,<br>The SRMKart Team</p>";

            message.setContent(htmlContent, "text/html; charset=utf-8");

            Transport.send(message);
            System.out.println("Verification email sent to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

