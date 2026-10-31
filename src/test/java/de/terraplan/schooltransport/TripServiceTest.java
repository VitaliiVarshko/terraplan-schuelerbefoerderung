package de.terraplan.schooltransport;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TripServiceTest {

    private final TripService tripService = new TripService();

    @Test
    void getAllTripsReturnsThreeTrips() {
        List<Trip> trips = tripService.getAllTrips();

        assertEquals(3, trips.size());
    }

    @Test
    void getActiveTripsDoesNotReturnCancelledTrips() {
        List<Trip> trips = tripService.getActiveTrips();

        assertEquals(2, trips.size());

        assertTrue(
            trips.stream().noneMatch(Trip::isCancelled)
        );
    }

    @Test
    void addTripCreatesTripWithNextId() {
        Trip trip = tripService.addTrip(
            "Lisa Müller",
            "Freiburg Schule",
            java.time.LocalDate.now(),
            "Thomas Müller"
        );

        assertEquals(4L, trip.getId());
        assertEquals("Lisa Müller", trip.getStudentName());
        assertEquals("Freiburg Schule", trip.getSchoolName());
        assertEquals("Thomas Müller", trip.getDriverName());
        assertFalse(trip.isCancelled());
    }


    @Test
    void addTripCreatesUniqueIdsForMultipleTrips() {
        Trip firstTrip = tripService.addTrip(
            "Lisa Müller",
            "Freiburg Schule",
            java.time.LocalDate.now(),
            "Thomas Müller"
        );

        Trip secondTrip = tripService.addTrip(
            "Peter Schmidt",
            "Umkirch Schule",
            java.time.LocalDate.now(),
            "Julia Weber"
        );

        assertEquals(4L, firstTrip.getId());
        assertEquals(5L, secondTrip.getId());
        assertNotEquals(firstTrip.getId(), secondTrip.getId());
    }


}