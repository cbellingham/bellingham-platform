package com.bellingham.datafutures.service;

import com.bellingham.datafutures.service.dto.DataAnalysisReport;
import com.bellingham.datafutures.service.dto.DataAnalysisReport.BenchmarkInsight;
import com.bellingham.datafutures.service.dto.DataAnalysisReport.ColumnProfile;
import com.bellingham.datafutures.service.dto.DataAnalysisReport.FairValueBand;
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
import java.util.OptionalDouble;
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

        List<BenchmarkInsight> benchmarkInsights = generateBenchmarkInsights(accumulators, rowCount);
        List<FairValueBand> fairValueBands = generateFairValueBands(accumulators, rowCount);

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
                benchmarkInsights,
                fairValueBands,
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

    private List<BenchmarkInsight> generateBenchmarkInsights(List<ColumnAccumulator> accumulators, long rowCount) {
        if (accumulators == null || accumulators.isEmpty() || rowCount == 0) {
            return List.of();
        }

        List<ColumnAccumulator> priceColumns = accumulators.stream()
                .filter(this::isLikelyPriceColumn)
                .filter(acc -> acc.numericCount > 0)
                .toList();
        List<ColumnAccumulator> deliveryColumns = accumulators.stream()
                .filter(this::isLikelyDeliveryColumn)
                .toList();
        List<ColumnAccumulator> volumeColumns = accumulators.stream()
                .filter(this::isLikelyVolumeColumn)
                .toList();
        List<ColumnAccumulator> buyerColumns = accumulators.stream()
                .filter(this::isLikelyBuyerColumn)
                .toList();
        List<ColumnAccumulator> geographyColumns = accumulators.stream()
                .filter(this::isLikelyGeographyColumn)
                .toList();

        List<BenchmarkInsight> insights = new ArrayList<>();

        if (!priceColumns.isEmpty()) {
            List<String> supportingColumns = toUniqueColumnNames(priceColumns, volumeColumns, deliveryColumns);
            List<String> actions = new ArrayList<>();
            actions.add("Bundle pricing with delivery and quantity terms so marketplace buyers can compare peer listings.");
            if (rowCount < 50) {
                actions.add("Upload at least 50 representative rows to tighten the benchmark cluster before publishing.");
            }
            if (priceColumns.stream().anyMatch(acc -> acc.numericCount < rowCount * 0.6)) {
                actions.add("Fill in missing pricing values to avoid noisy guidance and failed auto-valuation checks.");
            }

            List<String> anomalies = collectPriceAnomalies(priceColumns, rowCount, !deliveryColumns.isEmpty(), !volumeColumns.isEmpty());

            insights.add(new BenchmarkInsight(
                    "Transactional fulfillment cluster",
                    "Pricing columns align with comparable delivery and quantity patterns observed in live marketplace contracts.",
                    supportingColumns,
                    actions,
                    anomalies
            ));
        }

        if (!buyerColumns.isEmpty() || !geographyColumns.isEmpty()) {
            List<String> supportingColumns = toUniqueColumnNames(buyerColumns, geographyColumns);
            List<String> actions = new ArrayList<>();
            actions.add("Highlight the strongest customer or market segments to differentiate your contract summary.");
            if (buyerColumns.stream().anyMatch(acc -> acc.distinctValues.size() > 50)) {
                actions.add("Group long-tail buyer attributes into broader cohorts so recommendation models stay stable.");
            }

            List<String> anomalies = new ArrayList<>();
            for (ColumnAccumulator column : buyerColumns) {
                double fillRate = rowCount == 0 ? 0 : (double) column.nonNullCount / (double) rowCount;
                if (fillRate < 0.6) {
                    anomalies.add(String.format(Locale.ROOT,
                            "%s is sparsely populated, reducing confidence in demand-segmentation scoring.",
                            column.name));
                }
            }

            insights.add(new BenchmarkInsight(
                    "Audience segmentation cluster",
                    "Categorical buyer and geography fields mirror clusters used to power demand forecasts and targeting guidance.",
                    supportingColumns,
                    actions,
                    anomalies
            ));
        }

        if (insights.isEmpty()) {
            insights.add(new BenchmarkInsight(
                    "Exploratory contract cluster",
                    "The sample lacks strong signals for existing benchmarks. Add pricing, delivery or audience markers to unlock guidance.",
                    List.of(),
                    List.of("Tag core commercial metrics so the platform can align the offer with historical performance."),
                    List.of()
            ));
        }

        return List.copyOf(insights);
    }

    private List<FairValueBand> generateFairValueBands(List<ColumnAccumulator> accumulators, long rowCount) {
        if (accumulators == null || accumulators.isEmpty()) {
            return List.of();
        }

        boolean hasDeliveryColumns = accumulators.stream().anyMatch(this::isLikelyDeliveryColumn);
        List<FairValueBand> bands = new ArrayList<>();

        for (ColumnAccumulator accumulator : accumulators) {
            if (!isLikelyPriceColumn(accumulator) || accumulator.numericCount == 0) {
                continue;
            }

            OptionalDouble avgOpt = accumulator.numericAverage();
            if (avgOpt.isEmpty()) {
                continue;
            }

            double mean = avgOpt.getAsDouble();
            OptionalDouble stdOpt = accumulator.numericStandardDeviation();
            double std = stdOpt.orElse(Math.abs(mean) * 0.1);
            if (!Double.isFinite(std) || std == 0d) {
                std = Math.abs(mean) * 0.05;
            }

            double low = mean - std;
            double high = mean + std;
            if (accumulator.numericMin != null) {
                low = Math.max(low, accumulator.numericMin);
            }
            if (accumulator.numericMax != null) {
                high = Math.min(high, accumulator.numericMax);
            }
            if (low > high) {
                double mid = mean;
                low = Math.min(low, mid);
                high = Math.max(high, mid);
            }

            double mid = mean;
            bands.add(new FairValueBand(
                    accumulator.name,
                    roundToTwo(low),
                    roundToTwo(mid),
                    roundToTwo(high),
                    buildFairValueGuidance(accumulator, rowCount, stdOpt.isPresent(), hasDeliveryColumns)
            ));
        }

        return bands.isEmpty() ? List.of() : List.copyOf(bands);
    }

    private List<String> toUniqueColumnNames(List<ColumnAccumulator>... accumulatorGroups) {
        LinkedHashSet<String> names = new LinkedHashSet<>();
        for (List<ColumnAccumulator> group : accumulatorGroups) {
            for (ColumnAccumulator accumulator : group) {
                names.add(accumulator.name);
            }
        }
        return List.copyOf(names);
    }

    private List<String> collectPriceAnomalies(List<ColumnAccumulator> priceColumns, long rowCount,
                                               boolean hasDeliveryColumns, boolean hasVolumeColumns) {
        List<String> anomalies = new ArrayList<>();
        for (ColumnAccumulator column : priceColumns) {
            OptionalDouble avgOpt = column.numericAverage();
            OptionalDouble stdOpt = column.numericStandardDeviation();
            double contextWeight = (hasDeliveryColumns ? 0.2 : 0) + (hasVolumeColumns ? 0.2 : 0);

            if (avgOpt.isPresent() && stdOpt.isPresent()) {
                double mean = avgOpt.getAsDouble();
                double std = stdOpt.getAsDouble();
                if (std > 0 && mean != 0) {
                    double coefficient = Math.abs(std / mean);
                    if (coefficient > 0.45 - contextWeight) {
                        String context = hasDeliveryColumns ? "delivery windows" : hasVolumeColumns ? "volume tiers" : "peer listings";
                        anomalies.add(String.format(Locale.ROOT,
                                "%s shows volatile pricing against %s; normalise your units or provide context notes.",
                                column.name,
                                context));
                    }
                }

                if (column.numericMin != null && column.numericMax != null && std > 0) {
                    double zLow = Math.abs((column.numericMin - mean) / std);
                    double zHigh = Math.abs((column.numericMax - mean) / std);
                    if (zLow > 2.5) {
                        anomalies.add(String.format(Locale.ROOT,
                                "Minimum %s value (%.2f) is an outlier versus benchmark contracts.",
                                column.name,
                                column.numericMin));
                    }
                    if (zHigh > 2.5) {
                        anomalies.add(String.format(Locale.ROOT,
                                "Maximum %s value (%.2f) is an outlier versus benchmark contracts.",
                                column.name,
                                column.numericMax));
                    }
                }
            }

            if (rowCount > 0 && column.numericCount < rowCount * 0.6) {
                anomalies.add(String.format(Locale.ROOT,
                        "%s is missing in %.0f%% of rows; fill pricing gaps before activating valuation bots.",
                        column.name,
                        (1 - ((double) column.numericCount / (double) rowCount)) * 100));
            }
        }
        return List.copyOf(new LinkedHashSet<>(anomalies));
    }

    private String buildFairValueGuidance(ColumnAccumulator priceColumn, long rowCount, boolean hasStdDev,
                                          boolean hasDeliveryColumns) {
        StringBuilder guidance = new StringBuilder();
        if (hasStdDev) {
            guidance.append("Band derived from the observed price distribution.");
        } else {
            guidance.append("Band interpolated from limited variance; add more samples for greater confidence.");
        }

        if (rowCount < 25) {
            guidance.append(" Add 25+ rows to stabilise marketplace pricing guidance.");
        }

        if (priceColumn.numericCount < rowCount) {
            guidance.append(String.format(Locale.ROOT,
                    " %.0f%% of records lacked numeric values in %s.",
                    (1 - ((double) priceColumn.numericCount / Math.max(1, rowCount))) * 100,
                    priceColumn.name));
        }

        if (hasDeliveryColumns) {
            guidance.append(" Align delivery commitments with the median price before publishing.");
        }

        return guidance.toString().trim();
    }

    private boolean isLikelyPriceColumn(ColumnAccumulator accumulator) {
        String lower = accumulator.name.toLowerCase(Locale.ROOT);
        return accumulator.containsAny(lower, "price", "cost", "amount", "value", "rate", "fee", "tariff", "premium");
    }

    private boolean isLikelyVolumeColumn(ColumnAccumulator accumulator) {
        String lower = accumulator.name.toLowerCase(Locale.ROOT);
        return accumulator.containsAny(lower, "quantity", "volume", "units", "impression", "usage", "capacity", "load");
    }

    private boolean isLikelyDeliveryColumn(ColumnAccumulator accumulator) {
        String lower = accumulator.name.toLowerCase(Locale.ROOT);
        return accumulator.containsAny(lower, "delivery", "term", "duration", "lead", "window", "sla", "schedule", "date");
    }

    private boolean isLikelyBuyerColumn(ColumnAccumulator accumulator) {
        String lower = accumulator.name.toLowerCase(Locale.ROOT);
        return accumulator.containsAny(lower, "buyer", "customer", "segment", "industry", "persona", "account");
    }

    private boolean isLikelyGeographyColumn(ColumnAccumulator accumulator) {
        String lower = accumulator.name.toLowerCase(Locale.ROOT);
        return accumulator.containsAny(lower, "region", "market", "country", "state", "city", "geo");
    }

    private Double roundToTwo(double value) {
        if (!Double.isFinite(value)) {
            return null;
        }
        return Math.round(value * 100.0) / 100.0;
    }

    private static final class ColumnAccumulator {
        private final String name;
        private long nonNullCount;
        private long emptyCount;
        private long numericCount;
        private long booleanCount;
        private long dateCount;
        private double numericSum;
        private double numericSumSquares;
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
                numericSumSquares += numericValue * numericValue;
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

        private OptionalDouble numericAverage() {
            if (numericCount == 0) {
                return OptionalDouble.empty();
            }
            return OptionalDouble.of(numericSum / (double) numericCount);
        }

        private OptionalDouble numericStandardDeviation() {
            if (numericCount <= 1) {
                return OptionalDouble.empty();
            }
            double mean = numericSum / (double) numericCount;
            double variance = (numericSumSquares / (double) numericCount) - (mean * mean);
            if (variance < 0) {
                variance = 0;
            }
            return OptionalDouble.of(Math.sqrt(variance));
        }
    }
}
