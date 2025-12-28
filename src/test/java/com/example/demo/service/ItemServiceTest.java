package com.example.demo.service;

import com.example.demo.model.Item;
import com.example.demo.repository.ItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private ItemService itemService;

    private Item testItem;

    @BeforeEach
    void setUp() {
        testItem = new Item();
        testItem.setId(1L);
        testItem.setDescripcion("Test Item");
        testItem.setCantidad(5);
    }

    @Test
    void testFindAll_ReturnsAllItems() {
        Item item2 = new Item();
        item2.setId(2L);
        item2.setDescripcion("Item 2");

        when(itemRepository.findAll()).thenReturn(Arrays.asList(testItem, item2));

        List<Item> result = itemService.findAll();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDescripcion()).isEqualTo("Test Item");
        verify(itemRepository, times(1)).findAll();
    }

    @Test
    void testFindById_WithExistingId_ReturnsItem() {
        when(itemRepository.findById(1L)).thenReturn(Optional.of(testItem));

        Optional<Item> result = itemService.findById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().getDescripcion()).isEqualTo("Test Item");
        verify(itemRepository, times(1)).findById(1L);
    }

    @Test
    void testFindById_WithNonExistingId_ReturnsEmpty() {
        when(itemRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Item> result = itemService.findById(999L);

        assertThat(result).isEmpty();
        verify(itemRepository, times(1)).findById(999L);
    }

    @Test
    void testFindByUsuarioId_ReturnsFilteredItems() {
        when(itemRepository.findByUsuarioId(1L)).thenReturn(Arrays.asList(testItem));

        List<Item> result = itemService.findByUsuarioId(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDescripcion()).isEqualTo("Test Item");
        verify(itemRepository, times(1)).findByUsuarioId(1L);
    }

    @Test
    void testFindByLocalId_ReturnsFilteredItems() {
        when(itemRepository.findByLocalActualId(1L)).thenReturn(Arrays.asList(testItem));

        List<Item> result = itemService.findByLocalId(1L);

        assertThat(result).hasSize(1);
        verify(itemRepository, times(1)).findByLocalActualId(1L);
    }

    @Test
    void testFindByPrestadoAId_ReturnsFilteredItems() {
        when(itemRepository.findByPrestadoAId(1L)).thenReturn(Arrays.asList(testItem));

        List<Item> result = itemService.findByPrestadoAId(1L);

        assertThat(result).hasSize(1);
        verify(itemRepository, times(1)).findByPrestadoAId(1L);
    }

    @Test
    void testSave_CreatesNewItem() {
        when(itemRepository.save(any(Item.class))).thenReturn(testItem);

        Item result = itemService.save(testItem);

        assertThat(result).isNotNull();
        assertThat(result.getDescripcion()).isEqualTo("Test Item");
        verify(itemRepository, times(1)).save(testItem);
    }

    @Test
    void testDeleteById_DeletesItem() {
        doNothing().when(itemRepository).deleteById(1L);

        itemService.deleteById(1L);

        verify(itemRepository, times(1)).deleteById(1L);
    }
}