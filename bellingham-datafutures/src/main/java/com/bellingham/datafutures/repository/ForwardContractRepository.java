package com.bellingham.datafutures.repository;

import com.bellingham.datafutures.model.ForwardContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ForwardContractRepository extends JpaRepository<ForwardContract, Long> {
    Page<ForwardContract> findByStatus(String status, Pageable pageable);
    Page<ForwardContract> findByStatusAndBuyerUsername(String status, String buyerUsername, Pageable pageable);
    List<ForwardContract> findByBuyerUsername(String buyerUsername);
    Page<ForwardContract> findByCreatorUsername(String creatorUsername, Pageable pageable);

    Page<ForwardContract> findByCreatorUsernameAndBuyerUsernameIsNotNull(String creatorUsername, Pageable pageable);

    Page<ForwardContract> findByStatusAndBuyerUsernameOrStatusAndCreatorUsername(
            String status1,
            String buyerUsername,
            String status2,
            String creatorUsername,
            Pageable pageable);
}

