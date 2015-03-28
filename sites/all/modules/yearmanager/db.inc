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
