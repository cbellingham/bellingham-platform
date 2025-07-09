package com.bellingham.datafutures.repository;

import com.bellingham.datafutures.model.Bid;
import com.bellingham.datafutures.model.ForwardContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByContractOrderByTimestampAsc(ForwardContract contract);
}
