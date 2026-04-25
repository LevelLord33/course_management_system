package cms.model;

public class StudentDTO {
    public Long id;
    public String name;
    public String rollNo;
    public String email;
    public String department;
    public int semester;
    public String phone;
    public int enrolledCoursesCount;

    public StudentDTO() {}

    public StudentDTO(Student s) {
        this.id                  = s.getId();
        this.name                = s.getName();
        this.rollNo              = s.getRollNo();
        this.email               = s.getEmail();
        this.department          = s.getDepartment();
        this.semester            = s.getSemester();
        this.phone               = s.getPhone();
        this.enrolledCoursesCount = s.getEnrolledCoursesCount();
    }
}
