package com.bellingham.datafutures.controller;

import com.bellingham.datafutures.dto.SavedSearchRequest;
import com.bellingham.datafutures.model.SavedSearch;
import com.bellingham.datafutures.service.SavedSearchService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-searches")
public class SavedSearchController {

    private final SavedSearchService savedSearchService;

    public SavedSearchController(SavedSearchService savedSearchService) {
        this.savedSearchService = savedSearchService;
    }

    @GetMapping
    public List<SavedSearch> list(Authentication authentication) {
        return savedSearchService.getSavedSearches(authentication.getName());
    }

    @PostMapping
    public SavedSearch create(@Valid @RequestBody SavedSearchRequest request, Authentication authentication) {
        return savedSearchService.createSavedSearch(authentication.getName(), request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication authentication) {
        savedSearchService.deleteSavedSearch(id, authentication.getName());
    }
}

