package com.bellingham.datafutures.dto;

import com.bellingham.datafutures.model.AttestationStatus;

import java.time.LocalDateTime;

public class DataCategoryApprovalDto {
    private String category;
    private AttestationStatus status;
    private String attestedBy;
    private LocalDateTime attestedAt;
    private String notes;

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public AttestationStatus getStatus() {
        return status;
    }

    public void setStatus(AttestationStatus status) {
        this.status = status;
    }

    public String getAttestedBy() {
        return attestedBy;
    }

    public void setAttestedBy(String attestedBy) {
        this.attestedBy = attestedBy;
    }

    public LocalDateTime getAttestedAt() {
        return attestedAt;
    }

    public void setAttestedAt(LocalDateTime attestedAt) {
        this.attestedAt = attestedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

