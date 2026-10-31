package de.terraplan.schooltransport;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

import jakarta.validation.Valid;
import java.util.List;

@RestController
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @GetMapping("/api/trips")
    public List<Trip> getTrips() {
        return tripService.getAllTrips();
    }

    @GetMapping("/api/trips/active")
    public List<Trip> getActiveTrips() {
        return tripService.getActiveTrips();
    }

    @PostMapping("/api/trips")
    public Trip createTrip(@Valid @RequestBody CreateTripRequest request) {
        return tripService.addTrip(
            request.studentName(),
            request.schoolName(),
            request.date(),
            request.driverName()
        );
    }


    @PutMapping("/api/trips/{id}")
    public Trip updateTrip(
            @PathVariable Long id,
            @Valid @RequestBody CreateTripRequest request) {

        return tripService.updateTrip(
            id,
            request.studentName(),
            request.schoolName(),
            request.date(),
            request.driverName()
        );
    }


    @PatchMapping("/api/trips/{id}/status")
    public Trip updateTripStatus(
            @PathVariable Long id,
            @RequestParam boolean cancelled) {
        return tripService.updateTripStatus(id, cancelled);
    }
}
