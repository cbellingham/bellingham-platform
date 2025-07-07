package com.bellingham.datafutures.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contract_activity")
public class ContractActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "contract_id")
    private ForwardContract contract;

    private LocalDateTime timestamp;
    private String username;
    private String action;

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ForwardContract getContract() {
        return contract;
    }

    public void setContract(ForwardContract contract) {
        this.contract = contract;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}
