<?php

/*
 * Get current year
 */
function getYear() {
    return db_select('maestro_years', 'my')
        ->fields('my')
        ->condition('active', 1, '=')
        ->execute()
        ->fetchObject()
        ->{'year'};
}

/*
 * Get year for registration
 */
function getRegistrationYear() {
    $curr = db_select('maestro_years', 'my')
        ->fields('my')
        ->condition('archived', 0, '=')
        ->execute()
        ->fetchAll();

    if (count($curr) != 1) return NULL;
    return $curr[0]->{'year'};
}

/*
 * Set the given year active/inactive
 */
function setYearActive($year, $active) {
    db_update('maestro_years')
        ->fields(array(
            'active' => $active ? 1 : 0,
            ))
        ->condition('year', $year, '=')
        ->execute();
}

/*
 * Set the given year as archived
 */
function setYearArchived($year) {
    db_update('maestro_years')
        ->fields(array(
            'archived' => 1,
            ))
        ->condition('year', $year, '=')
        ->execute();
}

/*
 * Create a new year
 */
function createNewYear($year) {
    $year_suffix = substr($year, 0, 4).substr($year, 5, 4);
    $stn = 'maestro_signup_student_'.$year_suffix;
    $mtn = 'maestro_signup_mentor_'.$year_suffix;
    db_insert('maestro_years')
        ->fields(array(
            'year'     => $year,
            'active'   => 0,
            'archived' => 0,
            'student_table_name' => $stn,
            'mentor_table_name'  => $mtn,
            ))
        ->execute();
    // Current year
    $currentYear = getYear();
    list($mtn_x, $stn_x) = getParticipantTableNames($currentYear);
    // Create new student table
    db_query("CREATE TABLE $stn SELECT * FROM $stn_x WHERE 1 = 2");
    // Create new mentor table
    db_query("CREATE TABLE $mtn SELECT * FROM $mtn_x WHERE 1 = 2");
}

/*
 * Get all years and information
 */
function getYearsInfo() {
    $values = db_select('maestro_years', 'my')
        ->fields('my')
        ->execute()
        ->fetchAll();

    $result = array();
    foreach ($values as $curr) {
        $cv = array(
            'year'     =>        $curr->{'year'},
            'active'   => (bool) $curr->{'active'},
            'archived' => (bool) $curr->{'archived'},
            );

        array_push($result, $cv);
    }

    return $result;
}

/*
 * Get database table names for signup form
 * Returns list(mentor, student)
 */
function getParticipantTableNames($year) {
    $obj = db_select('maestro_years', 'my')
        ->fields('my')
        ->condition('year', $year, '=')
        ->execute()
        ->fetchObject();

    return array($obj->{'mentor_table_name'}, $obj->{'student_table_name'});
}
