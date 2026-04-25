package cms.repository;

import cms.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    List<Course> findByCategory(String category);
    List<Course> findByCourseNameContainingIgnoreCase(String name);
    boolean existsByCourseCode(String courseCode);
    @Query("SELECT c FROM Course c WHERE SIZE(c.enrollments) < c.maxStrength")
    List<Course> findAvailableCourses();
}
