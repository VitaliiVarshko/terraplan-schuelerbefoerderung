
package de.terraplan.schooltransport;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String schoolName;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String driverName;

    @Column(nullable = false)
    private boolean cancelled;

    protected Trip() {
    }

    public Trip(
            Long id,
            String studentName,
            String schoolName,
            LocalDate date,
            String driverName,
            boolean cancelled) {
        this.id = id;
        this.studentName = studentName;
        this.schoolName = schoolName;
        this.date = date;
        this.driverName = driverName;
        this.cancelled = cancelled;
    }

    public Long getId() {
        return id;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getSchoolName() {
        return schoolName;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getDriverName() {
        return driverName;
    }

    public boolean isCancelled() {
        return cancelled;
    }

    public void setCancelled(boolean cancelled) {
        this.cancelled = cancelled;
    }


    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public void setSchoolName(String schoolName) {
        this.schoolName = schoolName;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }


}
