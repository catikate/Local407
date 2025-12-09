package com.example.demo.repository;

import com.example.demo.model.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalRepository extends JpaRepository<Local, Long> {
    List<Local> findByAdminId(Long adminId);
}