package com.ptit.studentportal.config;

import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String uploadDirectory;

    public WebConfig(@Value("${app.upload.request-attachments-dir:uploads/request-attachments}") String uploadDirectory) {
        this.uploadDirectory = uploadDirectory;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/request-attachments/**")
                .addResourceLocations("file:" + Paths.get(uploadDirectory).toAbsolutePath().normalize() + "/");
    }
}