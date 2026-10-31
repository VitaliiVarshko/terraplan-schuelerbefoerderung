
package de.terraplan.schooltransport;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;

    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    @Transactional
    public List<Trip> getAllTrips() {
        initializeDemoDataIfEmpty();
        return tripRepository.findAll();
    }

    @Transactional
    public List<Trip> getActiveTrips() {
        initializeDemoDataIfEmpty();
        return tripRepository.findByCancelledFalse();
    }

    @Transactional
    public Trip addTrip(
            String studentName,
            String schoolName,
            LocalDate date,
            String driverName) {

        Trip trip = new Trip(
            null,
            studentName,
            schoolName,
            date,
            driverName,
            false
        );

        return tripRepository.save(trip);
    }


    @Transactional
    public Trip updateTripStatus(Long id, boolean cancelled) {
        Trip trip = tripRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "Fahrt mit ID " + id + " wurde nicht gefunden."
            ));

        trip.setCancelled(cancelled);

        return tripRepository.save(trip);
    }


    @Transactional
    public Trip updateTrip(
            Long id,
            String studentName,
            String schoolName,
            LocalDate date,
            String driverName) {

        Trip trip = tripRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "Fahrt mit ID " + id + " wurde nicht gefunden."
            ));

        trip.setStudentName(studentName);
        trip.setSchoolName(schoolName);
        trip.setDate(date);
        trip.setDriverName(driverName);

        return tripRepository.save(trip);
    }



    private void initializeDemoDataIfEmpty() {
        if (tripRepository.count() > 0) {
            return;
        }

        tripRepository.saveAll(List.of(
            new Trip(
                null,
                "Max Mustermann",
                "Freiburg Schule",
                LocalDate.now(),
                "Thomas Müller",
                false
            ),
            new Trip(
                null,
                "Anna Schmidt",
                "Schallstadt Schule",
                LocalDate.now().plusDays(1),
                "Julia Weber",
                false
            ),
            new Trip(
                null,
                "Paul Weber",
                "Umkirch Schule",
                LocalDate.now(),
                "Thomas Müller",
                true
            )
        ));
    }
}
