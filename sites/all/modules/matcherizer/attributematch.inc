<?php

module_load_include('inc', 'yearmanager', 'db');
module_load_include('inc', 'matcherizer', 'db');
module_load_include('inc', 'matcherizer', 'stablematch');

/*
 * Generate attribute scores within a trio
 */
function getAttributeScoreTrio($trio, $weights) {

    $mentor_id = $trio['mentor'];
    $senior_id = $trio['senior'];
    $junior_id = $trio['junior'];

    $weights = json_decode($weights);

    // Get participants
    $year = getYear();
    list($mentor_table_name, $student_table_name) = getParticipantTableNames($year);

    $mentor = getMentor(
        db_select($mentor_table_name, 'mtn')
            ->fields('mtn')
            ->condition('id', $mentor_id, '=')
            ->execute()
            ->fetchObject(),
        $weights
        );

    $senior = getStudent(
        db_select($student_table_name, 'stn')
            ->fields('stn')
            ->condition('id', $senior_id, '=')
            ->execute()
            ->fetchObject(),
        $weights
        );

    $junior = getStudent(
        db_select($student_table_name, 'stn')
            ->fields('stn')
            ->condition('id', $junior_id, '=')
            ->execute()
            ->fetchObject(),
        $weights
        );

    $from = array($mentor, $senior, $senior, $junior, $junior);
    $to   = array($senior, $mentor, $junior, $senior, $mentor);
    $high = array(TRUE,    FALSE,   TRUE,    FALSE,   FALSE);

    $score = 0.0;
    $max_score = 0.0;
    // calculate actual score
    for ($i = 0; $i < 5; ++$i) {
        $curr_from = $from[$i];
        $curr_to   = $to[$i];
        if (!goodKickoff($curr_from['kickoff'], $curr_to['kickoff'])) {
            continue;
        }
        foreach ($weights as $pref_name => $pref_weight) {
            if (goodMatch($curr_from, $curr_to, $pref_name, $high[$i])) {
                $score += $pref_weight;
            }
            $max_score += $pref_weight;
        }
    }

    return $score / $max_score;
}

/*
 * Returns the kickoff availability of the trio
 */
function getKickoffAvailabilityTrio($trio) {

    $mentor_id = $trio['mentor'];
    $senior_id = $trio['senior'];
    $junior_id = $trio['junior'];

    $weights = json_decode($weights);

    // Get participants
    $year = getYear();
    list($mentor_table_name, $student_table_name) = getParticipantTableNames($year);

    $mentor = getMentor(
        db_select($mentor_table_name, 'mtn')
            ->fields('mtn')
            ->condition('id', $mentor_id, '=')
            ->execute()
            ->fetchObject(),
        $weights
        );

    $senior = getStudent(
        db_select($student_table_name, 'stn')
            ->fields('stn')
            ->condition('id', $senior_id, '=')
            ->execute()
            ->fetchObject(),
        $weights
        );

    $junior = getStudent(
        db_select($student_table_name, 'stn')
            ->fields('stn')
            ->condition('id', $junior_id, '=')
            ->execute()
            ->fetchObject(),
        $weights
        );

    $kickoff_availability = getKickoffAvailability(
        getKickoffAvailability(
            $mentor['kickoff'],
            $senior['kickoff'],
            TRUE
            ),
        $junior['kickoff'],
        FALSE
        );

    return $kickoff_availability;
}

/*
 * Determine whether two strings match
 */
function stringMatch(&$from, &$to) {
    // currently just do a dummy string equality match
    // TODO if there is time, incorporate edit distance?
    return $from == $to;
}

/*
 * Determine whether two people have a good match for this attribute
 * $bigger specifies whether $from is ``higher'' than $to, for birth year matching
 */
function goodMatch(&$from, &$to, $name, $higher) {
    if (array_key_exists($name, $from) && array_key_exists($name, $to)) {
        // TODO add different type of matching e.g. courses
        if ($name == 'gender_pref') {
            // different matching procedure for gender pref
            if ($from[$name] == 'N') return True;
            return $from[$name] == $to['gender'];
        } else if ($name == 'birth_year') {
            // matching birth year
            // if $higher, $from has to be higher year than $to
            return $higher ? $from[$name] >= $to[$name] : $from[$name] <= $to[$name];
        } else {
            // regular matching
            // Split string into arrays
            $from_pref = explode(',', $from[$name]);
            $to_pref = explode(',', $to[$name]);

            // If any pair of strings match return true
            for ($i = 0; $i < count($from_pref); ++$i) {
                $from_curr = trim($from_pref[$i]);
                for ($j = 0; $j < count($to_pref); ++$j) {
                    $to_curr = trim($to_pref[$j]);
                    if (stringMatch($from_curr, $to_curr)) {
                        unset($from_pref);
                        unset($to_pref);
                        return True;
                    }
                }
            }
            unset($from_pref);
            unset($to_pref);
        }
    }
    return False;
}

/*
 * Returns whether the two people can attend the same kickoff night
 * If one person is unable to attend any, return true
 */
function goodKickoff(&$from, &$to) {
    $from_no = TRUE;
    $to_no = TRUE;
    foreach ($from as $date => $from_curr) {
        $to_curr = $to[$date];
        if ($from_curr && $to_curr) return TRUE;
        if ($from_curr) $from_no = FALSE;
        if ($to_curr)   $to_no   = FALSE;
    }
    return $from_no || $to_no;
}

/*
 * Generate attribute scores from a set to a set
 * $bigger specifies whether $from is ``higher'' than $to, for birth year matching
 */
function getAttributeScores(&$from, &$to, &$weights, $higher) {
    // array of scores and multipliers
    $score = array();
    $multiplier = array();

    // Fill array with blank values (0s)
    for ($i = 0; $i < count($from); ++$i) {
        $curr_s = array();
        $curr_m = array();
        for ($j = 0; $j < count($to); ++$j) {
            $curr_s[$j] = 0.0;
            $curr_m[$j] = 1.0;
        }
        $score[$i] = $curr_s;
        $multiplier[$i] = $curr_m;
    }

    $max_score = 0.0;
    // calculate max score
    foreach ($weights as $pref_name => $pref_weight) {
        $max_score += $pref_weight;
    }

    // Match preferences one by one
    for ($i = 0; $i < count($from); ++$i) {
        $curr_from = $from[$i];
        for ($j = 0; $j < count($to); ++$j) {
            $curr_to = $to[$j];
            foreach ($weights as $pref_name => $pref_weight) {
                if (goodMatch($curr_from, $curr_to, $pref_name, $higher)) {
                    $score[$i][$j] += $pref_weight;
                }
            }
        }
    }

    // Match kickoff availabilities as multiplier
    for ($i = 0; $i < count($from); ++$i) {
        $curr_from = $from[$i]['kickoff'];
        for ($j = 0; $j < count($to); ++$j) {
            $curr_to = $to[$j]['kickoff'];
            if (!goodKickoff($curr_from, $curr_to)) {
                $multiplier[$i][$j] = 0.0;
            }
        }
    }

    // Make each score an array(index, score) for easy sorting later
    for ($i = 0; $i < count($score); ++$i) {
        for ($j = 0; $j < count($score[$i]); ++$j) {
            $score[$i][$j] = array($j, $score[$i][$j] * $multiplier[$i][$j]);
        }
    }

    // Return the scores + max score
    return array($score, $max_score);
}
