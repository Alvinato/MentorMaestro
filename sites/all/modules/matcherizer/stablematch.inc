<?php

/*
 * Generate stable matching between two sets of people with their ranks
 */
function stableMatch($ab_rank, $ba_rank, $a_name, $b_name) {

    $matched_a = array(); // Last person A proposed to
    $matched_b = array(); // array(who married to, total score of marriage)

    // keys from first array
    $keys_a = array_keys($ab_rank); // List of unmarried A

    for ($i = 0; $i < count($ab_rank); ++$i) {
        $matched_a[$i] = -1;
    }

    while (count($keys_a) != 0) {
        // Randomly select a person in A to match
        $curr_a = array_rand($keys_a);
        $curr_a_ranks = $ab_rank[$curr_a];

        // New highest ranked B
        $highest_b = ++$matched_a[$curr_a];

        // New B: highest ranked person
        $curr_b = $curr_a_ranks[$highest_b][0];
        $curr_ab_score = $curr_a_ranks[$highest_b][1];

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

            // if score of new guy is higher
            if ($curr_ba_score > $old_ba_score) {
                    $matched_b[$curr_b]   = array($curr_a, $curr_ab_score + $curr_ba_score);
                    $keys_a[$b_old_match] = $b_old_match;
                    unset($keys_a[$curr_a]);
            }
        } else {
            // B has not been engaged yet
            // Ranking of current B
            $curr_b_ranks = $ba_rank[$curr_b];

            // Score of new match
            $curr_ba_score = $curr_b_ranks[$curr_a][1];

            // Match the two together
            $matched_b[$curr_b] = array($curr_a, $curr_ab_score + $curr_ba_score);
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
            ));
    }

    return $matches;
}
