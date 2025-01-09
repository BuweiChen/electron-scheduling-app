USE MeetingScheduler;

-- Table to store meeting room information
CREATE TABLE MeetingRooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL
);

-- Table to store available time slots for each room
CREATE TABLE TimeSlots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (room_id) REFERENCES MeetingRooms(id) ON DELETE CASCADE
);

-- Table to store persons information
CREATE TABLE Persons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Table to store meetings
CREATE TABLE Meetings (
    id INT AUTO_INCREMENT PRIMARY KEY
);

-- Table to store meeting participants
CREATE TABLE MeetingParticipants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    person_id INT NOT NULL,
    FOREIGN KEY (meeting_id) REFERENCES Meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES Persons(id) ON DELETE CASCADE
);

-- Table to store time slots allocated to meetings
CREATE TABLE MeetingTimeSlots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meeting_id INT NOT NULL,
    timeslot_id INT NOT NULL,
    FOREIGN KEY (meeting_id) REFERENCES Meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (timeslot_id) REFERENCES TimeSlots(id) ON DELETE CASCADE
);
