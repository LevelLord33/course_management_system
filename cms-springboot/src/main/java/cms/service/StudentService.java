package cms.service;

import cms.model.Student;
import cms.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentService {

    @Autowired StudentRepository repo;

    public List<Student> getAll() { return repo.findAll(); }

    public Optional<Student> getById(Long id) { return repo.findById(id); }

    public Student add(Student s) {
        if (repo.existsByRollNo(s.getRollNo()))
            throw new RuntimeException("Roll No already exists: " + s.getRollNo());
        if (s.getEmail() != null && !s.getEmail().isBlank() && repo.existsByEmail(s.getEmail()))
            throw new RuntimeException("Email already registered: " + s.getEmail());
        Student saved = repo.save(s);
        repo.flush();
        return repo.findById(saved.getId()).orElse(saved);
    }

    public Student update(Long id, Student in) {
        Student ex = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found: " + id));
        if (notBlank(in.getName()))       ex.setName(in.getName().trim());
        if (in.getEmail()      != null)   ex.setEmail(in.getEmail().trim());
        if (in.getPhone()      != null)   ex.setPhone(in.getPhone().trim());
        if (in.getDepartment() != null)   ex.setDepartment(in.getDepartment().trim());
        ex.setSemester(in.getSemester());
        Student saved = repo.save(ex);
        repo.flush();
        return repo.findById(saved.getId()).orElse(saved);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new RuntimeException("Student not found: " + id);
        repo.deleteById(id);
    }

    public List<Student> search(String name) { return repo.findByNameContainingIgnoreCase(name); }
    public List<Student> byDept(String dept) { return repo.findByDepartment(dept); }

    private boolean notBlank(String s) { return s != null && !s.isBlank(); }
}
