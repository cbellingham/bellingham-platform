package com.bellingham.datafutures.service;

import com.bellingham.datafutures.dto.SavedSearchRequest;
import com.bellingham.datafutures.model.ForwardContract;
import com.bellingham.datafutures.model.SavedSearch;
import com.bellingham.datafutures.repository.SavedSearchRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SavedSearchService {

    private final SavedSearchRepository repository;
    private final NotificationService notificationService;

    public SavedSearchService(SavedSearchRepository repository, NotificationService notificationService) {
        this.repository = repository;
        this.notificationService = notificationService;
    }

    public List<SavedSearch> getSavedSearches(String username) {
        return repository.findByUsernameOrderByCreatedAtAsc(username);
    }

    public SavedSearch createSavedSearch(String username, SavedSearchRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required.");
        }

        String name = request.getName() != null ? request.getName().trim() : "";
        if (!StringUtils.hasText(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A name is required for the saved search.");
        }

        BigDecimal minPrice = request.getMinPrice();
        BigDecimal maxPrice = request.getMaxPrice();
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum price cannot exceed maximum price.");
        }

        SavedSearch savedSearch = new SavedSearch();
        savedSearch.setUsername(username);
        savedSearch.setName(name);
        savedSearch.setSearchTerm(normalizeText(request.getSearchTerm()));
        savedSearch.setMinPrice(minPrice);
        savedSearch.setMaxPrice(maxPrice);
        savedSearch.setSeller(normalizeText(request.getSeller()));
        savedSearch.setCreatedAt(LocalDateTime.now());

        try {
            return repository.save(savedSearch);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a saved search with that name.", ex);
        }
    }

    public void deleteSavedSearch(Long id, String username) {
        SavedSearch savedSearch = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Saved search not found."));

        if (!savedSearch.getUsername().equals(username)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot modify a saved search you do not own.");
        }

        repository.delete(savedSearch);
    }

    public void notifyWatchers(ForwardContract contract) {
        if (contract == null || contract.getStatus() == null ||
                !"Available".equalsIgnoreCase(contract.getStatus())) {
            return;
        }

        List<SavedSearch> savedSearches = repository.findAll();
        if (savedSearches.isEmpty()) {
            return;
        }

        for (SavedSearch savedSearch : savedSearches) {
            if (!StringUtils.hasText(savedSearch.getUsername())) {
                continue;
            }

            if (savedSearch.getUsername().equalsIgnoreCase(contract.getCreatorUsername())) {
                continue;
            }

            if (matches(savedSearch, contract)) {
                String title = StringUtils.hasText(contract.getTitle()) ? contract.getTitle() : "A contract";
                String message = String.format("New contract \"%s\" matches your saved search \"%s\".",
                        title,
                        savedSearch.getName());
                notificationService.notifyUser(savedSearch.getUsername(), message, contract.getId());
            }
        }
    }

    private boolean matches(SavedSearch savedSearch, ForwardContract contract) {
        BigDecimal price = contract.getPrice();

        if (savedSearch.getMinPrice() != null) {
            if (price == null || price.compareTo(savedSearch.getMinPrice()) < 0) {
                return false;
            }
        }

        if (savedSearch.getMaxPrice() != null) {
            if (price == null || price.compareTo(savedSearch.getMaxPrice()) > 0) {
                return false;
            }
        }

        if (StringUtils.hasText(savedSearch.getSeller())) {
            String seller = contract.getSeller();
            if (seller == null || !seller.equalsIgnoreCase(savedSearch.getSeller())) {
                return false;
            }
        }

        if (StringUtils.hasText(savedSearch.getSearchTerm())) {
            String term = savedSearch.getSearchTerm().toLowerCase();
            String title = contract.getTitle() != null ? contract.getTitle().toLowerCase() : "";
            String seller = contract.getSeller() != null ? contract.getSeller().toLowerCase() : "";
            if (!title.contains(term) && !seller.contains(term)) {
                return false;
            }
        }

        return true;
    }

    private String normalizeText(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}

