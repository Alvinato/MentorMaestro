<?php

/*
 * Generate attribute scores within a trio
 */
function getAttributeScoreTrio($trio, $weights) {

    $mentor = $trio['mentor'];
    $senior = $trio['senior'];
    $junior = $trio['junior'];

    $max_score = 0.0;
    // calculate max score
    foreach ($weights as $pref_name => $pref_weight) {
        $max_score += $pref_weight;
    }

    $max_score *= 5;

    $from = array($mentor, $senior, $senior, $junior, $junior);
    $to   = array($senior, $mentor, $junior, $senior, $mentor);

    $score = 0.0;
    // calculate actual score
    for ($i = 0; $i < 5; ++$i) {
        $curr_from = $from[$i];
        $curr_to   = $to[$i];
        foreach ($weights as $pref_name => $pref_weight) {
            if (goodMatch($curr_from, $curr_to, $pref_name)) {
                $score[$i][$j] += $pref_weight;
            }
        }
    }

    return $score / $max_score;
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
 */
function goodMatch(&$from, &$to, $name) {
    // TODO add different type of matching e.g. courses
    if ($name == 'gender_pref') {
        // different matching procedure for gender pref
        if ($from[$name] == 'N') return True;
        return $from[$name] == $to['gender'];
    } else {
        // regular matching
        
        // Split string into arrays
        $from_pref = explode(',', $from[$name]);
        $to_pref = explode(',', $to[$name]);

        // If any pair of strings match return true
        for ($i = 0; $i < count($from_pref); ++$i) {
            $from_curr = $from_pref[$i];
            for ($j = 0; $j < count($to_pref); ++$j) {
                $to_curr = $to_pref[$j];
                if (stringMatch($from_curr, $to_curr)) {
                    unset($from_pref);
                    unset($to_pref);
                    return True;
                }
            }
        }
        unset($from_pref);
        unset($to_pref);
        return False;
    }
}

/*
 * Generate attribute scores from a set to a set
 */
function getAttributeScores(&$from, &$to, &$weights) {
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
    $max_multiplier = 1.0;
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
                if (goodMatch($curr_from, $curr_to, $pref_name)) {
                    $score[$i][$j] += $pref_weight;
                }
            }
        }
    }

    // Make each score an array(index, score) for easy sorting
    for ($i = 0; $i < count($score); ++$i) {
        for ($j = 0; $j < count($score[$i]); ++$j) {
            $score[$i][$j] = array($j, $score[$i][$j] * $multiplier[$i][$j]);
        }
    }

    // Return the scores + max score
    return array($score, $max_score * $max_multiplier);
}
