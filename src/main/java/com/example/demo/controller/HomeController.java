package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "Local407 API");
        response.put("status", "running");

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("Usuarios", "/api/usuarios");
        endpoints.put("Locales", "/api/locales");
        endpoints.put("Items", "/api/items");
        endpoints.put("Invitaciones", "/api/invitaciones");
        endpoints.put("UsuarioLocal", "/api/usuario-locales");

        response.put("endpoints", endpoints);

        return response;
    }
}