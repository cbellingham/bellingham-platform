package com.bellingham.datafutures.repository;

import com.bellingham.datafutures.model.SavedSearch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedSearchRepository extends JpaRepository<SavedSearch, Long> {

    List<SavedSearch> findByUsernameOrderByCreatedAtAsc(String username);
}

