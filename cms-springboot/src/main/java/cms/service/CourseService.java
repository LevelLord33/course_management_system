package cms.service;

import cms.model.Course;
import cms.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {

    @Autowired CourseRepository repo;

    public List<Course> getAll() { return repo.findAll(); }

    public Optional<Course> getById(Long id) { return repo.findById(id); }

    public Course add(Course c) {
        if (repo.existsByCourseCode(c.getCourseCode()))
            throw new RuntimeException("Course code already exists: " + c.getCourseCode());
        Course saved = repo.save(c);
        repo.flush();
        return repo.findById(saved.getId()).orElse(saved);
    }

    public Course update(Long id, Course in) {
        Course ex = repo.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found: " + id));
        if (notBlank(in.getCourseName()))   ex.setCourseName(in.getCourseName().trim());
        if (notBlank(in.getCourseCode()))   ex.setCourseCode(in.getCourseCode().trim());
        if (in.getInstructor() != null)     ex.setInstructor(in.getInstructor().trim());
        if (in.getCategory()   != null)     ex.setCategory(in.getCategory().trim());
        if (in.getDescription()!= null)     ex.setDescription(in.getDescription().trim());
        if (in.getCredits()    >= 1)        ex.setCredits(in.getCredits());
        if (in.getMaxStrength()>= 1)        ex.setMaxStrength(in.getMaxStrength());
        Course saved = repo.save(ex);
        repo.flush();
        // Re-fetch so EAGER enrollments list is fresh from DB
        return repo.findById(saved.getId()).orElse(saved);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new RuntimeException("Course not found: " + id);
        repo.deleteById(id);
    }

    public List<Course> search(String name)   { return repo.findByCourseNameContainingIgnoreCase(name); }
    public List<Course> available()           { return repo.findAvailableCourses(); }
    public List<Course> byCategory(String c)  { return repo.findByCategory(c); }

    private boolean notBlank(String s) { return s != null && !s.isBlank(); }
}
