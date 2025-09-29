package com.bellingham.datafutures.service;

import com.bellingham.datafutures.service.dto.DataAnalysisReport;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class DataAnalysisServiceTest {

    private final DataAnalysisService service = new DataAnalysisService(new ObjectMapper());

    @Test
    void analyzeCsvProducesColumnSummaries() throws Exception {
        String csv = "price,delivery_date,buyer\n" +
                "100,2024-09-01,Acme\n" +
                "150,2024-10-15,Globex";
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.csv",
                "text/csv",
                csv.getBytes(StandardCharsets.UTF_8)
        );

        DataAnalysisReport report = service.analyze(file);

        assertThat(report.rowCount()).isEqualTo(2);
        assertThat(report.columns()).hasSize(3);
        assertThat(report.summary()).contains("CSV");
        assertThat(report.contractRecommendations())
                .anyMatch(rec -> rec.toLowerCase().contains("pricing") || rec.toLowerCase().contains("valuation"));
        assertThat(report.benchmarkInsights()).isNotEmpty();
        assertThat(report.fairValueBands())
                .anyMatch(band -> band.column().equals("price") && band.midEstimate() != null);
    }

    @Test
    void analyzeJsonFlattensObjects() throws Exception {
        String json = "[{\"price\":200,\"metadata\":{\"effective_date\":\"2024-08-01\"}}]";
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.json",
                "application/json",
                json.getBytes(StandardCharsets.UTF_8)
        );

        DataAnalysisReport report = service.analyze(file);

        assertThat(report.format()).isEqualTo("json");
        assertThat(report.columns()).extracting(DataAnalysisReport.ColumnProfile::name)
                .contains("price", "metadata.effective_date");
    }
}
