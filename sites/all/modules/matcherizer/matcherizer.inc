<?php

module_load_include('inc', 'matcherizer', 'attributematch');
module_load_include('inc', 'matcherizer', 'stablematch');
module_load_include('inc', 'matcherizer', 'db');
module_load_include('inc', 'yearmanager', 'db');

/*
 * Comparator function to sort attribute scores
 */
function sortAttributeComp($a, $b) {
    return $b[1] - $a[1];
}

/*
 * Sort the attributes
 */
function sortAttributes(&$attr) {
    for ($i = 0; $i < count($attr); ++$i) {
        usort($attr[$i], 'sortAttributeComp');
    }
}

/*
 * Generates matches from the database entry
 */
function match($year, $weighting, $nickname) {
    list($students, $mentors) = getParticipants($year, $weighting);

    // Split students into junior and senior
    list($juniors, $seniors) = splitStudents($students);

    // Generate mentor/senior attribute scores
    list($sm_attribute, $sm_maxscore) = getAttributeScores($seniors, $mentors, $weighting);
    list($ms_attribute, $ms_maxscore) = getAttributeScores($mentors, $seniors, $weighting);

    // sort the attributes
    sortAttributes($ms_attribute);

    // Rank mentor/senior based on attribute scores, sorted by senior
    $groups_ms = stableMatch($ms_attribute, $sm_attribute, 'mentor', 'senior');

    // Generate junior/senior attribute scores
    list($js_attribute, $js_maxscore) = getAttributeScores($juniors, $seniors, $weighting);
    list($jm_attribute, $jm_maxscore) = getAttributeScores($juniors, $mentors, $weighting);
    list($sj_attribute, $sj_maxscore) = getAttributeScores($seniors, $juniors, $weighting);

    // Combine the jm attribute with the js attribute score based on the ms groupings
    foreach ($groups_ms as $i => $curr_group) {
        $m = $curr_group['mentor'];
        $s = $curr_group['senior'];
        for ($i = 0; $i < count($juniors); ++$i) {
            $js_attribute[$i][$s][1] += $jm_attribute[$i][$m][1];
        }
    }

    // sort the attributes
    sortAttributes($js_attribute);

    // Rank junior/senior based on attribute scores, sorted by senior
    $groups_js = stableMatch($js_attribute, $sj_attribute, 'junior', 'senior');

    // Get total scores possible
    $max_score = $sm_maxscore + $ms_maxscore + $js_maxscore + $sj_maxscore + $jm_maxscore;

    // Cumulative average
    $total_score = 0;
    $count = 0;

    // Combine the two groups
    $groups = array();

    for ($i = 0; $i < count($groups_ms); ++$i) {
        $rand_a = 0; $rand_b = 0; $rand_c = 0;
        while ($rand_a == 0 && $rand_b == 0 && $rand_c == 0) {
            $rand_a = rand(0, 1);
            $rand_b = rand(0, 1);
            $rand_c = rand(0, 1);
        }

        $curr = array(
            'mentor' => strval($mentors[$groups_ms[$i]['mentor']]['id']),
            'senior' => strval($seniors[$groups_ms[$i]['senior']]['id']),
            'junior' => strval($juniors[$groups_js[$i]['junior']]['id']),
            'similarity' => strval(($groups_js[$i]['similarity'] + $groups_ms[$i]['similarity']) / $max_score),
            'kickoff' => array('1' => $rand_a, '2' => $rand_b, '3' => $rand_c),
            );
        array_push($groups, $curr);
        $total_score += ($groups_js[$i]['similarity'] + $groups_ms[$i]['similarity']);
        ++$count;
    }

    // Find percentage match
    $percentage = $total_score / $count / $max_score;

    // Store into database
    saveGroups($groups, $year, $percentage, $weighting, $nickname);
}

/*
 * Splits students into junior and senior
 */
function splitStudents(&$students) {
    usort($students, "sortStudents");

    $junior = array();
    $senior = array();

    $total_students = count($students);

    for ($i = 0; $i < ($total_students / 2); ++$i) {
        array_push($senior, $students[$i]);
    }

    for ($i = ($total_students / 2); $i < $total_students; ++$i) {
        array_push($junior, $students[$i]);
    }

    return array($junior, $senior);
}

/*
 * Sorting function for above
 */
function sortStudents($a, $b) {
    $a_year = $a['year'];
    $b_year = $b['year'];
    if ($a_year > 2) --$a_year;
    if ($b_year > 2) --$b_year;

    $yeardiff = $b_year - $a_year;
    if ($yeardiff != 0) {
        return $yeardiff;
    }
    $courses_diff = $b['num_courses'] - $a['num_courses'];
    if ($courses_diff != 0) {
        return $courses_diff;
    }

    return $b['year'] - $a['year'];
}
