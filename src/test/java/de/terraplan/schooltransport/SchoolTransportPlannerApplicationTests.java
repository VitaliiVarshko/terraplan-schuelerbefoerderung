
package de.terraplan.schooltransport;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class SchoolTransportPlannerApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void getTripsReturnsThreeTrips() throws Exception {
        mockMvc.perform(get("/api/trips"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(3));
    }

	@DirtiesContext(
 	   methodMode = DirtiesContext.MethodMode.AFTER_METHOD
	)	
	@Test
	void createTripReturnsCreatedTrip() throws Exception {
		String requestBody = """
			{
				"studentName": "Lisa Müller",
				"schoolName": "Freiburg Schule",
				"date": "2026-10-28",
				"driverName": "Thomas Müller"
			}
			""";

		mockMvc.perform(post("/api/trips")
				.contentType(MediaType.APPLICATION_JSON)
				.content(requestBody))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.id").value(4))
			.andExpect(jsonPath("$.studentName").value("Lisa Müller"))
			.andExpect(jsonPath("$.cancelled").value(false));
	}


		
	@Test
	void createTripWithBlankStudentNameReturnsBadRequest() throws Exception {
		String requestBody = """
			{
				"studentName": "   ",
				"schoolName": "Freiburg Schule",
				"date": "2026-10-28",
				"driverName": "Thomas Müller"
			}
			""";

		mockMvc.perform(post("/api/trips")
				.contentType(MediaType.APPLICATION_JSON)
				.content(requestBody))
			.andExpect(status().isBadRequest())
			.andExpect(jsonPath("$.error").value("Validation failed"))
			.andExpect(jsonPath("$.details[0]")
				.value("Student name is required"));
	}

}
