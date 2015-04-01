<?php

module_load_include('inc', 'yearmanager', 'db');

/*
 * Stores grouping into database
 */
function saveGroups($groups, $year, $percentage, $weighting) {
    db_insert('maestro_matched_trios')
        ->fields(array(
            'timestamp'      => date('Y-m-d H:i:s'),
            'mentoring_year' => $year,
            'weightings'     => json_encode($weighting),
            'percentage'     => $percentage,
            'trios'          => json_encode($groups),
            ))
        ->execute();
}

/*
 *
 */
function getExtraFields() {

}

/*
 * Get mentor array from mentor obj
 */
function getMentor($mentor_obj, $weighting) {
        $mentor = array();

        // put hardcoded items in
        $mentor['id']          = $mentor_obj->{'id'};
        $mentor['gender']      = $mentor_obj->{'gender'};
        $mentor['kickoff']     = json_decode($mentor_obj->{'kickoff'}, true);

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
        $student['year']        = $student_obj->{'year'};
        $student['gender']      = $student_obj->{'gender'};
        $student['kickoff']     = json_decode($student_obj->{'kickoff'}, true);
        $student['previous_tm'] = $student_obj->{'previous_tm'};
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

/*
 * Get all fields for the matcherizer to match
 */
function getFieldsToMatch() {
    $fields_to_match = array(
        'gender_pref'       => 'Gender Preference',
        'cs_interests'      => 'CS Interests',
        'hobbies_interests' => 'Hobbies and Interests',
        'birth_year'        => 'Birth Year',
        'program'           => 'Degree Program',
        'career'            => 'Career Plans',
        // TODO parse "extra" stuff in here
        );

    $year = getYear();

    // First get name of participant tables
    list($mentor_table_name, $student_table_name) = getParticipantTableNames($year);

    // Get extra stuff from mentors
    $db_extras_m = db_select($mentor_table_name, 'mtn')
        ->fields('mtn')
        ->condition('id', 1, '=')
        ->execute()
        ->fetchObject()
        ->{'extra'};

    $mx = json_decode($db_extras_m, TRUE);

    // Get extra stuff from students
    $db_extras_s = db_select($student_table_name, 'stn')
        ->fields('stn')
        ->condition('id', 1, '=')
        ->execute()
        ->fetchObject()
        ->{'extra'};

    $sx = json_decode($db_extras_s, TRUE);

    if (!$mx || !$sx) return $fields_to_match;

    $extra_questions_s = unserialize(
        db_select('qforms_definition', 'qd')
            ->fields('qd')
            ->condition('nid', 4, '=')
            ->execute()
            ->fetchObject()
            ->{'form_definition'}
        );

    $extra_questions_m = unserialize(
        db_select('qforms_definition', 'qd')
            ->fields('qd')
            ->condition('nid', 5, '=')
            ->execute()
            ->fetchObject()
            ->{'form_definition'}
        );

    $xqm = array();

    foreach ($mx as $q => $r) {
        if (array_key_exists($extra_questions_m, $mx)) {
            $xqm[$mx] = $extra_questions_m[$mx]['title'];
        }
    }

    $xqs = array();

    foreach ($sx as $q => $r) {
        if (array_key_exists($extra_questions_s, $sx)) {
            $xqs[$sx] = $extra_questions_s[$sx]['title'];
        }
    }

    // TODO: VERY BUGGY, PROBABLY DOES NOT WORK
    foreach ($xqs as $q => $r) {
        if (in_array($r, $xqm)) {
            $fields_to_match[$q] = $r;
        }
    }

    return $fields_to_match;
}
