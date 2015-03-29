<?php

/*
 * Returns whether the two people can attend the same kickoff night
 * If one person is unable to attend any, return true
 */
function getKickoffAvailability($from, $to, $allowZeroes) {
    $from_no = TRUE;
    $to_no = TRUE;
    $availability = array();
    foreach ($from as $date => $from_curr) {
        $to_curr = $to[$date];
        $availability[$date] = ($from_curr && $to_curr) ? 1 : 0;
        if ($from_curr) $from_no = FALSE;
        if ($to_curr)   $to_no   = FALSE;
    }
    if ($allowZeroes) {
        if ($from_no) $availability = $to;
        if ($to_no)   $availability = $from;
    }
    return $availability;
}

/*
 * Generate stable matching between two sets of people with their ranks
 */
function stableMatch($ab_rank, $ba_rank, $a_name, $b_name, $a_kickoff, $b_kickoff) {

    $matched_a = array(); // Last person A proposed to
    $matched_b = array(); // array(who married to, total score of marriage, kickoff availability)

    // keys from first array
    $keys_a = array_keys($ab_rank); // List of unmarried A

    for ($i = 0; $i < count($ab_rank); ++$i) {
        $matched_a[$i] = -1;
    }

    while (count($keys_a) != 0) {
        // Randomly select a person in A to match
        $curr_a = array_rand($keys_a);
        $curr_a_ranks = $ab_rank[$curr_a];
        $curr_a_kickoff = $a_kickoff[$curr_a];

        // New highest ranked B
        $highest_b = ++$matched_a[$curr_a];

        // New B: highest ranked person
        $curr_b = $curr_a_ranks[$highest_b][0];
        $curr_ab_score = $curr_a_ranks[$highest_b][1];
        $curr_b_kickoff = $b_kickoff[$curr_b];

        if (array_key_exists($curr_b, $matched_b)) {
            // B is already engaged
            // Ranking of current B
            $curr_b_ranks = $ba_rank[$curr_b];

            // B's current "match"
            $b_old_match = $matched_b[$curr_b][0];

            // Score of old match
            $old_ba_score = $curr_b_ranks[$b_old_match][1];

            // Score of new match
            $curr_ba_score = $curr_b_ranks[$curr_a][1];

            // Kickoff availability of the new match
            $kickoff_availability = getKickoffAvailability($curr_a_kickoff, $curr_b_kickoff, TRUE);

            // if score of new guy is higher
            if ($curr_ba_score > $old_ba_score) {
                    $matched_b[$curr_b]   = array($curr_a, $curr_ab_score + $curr_ba_score, $kickoff_availability);
                    $keys_a[$b_old_match] = $b_old_match;
                    unset($keys_a[$curr_a]);
            }
        } else {
            // B has not been engaged yet
            // Ranking of current B
            $curr_b_ranks = $ba_rank[$curr_b];

            // Score of new match
            $curr_ba_score = $curr_b_ranks[$curr_a][1];

            // Kickoff availability of the new match
            $kickoff_availability = getKickoffAvailability($curr_a_kickoff, $curr_b_kickoff, TRUE);

            // Match the two together
            $matched_b[$curr_b] = array($curr_a, $curr_ab_score + $curr_ba_score, $kickoff_availability);
            unset($keys_a[$curr_a]);
        }
    }

    // Build the actual matches
    $matches = array();

    for ($i = 0; $i < count($matched_b); ++$i) {
        array_push($matches, array(
            $a_name      => $matched_b[$i][0],
            $b_name      => $i,
            'similarity' => $matched_b[$i][1],
            'kickoff'    => $matched_b[$i][2],
            ));
    }

    return $matches;
}

/*
 * Generate stable matching between junior and the mentor/senior group
 * Groups is sorted by senior
 */
function stableMatchGroup($jg_rank, $gj_rank, $groups, $j_kickoff) {

    $matched_j = array(); // Last person A proposed to
    $matched_g = array(); // array(who married to, total score of marriage, kickoff availability)

    // keys from first array
    $keys_a = array_keys($jg_rank); // List of unmarried J

    for ($i = 0; $i < count($jg_rank); ++$i) {
        $matched_j[$i] = -1;
    }

    while (count($keys_a) != 0) {
        // Randomly select a person in J to match
        $curr_j = array_rand($keys_a);
        $curr_j_ranks = $jg_rank[$curr_j];
        $curr_j_kickoff = $j_kickoff[$curr_j];

        // New highest ranked G
        $highest_g = ++$matched_j[$curr_j];

        // New G: highest ranked person
        $curr_g = $curr_j_ranks[$highest_g][0];
        $curr_jg_score = $curr_j_ranks[$highest_g][1];
        $curr_g_kickoff = $groups[$curr_g]['kickoff'];

        if (array_key_exists($curr_g, $matched_g)) {
            // G is already engaged
            // Ranking of current G
            $curr_g_ranks = $gj_rank[$curr_g];

            // G's current "match"
            $b_old_match = $matched_g[$curr_g][0];

            // Score of old match
            $old_gj_score = $curr_g_ranks[$b_old_match][1];

            // Score of new match
            $curr_gj_score = $curr_g_ranks[$curr_j][1];

            // Kickoff availability of the new match
            $kickoff_availability = getKickoffAvailability($curr_j_kickoff, $curr_g_kickoff, FALSE);

            // if score of new guy is higher
            if ($curr_gj_score > $old_gj_score) {
                    $matched_g[$curr_g]   = array($curr_j, $curr_jg_score + $curr_gj_score, $kickoff_availability);
                    $keys_a[$b_old_match] = $b_old_match;
                    unset($keys_a[$curr_j]);
            }
        } else {
            // G has not been engaged yet
            // Ranking of current G
            $curr_g_ranks = $gj_rank[$curr_g];

            // Score of new match
            $curr_gj_score = $curr_g_ranks[$curr_j][1];

            // Kickoff availability of the new match
            $kickoff_availability = getKickoffAvailability($curr_j_kickoff, $curr_g_kickoff, FALSE);

            // Match the two together
            $matched_g[$curr_g] = array($curr_j, $curr_jg_score + $curr_gj_score, $kickoff_availability);
            unset($keys_a[$curr_j]);
        }
    }

    // Build the actual matches
    $matches = array();

    for ($i = 0; $i < count($matched_g); ++$i) {
        array_push($matches, array(
            'junior'     => $matched_g[$i][0],
            'senior'     => $groups[$i]['senior'],
            'mentor'     => $groups[$i]['mentor'],
            'similarity' => $matched_g[$i][1],
            'kickoff'    => $matched_g[$i][2],
            ));
    }

    return $matches;
}
