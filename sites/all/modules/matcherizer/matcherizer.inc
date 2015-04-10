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
function match($year, $weighting) {
    list($students, $mentors) = getParticipants($year, $weighting);

    // Split students into junior and senior
    list($juniors, $seniors) = splitStudents($students);

    // Generate mentor/senior attribute scores
    list($sm_attribute, $sm_maxscore) = getAttributeScores($seniors, $mentors, $weighting, FALSE);
    list($ms_attribute, $ms_maxscore) = getAttributeScores($mentors, $seniors, $weighting, TRUE);

    // sort the attributes
    sortAttributes($ms_attribute);

    // generate mentor kickoff availability
    $m_kickoff = array();
    for ($i = 0; $i < count($mentors); ++$i) {
        $m_kickoff[$i] = $mentors[$i]['kickoff'];
    }

    // generate senior kickoff availability
    $s_kickoff = array();
    for ($i = 0; $i < count($seniors); ++$i) {
        $s_kickoff[$i] = $seniors[$i]['kickoff'];
    }

    // Rank mentor/senior based on attribute scores, sorted by senior
    $groups_ms = stableMatch($ms_attribute, $sm_attribute, 'mentor', 'senior', $m_kickoff, $s_kickoff);

    // Generate junior/senior attribute scores
    list($js_attribute, $js_maxscore) = getAttributeScores($juniors, $seniors, $weighting, FALSE);
    list($jm_attribute, $jm_maxscore) = getAttributeScores($juniors, $mentors, $weighting, FALSE);
    list($sj_attribute, $sj_maxscore) = getAttributeScores($seniors, $juniors, $weighting, TRUE);

    // Combine the jm attribute with the js attribute score based on the ms groupings
    foreach ($groups_ms as $i => $curr_group) {
        $m = $curr_group['mentor'];
        $s = $curr_group['senior'];

        for ($i = 0; $i < count($juniors); ++$i) {
            if ($jm_attribute[$i][$m][1]) {
                $js_attribute[$i][$s][1] += $jm_attribute[$i][$m][1];
            }
        }
    }

    // sort the attributes
    sortAttributes($js_attribute);

    // generate junior kickoff availability
    $j_kickoff = array();
    for ($i = 0; $i < count($juniors); ++$i) {
        $j_kickoff[$i] = $juniors[$i]['kickoff'];
    }

    // Rank junior/senior based on attribute scores
    $groups_jsm = stableMatchGroup($js_attribute, $sj_attribute, $groups_ms, $j_kickoff);

    // Get total scores possible
    $max_score = $sm_maxscore + $ms_maxscore + $js_maxscore + $sj_maxscore + $jm_maxscore;

    // Cumulative average
    $total_score = 0;
    $count = 0;

    // Combine the two groups
    $groups = array();

    for ($i = 0; $i < count($groups_ms); ++$i) {

        $kickoff_avail_current = $groups_jsm[$i]['kickoff'];

        $all_not_avail = TRUE;
        foreach ($kickoff_avail_current as $day => $avail) {
            if ($avail) {
                $all_not_avail = FALSE;
                break;
            }
        }

        if ($all_not_avail) continue;

        $curr = array(
            'mentor'     => strval($mentors[$groups_jsm[$i]['mentor']]['id']),
            'senior'     => strval($seniors[$groups_jsm[$i]['senior']]['id']),
            'junior'     => strval($juniors[$groups_jsm[$i]['junior']]['id']),
            'similarity' => strval($groups_jsm[$i]['similarity'] / $max_score),
            'kickoff'    => $kickoff_avail_current,
            );
        array_push($groups, $curr);
        $total_score += $groups_jsm[$i]['similarity'];
        ++$count;
    }

    // Find percentage match
    $percentage = $total_score / $count / $max_score;

    // Store into database
    saveGroups($groups, $year, $percentage, $weighting);

    drupal_set_message('Your matching has been successfully generated and can be viewed with the Visualizer. The matching score is '.(100.0*$percentage).'%.');
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
