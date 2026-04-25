package cms.controller;

import cms.model.*;
import cms.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired StudentService svc;

    @GetMapping
    public List<StudentDTO> getAll() {
        return svc.getAll().stream().map(StudentDTO::new).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        return svc.getById(id)
            .<ResponseEntity<?>>map(s -> ResponseEntity.ok(new StudentDTO(s)))
            .orElse(ResponseEntity.status(404).body(Map.of("error","Not found")));
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody Student s) {
        try {
            return ResponseEntity.status(201).body(new StudentDTO(svc.add(s)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Student s) {
        try {
            return ResponseEntity.ok(new StudentDTO(svc.update(id, s)));
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
    public List<StudentDTO> search(@RequestParam String name) {
        return svc.search(name).stream().map(StudentDTO::new).collect(Collectors.toList());
    }
}
