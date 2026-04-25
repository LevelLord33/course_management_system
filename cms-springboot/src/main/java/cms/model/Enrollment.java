package cms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "course_id"}))
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(updatable = false)
    private LocalDateTime enrolledAt;

    private String grade;
    private String status;

    @PrePersist
    protected void onCreate() {
        enrolledAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }

    public Enrollment() {}
    public Enrollment(Student student, Course course) {
        this.student = student;
        this.course = course;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Student getStudent() { return student; }
    public void setStudent(Student s) { this.student = s; }
    public Course getCourse() { return course; }
    public void setCourse(Course c) { this.course = c; }
    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public String getGrade() { return grade; }
    public void setGrade(String g) { this.grade = g; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
}
