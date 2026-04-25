package cms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String courseName;

    @Column(nullable = false, unique = true)
    private String courseCode;

    private int credits;
    private int maxStrength;
    private String description;
    private String instructor;
    private String category;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    // EAGER so DTO can call .size() even after detach
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Enrollment> enrollments = new ArrayList<>();

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Course() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String v) { this.courseName = v; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String v) { this.courseCode = v; }
    public int getCredits() { return credits; }
    public void setCredits(int v) { this.credits = v; }
    public int getMaxStrength() { return maxStrength; }
    public void setMaxStrength(int v) { this.maxStrength = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public String getInstructor() { return instructor; }
    public void setInstructor(String v) { this.instructor = v; }
    public String getCategory() { return category; }
    public void setCategory(String v) { this.category = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public List<Enrollment> getEnrollments() { return enrollments; }
    public int getEnrolledCount() { return enrollments != null ? enrollments.size() : 0; }
    public boolean isAvailable() { return getEnrolledCount() < maxStrength; }
}
