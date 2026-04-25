package cms.model;

public class CourseDTO {
    public Long id;
    public String courseName;
    public String courseCode;
    public int credits;
    public int maxStrength;
    public String description;
    public String instructor;
    public String category;
    public int enrolledCount;
    public boolean available;

    public CourseDTO() {}

    public CourseDTO(Course c) {
        this.id           = c.getId();
        this.courseName   = c.getCourseName();
        this.courseCode   = c.getCourseCode();
        this.credits      = c.getCredits();
        this.maxStrength  = c.getMaxStrength();
        this.description  = c.getDescription();
        this.instructor   = c.getInstructor();
        this.category     = c.getCategory();
        this.enrolledCount = c.getEnrolledCount();
        this.available    = c.isAvailable();
    }
}
