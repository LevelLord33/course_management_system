package cms.controller;

import cms.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    @Autowired EnrollmentService svc;

    @PostMapping
    public ResponseEntity<?> enroll(@RequestBody Map<String,Long> body) {
        try {
            Long sid = body.get("studentId"), cid = body.get("courseId");
            if (sid == null || cid == null)
                return ResponseEntity.badRequest().body(Map.of("error","studentId and courseId required"));
            return ResponseEntity.status(201).body(svc.enroll(sid, cid));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> withdraw(@RequestBody Map<String,Long> body) {
        try {
            svc.withdraw(body.get("studentId"), body.get("courseId"));
            return ResponseEntity.ok(Map.of("message","Withdrawn"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/grade")
    public ResponseEntity<?> grade(@PathVariable Long id, @RequestBody Map<String,String> body) {
        try {
            return ResponseEntity.ok(svc.updateGrade(id, body.get("grade")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> byCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(svc.forCourse(courseId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> byStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(svc.forStudent(studentId));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        return ResponseEntity.ok(svc.stats());
    }
}
