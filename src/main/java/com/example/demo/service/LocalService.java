package com.example.demo.service;

import com.example.demo.model.Local;
import com.example.demo.repository.LocalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocalService {

    @Autowired
    private LocalRepository localRepository;

    public List<Local> findAll() {
        return localRepository.findAll();
    }

    public Optional<Local> findById(Long id) {
        return localRepository.findById(id);
    }

    public List<Local> findByAdminId(Long adminId) {
        return localRepository.findByAdminId(adminId);
    }

    public Local save(Local local) {
        return localRepository.save(local);
    }

    public void deleteById(Long id) {
        localRepository.deleteById(id);
    }
}