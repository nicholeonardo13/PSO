package com.pso.backoffice.service;

import com.pso.backoffice.entity.Administrator;
import com.pso.backoffice.repository.AdministratorRepository;
import com.pso.backoffice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdministratorRepository administratorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public Map<String, Object> login(String username, String password) {
        Administrator admin = administratorRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(admin.getId(), admin.getUsername());

        Map<String, Object> adminData = new LinkedHashMap<>();
        adminData.put("id", admin.getId());
        adminData.put("username", admin.getUsername());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("token", token);
        response.put("admin", adminData);

        return response;
    }

    public Map<String, Object> getMe(UUID adminId) {
        Administrator admin = administratorRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", admin.getId());
        response.put("username", admin.getUsername());

        return response;
    }
}
