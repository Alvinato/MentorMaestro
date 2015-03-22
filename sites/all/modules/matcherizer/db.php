<?php

/*
 * Stores grouping into database
 */
function saveGroups($groups, $year, $percentage, $weighting) {
    $query = "INSERT INTO maestro_db.maestro_matched_trios (timestamp, mentoring_year, weightings, percentage, trios) VALUES (:ts, :my, :w, :p, :t)";
    db_query($query, array(
        ':ts' => date('Y-m-d H:i:s'),
        ':my' => $year, 
        ':w'  => json_encode($weighting),
        ':p'  => $percentage,
        ':t'  => json_encode($groups),
        ));

    dpm('Average similarity: '.$percentage);
}

/*
 * Get current year
 */
function getYear() {
    $query = "SELECT * FROM maestro_db.maestro_years WHERE active = 1";
    $result = db_query($query)->fetchObject();

    return $result->{'year'};
}

/*
 * Gets participants from the database
 */
function getParticipants($year, $weighting) {
    // First get name of database
    $query = "SELECT * FROM maestro_db.maestro_years WHERE year = '".$year."'";
    $result = db_query($query);

    $obj = $result->fetchObject();

    $mentor_table_name = $obj->{'mentor_table_name'};
    $student_table_name = $obj->{'student_table_name'};

    // ================= get mentors =================
    $query = "SELECT * FROM maestro_db.".$mentor_table_name;
    $result = db_query($query);

    $mentors_from_db = $result->fetchAll();

    $mentors = array();

    foreach ($mentors_from_db as $curr) {
        $curr_mentor = array();

        // put hardcoded items in
        $curr_mentor['id'] = $curr->{'id'};
        $curr_mentor['gender'] = $curr->{'gender'};
        $curr_mentor['gender_pref'] = $curr->{'gender_pref'};
        $curr_mentor['kickoff'] = $curr->{'kickoff'};

        // put weighted items
        foreach ($weighting as $k => $v) {
            if (isset($curr->{$k}))
                $curr_mentor[$k] = $curr->{$k};
        }

        array_push($mentors, $curr_mentor);
    }

    $num_mentors = count($mentors);


    // ================= get students =================
    $query = "SELECT * FROM maestro_db.".$student_table_name;
    $result = db_query($query);

    $students_from_db = $result->fetchAll();

    $students = array();

    foreach ($students_from_db as $curr) {
        $curr_student = array();

        // put hardcoded items in
        $curr_student['id'] = $curr->{'id'};
        $curr_student['gender'] = $curr->{'gender'};
        $curr_student['gender_pref'] = $curr->{'gender_pref'};
        $curr_student['kickoff'] = $curr->{'kickoff'};
        $curr_student['previous_tm'] = $curr->{'previous_tm'};
        $curr_student['year'] = $curr->{'year'};
        $curr_student['num_courses'] = $curr->{'num_courses'};

        // put weighted items
        foreach ($weighting as $k => $v) {
            if (isset($curr->{$k}))
                $curr_student[$k] = $curr->{$k};
        }

        array_push($students, $curr_student);
    }

    $num_students = count($students);

    if ($num_students % 2 == 1) {
        // odd
        unset($students[--$num_students]);
    }

    if ($num_students > 2 * $num_mentors) {
        do {
            unset($students[--$num_students]);
        } while ($num_students > 2 * $num_mentors);
    } else if ($num_students < 2 * $num_mentors) {
        do {
            unset($mentors[--$num_mentors]);
        } while ($num_students < 2 * $num_mentors);
    }

    // Make sure we have the same number of students and mentors

    return array($students, $mentors);
}
