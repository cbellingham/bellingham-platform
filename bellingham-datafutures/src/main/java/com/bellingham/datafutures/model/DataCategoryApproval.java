package com.bellingham.datafutures.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Captures the approval state for a particular data category before a trade can proceed.
 */
@Embeddable
public class DataCategoryApproval {

    @Column(name = "data_category", nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private AttestationStatus status = AttestationStatus.PENDING;

    @Column(name = "approved_by")
    private String attestedBy;

    @Column(name = "approved_at")
    private LocalDateTime attestedAt;

    @Column(name = "approval_notes", length = 512)
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

    public boolean isApproved() {
        return AttestationStatus.APPROVED.equals(status);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DataCategoryApproval that)) return false;
        return Objects.equals(category, that.category);
    }

    @Override
    public int hashCode() {
        return Objects.hash(category);
    }
}

