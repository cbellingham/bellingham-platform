package com.bellingham.datafutures.controller;

import com.bellingham.datafutures.service.DataAnalysisService;
import com.bellingham.datafutures.service.dto.DataAnalysisReport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/data")
public class DataAnalysisController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DataAnalysisController.class);

    private final DataAnalysisService dataAnalysisService;

    public DataAnalysisController(DataAnalysisService dataAnalysisService) {
        this.dataAnalysisService = dataAnalysisService;
    }

    @PostMapping(path = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DataAnalysisReport> analyze(@RequestPart("file") MultipartFile file) throws Exception {
        LOGGER.info("Received data sample for analysis: name={}, size={} bytes", file.getOriginalFilename(), file.getSize());
        DataAnalysisReport report = dataAnalysisService.analyze(file);
        return ResponseEntity.ok(report);
    }
}
