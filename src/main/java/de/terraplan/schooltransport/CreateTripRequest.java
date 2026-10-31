
package de.terraplan.schooltransport;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateTripRequest(

    @NotBlank(message = "Student name is required")
    String studentName,

    @NotBlank(message = "School name is required")
    String schoolName,

    @NotNull(message = "Trip date is required")
    LocalDate date,

    @NotBlank(message = "Driver name is required")
    String driverName

) {}
