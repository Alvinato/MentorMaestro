<?php

module_load_include('inc', 'yearmanager', 'db');

/*
 * Stores grouping into database
 */
function saveGroups($groups, $year, $percentage, $weighting, $nickname) {
    db_insert('maestro_matched_trios')
        ->fields(array(
            'timestamp'      => date('Y-m-d H:i:s'),
            'nickname'       => $nickname,
            'mentoring_year' => $year,
            'weightings'     => json_encode($weighting),
            'percentage'     => $percentage,
            'trios'          => json_encode($groups),
            ))
        ->execute();
}

/*
 * Verifies that the nickname is valid
 */
function verifyValidNickname($nickname) {
    $year = getYear();
    $db_this_year = db_select('maestro_matched_trios', 'mmt')
        ->fields('mmt')
        ->condition('nickname', $nickname, '=')
        ->condition('mentoring_year', $year, '=')
        ->execute()
        ->fetchAll();
    return count($db_this_year) == 0;
}

/*
 * Get mentor array from mentor obj
 */
function getMentor($mentor_obj, $weighting) {
        $mentor = array();

        // put hardcoded items in
        $mentor['id']          = $mentor_obj->{'id'};
        $mentor['gender']      = $mentor_obj->{'gender'};
        $mentor['gender_pref'] = $mentor_obj->{'gender_pref'};
        $mentor['kickoff']     = $mentor_obj->{'kickoff'};

        // put weighted items
        foreach ($weighting as $k => $v) {
            if (isset($mentor_obj->{$k}))
                $mentor[$k] = $mentor_obj->{$k};
        }

        return $mentor;
}

/*
 * Get student array from mentor obj
 */
function getStudent($student_obj, $weighting) {
        $student = array();

        // put hardcoded items in
        $student['id']          = $student_obj->{'id'};
        $student['gender']      = $student_obj->{'gender'};
        $student['gender_pref'] = $student_obj->{'gender_pref'};
        $student['kickoff']     = $student_obj->{'kickoff'};
        $student['previous_tm'] = $student_obj->{'previous_tm'};
        $student['year']        = $student_obj->{'year'};
        $student['num_courses'] = $student_obj->{'num_courses'};

        // put weighted items
        foreach ($weighting as $k => $v) {
            if (isset($student_obj->{$k}))
                $student[$k] = $student_obj->{$k};
        }

        return $student;
}

/*
 * Gets participants from the database
 */
function getParticipants($year, $weighting) {
    // First get name of participant tables
    list($mentor_table_name, $student_table_name) = getParticipantTableNames($year);

    // ================= get mentors =================
    $mentors_from_db = db_select($mentor_table_name, 'mtn')
        ->fields('mtn')
        ->execute()
        ->fetchAll();

    $mentors = array();

    foreach ($mentors_from_db as $curr) {
        array_push($mentors, getMentor($curr, $weighting));
    }

    $num_mentors = count($mentors);


    // ================= get students =================
    $students_from_db = db_select($student_table_name, 'stn')
        ->fields('stn')
        ->execute()
        ->fetchAll();

    $students = array();

    foreach ($students_from_db as $curr) {
        array_push($students, getStudent($curr, $weighting));
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
