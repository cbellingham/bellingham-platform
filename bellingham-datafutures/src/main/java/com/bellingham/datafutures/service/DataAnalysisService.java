package com.bellingham.datafutures.service;

import com.bellingham.datafutures.service.dto.DataAnalysisReport;
import com.bellingham.datafutures.service.dto.DataAnalysisReport.ColumnProfile;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class DataAnalysisService {

    private static final int MAX_SAMPLE_ROWS = 5;
    private static final int MAX_DISTINCT_VALUES_TRACKED = 200;
    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ISO_OFFSET_DATE_TIME,
            DateTimeFormatter.ISO_ZONED_DATE_TIME,
            DateTimeFormatter.ofPattern("M/d/uuuu"),
            DateTimeFormatter.ofPattern("d/M/uuuu"),
            DateTimeFormatter.ofPattern("M-d-uuuu"),
            DateTimeFormatter.ofPattern("d-M-uuuu")
    );

    private final ObjectMapper objectMapper;

    public DataAnalysisService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public DataAnalysisReport analyze(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("An uploaded data sample is required.");
        }

        String originalFilename = Optional.ofNullable(file.getOriginalFilename()).orElse("sample");
        String normalizedName = originalFilename.toLowerCase(Locale.ROOT);

        if (normalizedName.endsWith(".json")) {
            return analyzeJson(file, originalFilename);
        }

        return analyzeCsv(file, originalFilename);
    }

    private DataAnalysisReport analyzeCsv(MultipartFile file, String originalFilename) throws IOException {
        try (InputStream inputStream = file.getInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

            String headerLine = reader.readLine();
            if (headerLine == null) {
                return DataAnalysisReport.empty(originalFilename, file.getSize(), "csv");
            }

            List<String> headers = parseCsvLine(headerLine);
            if (headers.isEmpty()) {
                return DataAnalysisReport.empty(originalFilename, file.getSize(), "csv");
            }

            List<ColumnAccumulator> accumulators = createAccumulators(headers);
            List<Map<String, String>> sampleRows = new ArrayList<>();
            long rowCount = 0;

            String line;
            while ((line = reader.readLine()) != null) {
                List<String> values = parseCsvLine(line);
                rowCount++;

                Map<String, String> rowForSample = rowCount <= MAX_SAMPLE_ROWS ? new LinkedHashMap<>() : null;

                for (int i = 0; i < headers.size(); i++) {
                    String columnName = headers.get(i);
                    String value = i < values.size() ? values.get(i) : "";
                    ColumnAccumulator accumulator = accumulators.get(i);
                    accumulator.accept(value);

                    if (rowForSample != null) {
                        rowForSample.put(columnName, value);
                    }
                }

                if (rowForSample != null) {
                    sampleRows.add(rowForSample);
                }
            }

            return buildReport(
                    originalFilename,
                    file.getSize(),
                    "csv",
                    headers,
                    accumulators,
                    rowCount,
                    sampleRows
            );
        }
    }

    private DataAnalysisReport analyzeJson(MultipartFile file, String originalFilename) throws IOException {
        try (InputStream inputStream = file.getInputStream()) {
            JsonNode root = objectMapper.readTree(inputStream);
            if (root == null || root.isMissingNode() || root.isNull()) {
                return DataAnalysisReport.empty(originalFilename, file.getSize(), "json");
            }

            List<Map<String, String>> rows = new ArrayList<>();
            Set<String> headerSet = new LinkedHashSet<>();

            if (root.isArray()) {
                for (JsonNode node : root) {
                    Map<String, String> flattened = flattenObject(node);
                    if (!flattened.isEmpty()) {
                        rows.add(flattened);
                        headerSet.addAll(flattened.keySet());
                    }
                }
            } else if (root.isObject()) {
                Map<String, String> flattened = flattenObject(root);
                if (!flattened.isEmpty()) {
                    rows.add(flattened);
                    headerSet.addAll(flattened.keySet());
                }
            } else {
                return DataAnalysisReport.empty(originalFilename, file.getSize(), "json");
            }

            if (rows.isEmpty()) {
                return DataAnalysisReport.empty(originalFilename, file.getSize(), "json");
            }

            List<String> headers = new ArrayList<>(headerSet);
            List<ColumnAccumulator> accumulators = createAccumulators(headers);
            List<Map<String, String>> sampleRows = new ArrayList<>();
            long rowCount = 0;

            for (Map<String, String> row : rows) {
                rowCount++;
                Map<String, String> sampleRow = rowCount <= MAX_SAMPLE_ROWS ? new LinkedHashMap<>() : null;

                for (int i = 0; i < headers.size(); i++) {
                    String columnName = headers.get(i);
                    String value = row.getOrDefault(columnName, "");
                    ColumnAccumulator accumulator = accumulators.get(i);
                    accumulator.accept(value);

                    if (sampleRow != null) {
                        sampleRow.put(columnName, value);
                    }
                }

                if (sampleRow != null) {
                    sampleRows.add(sampleRow);
                }
            }

            return buildReport(
                    originalFilename,
                    file.getSize(),
                    "json",
                    headers,
                    accumulators,
                    rowCount,
                    sampleRows
            );
        }
    }

    private DataAnalysisReport buildReport(
            String originalFilename,
            long size,
            String format,
            List<String> headers,
            List<ColumnAccumulator> accumulators,
            long rowCount,
            List<Map<String, String>> sampleRows
    ) {
        List<ColumnProfile> profiles = new ArrayList<>();
        List<String> qualityAlerts = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        for (int i = 0; i < headers.size(); i++) {
            ColumnAccumulator accumulator = accumulators.get(i);
            ColumnProfile profile = accumulator.toProfile(rowCount);
            profiles.add(profile);

            qualityAlerts.addAll(accumulator.qualityAlerts(rowCount));
            recommendations.addAll(accumulator.recommendations());
        }

        if (rowCount < 10) {
            qualityAlerts.add("Sample contains fewer than 10 records. Consider uploading a larger extract for a more reliable assessment.");
        }

        if (rowCount == 0) {
            qualityAlerts.add("No data rows detected. Ensure the file includes at least one record.");
        }

        if (recommendations.isEmpty()) {
            recommendations.add("Document key data points in the contract description so buyers understand the dataset scope.");
        }

        String summary = String.format(
                "Detected %d column%s and %d row%s from the %s sample.",
                headers.size(),
                headers.size() == 1 ? "" : "s",
                rowCount,
                rowCount == 1 ? "" : "s",
                format.toUpperCase(Locale.ROOT)
        );

        List<Map<String, String>> immutableSamples = sampleRows.stream()
                .map(row -> Collections.unmodifiableMap(new LinkedHashMap<>(row)))
                .toList();

        return new DataAnalysisReport(
                originalFilename,
                size,
                format,
                rowCount,
                headers.size(),
                profiles,
                List.copyOf(qualityAlerts),
                List.copyOf(new LinkedHashSet<>(recommendations)),
                immutableSamples,
                summary
        );
    }

    private List<ColumnAccumulator> createAccumulators(List<String> headers) {
        List<ColumnAccumulator> accumulators = new ArrayList<>(headers.size());
        for (String header : headers) {
            accumulators.add(new ColumnAccumulator(header));
        }
        return accumulators;
    }

    private Map<String, String> flattenObject(JsonNode node) {
        Map<String, String> result = new LinkedHashMap<>();
        if (node == null || node.isNull()) {
            return result;
        }

        if (node.isObject()) {
            node.fields().forEachRemaining(entry -> {
                String key = entry.getKey();
                JsonNode value = entry.getValue();
                if (value.isValueNode()) {
                    result.put(key, value.isNull() ? "" : value.asText());
                } else if (value.isArray()) {
                    result.put(key, value.toString());
                } else if (value.isObject()) {
                    Map<String, String> nested = flattenObject(value);
                    nested.forEach((nestedKey, nestedValue) ->
                            result.put(key + "." + nestedKey, nestedValue));
                }
            });
        }

        return result;
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        if (line == null) {
            return values;
        }

        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                values.add(cleanCsvValue(current.toString()));
                current.setLength(0);
            } else {
                current.append(c);
            }
        }

        values.add(cleanCsvValue(current.toString()));
        return values;
    }

    private String cleanCsvValue(String raw) {
        String trimmed = raw.trim();
        if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            trimmed = trimmed.substring(1, trimmed.length() - 1).replace("\"\"", "\"");
        }
        return trimmed;
    }

    private static final class ColumnAccumulator {
        private final String name;
        private long nonNullCount;
        private long emptyCount;
        private long numericCount;
        private long booleanCount;
        private long dateCount;
        private double numericSum;
        private Double numericMin;
        private Double numericMax;
        private final Set<String> distinctValues = new LinkedHashSet<>();
        private final List<String> samples = new ArrayList<>();
        private final List<String> recommendations = new ArrayList<>();

        private ColumnAccumulator(String name) {
            this.name = name;
        }

        private void accept(String rawValue) {
            String value = Optional.ofNullable(rawValue).map(String::trim).orElse("");
            if (value.isEmpty()) {
                emptyCount++;
                return;
            }

            nonNullCount++;

            if (distinctValues.size() < MAX_DISTINCT_VALUES_TRACKED) {
                distinctValues.add(value);
            }

            if (samples.size() < 3) {
                samples.add(value);
            }

            if (looksBoolean(value)) {
                booleanCount++;
                updateRecommendations("boolean");
                return;
            }

            Double numericValue = tryParseDouble(value);
            if (numericValue != null) {
                numericCount++;
                numericSum += numericValue;
                numericMin = numericMin == null ? numericValue : Math.min(numericMin, numericValue);
                numericMax = numericMax == null ? numericValue : Math.max(numericMax, numericValue);
                updateRecommendations("numeric");
                return;
            }

            if (looksLikeDate(value)) {
                dateCount++;
                updateRecommendations("date");
            }
        }

        private ColumnProfile toProfile(long totalRows) {
            String inferredType = inferType();
            double fillRate = totalRows == 0 ? 0 : (double) nonNullCount / (double) totalRows;
            Double average = numericCount == 0 ? null : numericSum / (double) numericCount;
            long distinctCount = distinctValues.size();
            String example = samples.isEmpty() ? "" : samples.getFirst();

            return new ColumnProfile(
                    name,
                    inferredType,
                    nonNullCount,
                    emptyCount,
                    fillRate,
                    numericMin,
                    numericMax,
                    average,
                    distinctCount,
                    example
            );
        }

        private List<String> qualityAlerts(long totalRows) {
            if (totalRows == 0) {
                return List.of();
            }

            List<String> alerts = new ArrayList<>();
            double missingRatio = (double) emptyCount / (double) totalRows;
            if (missingRatio > 0.3) {
                alerts.add(String.format(
                        Locale.ROOT,
                        "%s has %.0f%% missing values. Consider cleaning or annotating these gaps in the contract.",
                        name,
                        missingRatio * 100
                ));
            }

            if (distinctValues.isEmpty()) {
                alerts.add(String.format("%s contains identical values for every record in the sample.", name));
            }

            return alerts;
        }

        private List<String> recommendations() {
            return recommendations;
        }

        private void updateRecommendations(String observedType) {
            String lower = name.toLowerCase(Locale.ROOT);

            switch (observedType) {
                case "numeric" -> {
                    if (containsAny(lower, "price", "value", "cost", "amount")) {
                        addRecommendation("Use this column to set pricing or valuation terms in the contract.");
                    }
                    if (containsAny(lower, "quantity", "volume", "units", "size")) {
                        addRecommendation("This numeric column can define the volume or units covered by the contract.");
                    }
                }
                case "date" -> {
                    if (containsAny(lower, "delivery", "effective", "start", "end")) {
                        addRecommendation("Leverage this date field to define contract delivery or effective timelines.");
                    }
                }
                case "boolean" -> {
                    if (containsAny(lower, "consent", "opt", "active")) {
                        addRecommendation("Clarify how consent or activation status impacts buyer obligations.");
                    }
                }
                default -> {
                    if (containsAny(lower, "buyer", "customer")) {
                        addRecommendation("Reference this field when describing the target buyers or segments.");
                    }
                    if (containsAny(lower, "seller", "provider", "source")) {
                        addRecommendation("Use this attribute to document data provenance within the contract.");
                    }
                }
            }
        }

        private void addRecommendation(String recommendation) {
            if (!recommendations.contains(recommendation)) {
                recommendations.add(recommendation);
            }
        }

        private String inferType() {
            if (numericCount > 0 && numericCount >= booleanCount && numericCount >= dateCount) {
                return "numeric";
            }
            if (dateCount > 0 && dateCount >= booleanCount) {
                return "date";
            }
            if (booleanCount > 0) {
                return "boolean";
            }
            if (nonNullCount == 0) {
                return "empty";
            }
            return "text";
        }

        private boolean containsAny(String value, String... targets) {
            for (String target : targets) {
                if (value.contains(target)) {
                    return true;
                }
            }
            return false;
        }

        private boolean looksBoolean(String value) {
            String normalized = value.toLowerCase(Locale.ROOT);
            return normalized.equals("true") || normalized.equals("false")
                    || normalized.equals("yes") || normalized.equals("no")
                    || normalized.equals("y") || normalized.equals("n")
                    || normalized.equals("0") || normalized.equals("1");
        }

        private Double tryParseDouble(String value) {
            try {
                if (value.startsWith("0") && value.length() > 1 && !value.contains(".")) {
                    return null;
                }
                double parsed = Double.parseDouble(value.replace(",", ""));
                if (Double.isFinite(parsed)) {
                    return parsed;
                }
            } catch (NumberFormatException ignored) {
            }
            return null;
        }

        private boolean looksLikeDate(String value) {
            for (DateTimeFormatter formatter : DATE_FORMATTERS) {
                try {
                    LocalDate.parse(value, formatter);
                    return true;
                } catch (DateTimeParseException ignored) {
                }
            }
            return false;
        }
    }
}
