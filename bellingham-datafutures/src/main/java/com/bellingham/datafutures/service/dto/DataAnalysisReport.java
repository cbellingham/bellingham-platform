package com.bellingham.datafutures.service.dto;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public record DataAnalysisReport(
        String fileName,
        long fileSize,
        String format,
        long rowCount,
        int columnCount,
        List<ColumnProfile> columns,
        List<String> qualityAlerts,
        List<String> contractRecommendations,
        List<Map<String, String>> sampleRows,
        List<BenchmarkInsight> benchmarkInsights,
        List<FairValueBand> fairValueBands,
        String summary
) {

    public DataAnalysisReport {
        columns = columns == null ? List.of() : List.copyOf(columns);
        qualityAlerts = qualityAlerts == null ? List.of() : List.copyOf(qualityAlerts);
        contractRecommendations = contractRecommendations == null ? List.of() : List.copyOf(contractRecommendations);
        sampleRows = sampleRows == null ? List.of() : sampleRows.stream()
                .map(row -> Collections.unmodifiableMap(row == null ? Map.of() : row))
                .toList();
        benchmarkInsights = benchmarkInsights == null ? List.of() : List.copyOf(benchmarkInsights);
        fairValueBands = fairValueBands == null ? List.of() : List.copyOf(fairValueBands);
    }

    public static DataAnalysisReport empty(String fileName, long size, String format) {
        return new DataAnalysisReport(
                fileName,
                size,
                format,
                0,
                0,
                List.of(),
                List.of("No records were detected in the uploaded sample."),
                List.of("Provide a sample that includes representative columns so the platform can recommend contract fields."),
                List.of(),
                List.of(),
                List.of(),
                "No structured data detected in the provided sample."
        );
    }

    public record ColumnProfile(
            String name,
            String inferredType,
            long populatedCount,
            long emptyCount,
            double fillRate,
            Double numericMin,
            Double numericMax,
            Double numericAverage,
            long distinctCount,
            String exampleValue
    ) {
        public ColumnProfile {
            name = Objects.requireNonNullElse(name, "");
            inferredType = Objects.requireNonNullElse(inferredType, "unknown");
            exampleValue = Objects.requireNonNullElse(exampleValue, "");
        }
    }

    public record BenchmarkInsight(
            String cluster,
            String description,
            List<String> supportingColumns,
            List<String> recommendedActions,
            List<String> anomalies
    ) {
        public BenchmarkInsight {
            cluster = Objects.requireNonNullElse(cluster, "");
            description = Objects.requireNonNullElse(description, "");
            supportingColumns = supportingColumns == null ? List.of() : List.copyOf(supportingColumns);
            recommendedActions = recommendedActions == null ? List.of() : List.copyOf(recommendedActions);
            anomalies = anomalies == null ? List.of() : List.copyOf(anomalies);
        }
    }

    public record FairValueBand(
            String column,
            Double lowEstimate,
            Double midEstimate,
            Double highEstimate,
            String guidance
    ) {
        public FairValueBand {
            column = Objects.requireNonNullElse(column, "");
            guidance = Objects.requireNonNullElse(guidance, "");
        }
    }
}
