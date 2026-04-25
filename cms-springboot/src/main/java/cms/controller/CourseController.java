package cms.controller;

import cms.model.*;
import cms.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired CourseService svc;

    @GetMapping
    public List<CourseDTO> getAll() {
        return svc.getAll().stream().map(CourseDTO::new).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return svc.getById(id)
            .<ResponseEntity<?>>map(c -> ResponseEntity.ok(new CourseDTO(c)))
            .orElse(ResponseEntity.status(404).body(Map.of("error","Not found")));
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody Course c) {
        try {
            return ResponseEntity.status(201).body(new CourseDTO(svc.add(c)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Course c) {
        try {
            return ResponseEntity.ok(new CourseDTO(svc.update(id, c)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            svc.delete(id);
            return ResponseEntity.ok(Map.of("message","Deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public List<CourseDTO> search(@RequestParam String name) {
        return svc.search(name).stream().map(CourseDTO::new).collect(Collectors.toList());
    }

    @GetMapping("/available")
    public List<CourseDTO> available() {
        return svc.available().stream().map(CourseDTO::new).collect(Collectors.toList());
    }
}
