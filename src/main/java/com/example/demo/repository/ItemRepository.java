package com.example.demo.repository;

import com.example.demo.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByUsuarioId(Long usuarioId);
    List<Item> findByLocalActualId(Long localId);
    List<Item> findByPrestadoAId(Long prestadoAId);
    List<Item> findByLocalActualIdIn(List<Long> localIds);

    // Buscar items que están en los locales del usuario O que tienen su local original en los locales del usuario
    @Query("SELECT i FROM Item i WHERE i.localActual.id IN :localIds OR i.localOriginal.id IN :localIds")
    List<Item> findByLocalActualIdInOrLocalOriginalIdIn(@Param("localIds") List<Long> localIds);
}