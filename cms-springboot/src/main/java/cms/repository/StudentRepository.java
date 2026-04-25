package cms.repository;

import cms.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByRollNo(String rollNo);
    List<Student> findByDepartment(String department);
    List<Student> findByNameContainingIgnoreCase(String name);
    boolean existsByRollNo(String rollNo);
    boolean existsByEmail(String email);
}
