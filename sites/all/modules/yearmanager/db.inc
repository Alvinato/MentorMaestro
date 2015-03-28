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

/* Get database table names
 * Returns list(mentor, student)
 */
function getDatabaseTableNames($year) {
    $obj = db_select('maestro_years', 'my')
        ->fields('my')
        ->condition('year', $year, '=')
        ->execute()
        ->fetchObject();

    return array($obj->{'mentor_table_name'}, $obj->{'student_table_name'});
}
