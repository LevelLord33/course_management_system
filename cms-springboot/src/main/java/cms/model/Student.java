package cms.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String rollNo;

    private String email;
    private String department;
    private int semester;
    private String phone;

    @Column(updatable = false)
    private LocalDateTime registeredAt;

    // EAGER so DTO can call .size() safely
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL,
               orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Enrollment> enrollments = new ArrayList<>();

    @PrePersist
    protected void onCreate() { registeredAt = LocalDateTime.now(); }

    public Student() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getRollNo() { return rollNo; }
    public void setRollNo(String v) { this.rollNo = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
    public String getDepartment() { return department; }
    public void setDepartment(String v) { this.department = v; }
    public int getSemester() { return semester; }
    public void setSemester(int v) { this.semester = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { this.phone = v; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public List<Enrollment> getEnrollments() { return enrollments; }
    public int getEnrolledCoursesCount() { return enrollments != null ? enrollments.size() : 0; }
}
