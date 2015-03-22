<?php

/*
 * Generate stable matching between two sets of people with their ranks
 */
function stableMatch($ab_rank, $ba_rank, $a_name, $b_name) {

    $matched_a = array(); // Who A has proposed to
    $matched_b = array(); // Whether B is married or not, and to whom; also what is the score

    // keys from first array
    $keys_a = array_keys($ab_rank); // List of unmarried A

    while (count($keys_a) != 0) {
        // Randomly select a person in A to match
        $curr_a = array_rand($keys_a);
        $curr_a_ranks = $ab_rank[$curr_a];

        if (!array_key_exists($curr_a, $matched_a)) {
            $matched_a[$curr_a] = array();
        }

        for ($i = 0; $i < count($curr_a_ranks); ++$i) {
            $curr_b = $curr_a_ranks[$i][0];
            $curr_ab_score = $curr_a_ranks[$i][1];
            if (array_key_exists($curr_b, $matched_a[$curr_a])) {
                // A has already proposed to B
                continue;
            }
            $matched_a[$curr_a][$curr_b] = True;
            if (array_key_exists($curr_b, $matched_b)) {
                // already engaged
                // B's current "match"
                $b_curr_match = $matched_b[$curr_b][0];

                $switch_match = False;
                // find who B prefers
                $curr_b_ranks = $ba_rank[$curr_b];
                for ($j = 0; $j < count($curr_b_ranks); ++$j) {
                    $b_curr_pref = $curr_b_ranks[$j][0];
                    $curr_ba_score = $curr_b_ranks[$j][1];
                    if ($b_curr_pref == $curr_a) {
                        $switch_match = True;
                        $matched_b[$curr_b] = array($curr_a, $curr_ab_score + $curr_ba_score);
                        $keys_a[$b_curr_match] = $b_curr_match;
                        unset($keys_a[$curr_a]);
                        break;
                    } else if ($b_curr_pref == $b_curr_match) {
                        break;
                    }
                }
                if ($switch_match) {
                    break;
                } else {
                    continue;
                }
            } else {
                // free
                // find how much b prefers a
                $curr_b_ranks = $ba_rank[$curr_b];
                for ($j = 0; $j < count($curr_b_ranks); ++$j) {
                    if ($curr_a == $curr_b_ranks[$j][0]) {
                        // set preference
                        $curr_ba_score = $curr_b_ranks[$j][1];
                        $matched_b[$curr_b] = array($curr_a, $curr_ab_score + $curr_ba_score);
                        unset($keys_a[$curr_a]);
                        break;
                    }
                }
                break;
            }
        }
    }

    // Build the actual matches
    $matches = array();

    for ($i = 0; $i < count($matched_b); ++$i) {
        array_push($matches, array(
            $a_name => $matched_b[$i][0],
            $b_name => $i,
            'similarity' => $matched_b[$i][1],
            ));
    }

    return $matches;
}
