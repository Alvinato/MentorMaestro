    <html>
<head>
<title>Matcher Prototype</title>
</head>
<body>
<?php

echo "Begin<br />";

error_reporting(E_ALL);

// CONSTANTS
$MALE = 'male';
$FEMALE = 'female';
$SAME = 'same';
$DIFFERENT = 'different';
$IRRELEVANT = 'irrelevant';

function sort_mentors($a, $b) {
    return strcmp($a['name'], $b['name']);
}

function sort_pref_scores($a, $b) {
    return $b[1] - $a[1];
}

function sort_students($a, $b) {
    $yeardiff = $b['courses_taken'] - $a['courses_taken'];
    if ($yeardiff != 0) {
        return $yeardiff;
    }
    return $b['courses_taken'] - $a['courses_taken'];
}

function print_matches($groups) {
    for ($i = 0; $i < count($groups); ++$i) {
        $g = $groups[$i];
        echo 'Group: Mentor = '.$g['mentor']['name'];
        echo '; Senior = '.$g['senior']['name'];
        echo '; Junior = '.$g['junior']['name'].'<br />';
    }
}

function stable_match($prefs_a, $prefs_b, $name_a, $name_b) {
    $matched_a = array(); // Who A has proposed to
    $matched_b = array(); // Whether B is married or not, and to whom

    // keys from first array
    $keys_a = array_keys($prefs_a); // List of unmarried A

    echo "<br />";
    echo "====== PREFS A ======<br />";
    var_dump($prefs_a);
    echo "<br />";
    echo "====== PREFS B ======<br />";
    var_dump($prefs_b);
    echo "<br />";
    //echo "====== KEYS A ======<br />";

    // TODO: Different number for a, b in size
    while (count($keys_a) != 0) {
        //var_dump($keys_a);
        //echo "<br />";
        $curr_key = array_rand($keys_a);
        $curr_prefs = $prefs_a[$curr_key];
        if (!array_key_exists($curr_key, $matched_a)) {
            $matched_a[$curr_key] = array();
        }
        for ($i = 0; $i < count($curr_prefs); ++$i) {
            if (array_key_exists($i, $matched_a[$curr_prefs])) {
                // A has already proposed to B
                continue;
            }
            $matched_a[$curr_key][$i] = True;
            if (array_key_exists($i, $matched_b)) {
                // already engaged

                // B's current "match"
                $b_curr_match = $matched_b[$i];

                $switch_match = False;
                // find who B prefers
                for ($j = 0; $j < count($prefs_b[$i]); ++$j) {
                    $b_curr_pref = $prefs_b[$i][$j];
                    if ($b_curr_pref == $curr_key) {
                        $switch_match = True;
                        $matched_b[$i] = $curr_key;
                        $keys_a[$b_curr_match] = $b_curr_match;
                        unset($keys_a[$curr_key]);
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
                $matched_b[$i] = $curr_key;
                unset($keys_a[$curr_key]);
                break;
            }
        }
    }

    echo "<br />";
    echo "====== MATCHES A ======<br />";
    var_dump($matched_a);
    echo "<br />";
    echo "====== MATCHES B ======<br />";
    var_dump($matched_b);
    echo "<br />";

    // Do the matches
    $matches = array();

    for ($i = 0; $i < count($matched_b); ++$i) {
        array_push($matches, array(
            $name_a => $matched_b[$i],
            $name_b => $i
            ));
    }
    echo "====== MATCHES IN STABLE MARRIAGE ======<br />";
    var_dump($matches);
    echo "<br />";

    return $matches;
}

function good_match($from, $to, $pref) {
    $from_pref = $from['prefs'][$pref];
    $to_pref = $to['prefs'][$pref];
    for ($i = 0; $i < count($from_pref); ++$i) {
        $from_curr = $from_pref[$i];
        for ($j = 0; $j < count($to_pref); ++$j) {
            $to_curr = $to_pref[$j];
            //echo $from_curr.'---'.$to_curr.'<br />';
            if ($from_curr == $to_curr) {
                //echo 'YAY<br />';
                return True;
            }
        }
    }
    return False;
}

function preference_score($from, $to, $prefs, $weights) {
    global $MALE, $FEMALE, $SAME, $DIFFERENT, $IRRELEVANT;

    $score = array();
    $multiplier = array();

    // Fill arrays
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

    // Parse kickoff night availability
    // TODO

    // Match gender preference
    for ($i = 0; $i < count($from); ++$i) {
        $curr_gender = $from[$i]['gender'];
        $curr_gender_pref = $from[$i]['gender_preference'];
        for ($j = 0; $j < count($to); ++$j) {
            if ($SAME == $curr_gender_pref) {
                if ($to[$j]['gender'] == $curr_gender) {
                    $score[$i][$j] += $weights['gender_preference'];
                }
            } else if ($DIFFERENT == $curr_gender_pref) {
                if ($to[$j]['gender'] != $curr_gender) {
                    $score[$i][$j] += $weights['gender_preference'];
                }
            } else {
                // IRRELEVANT
                $score[$i][$j] += $weights['gender_preference'];
            }
        }
    }

    // Match each pref string array
    for ($i = 0; $i < count($prefs); ++$i) {
        $pref_name = $prefs[$i];
        $pref_weight = $weights[$pref_name];
        for ($j = 0; $j < count($from); ++$j) {
            $curr_from = $from[$j];
            for ($k = 0; $k < count($to); ++$k) {
                $curr_to = $to[$k];
                if (good_match($curr_from, $curr_to, $pref_name)) {
                    $score[$j][$k] += $pref_weight;
                }
            }
        }
    }

    // Make each score an array(index, score) for easy sorting
    for ($i = 0; $i < count($score); ++$i) {
        for ($j = 0; $j < count($score[$i]); ++$j) {
            $score[$i][$j] = array($j, $score[$i][$j] * $multiplier[$i][$j]);
        }
        usort($score[$i], sort_pref_scores);
    }

    return $score;
}

function match_group_senior(&$students, &$mentors, $prefs, $weights) {

    $students_size = count($students);
    $mentors_size = count($mentors);
    $size = min($students_size, $mentors_size);

    // Generate preference scores
    $prefs_sm = preference_score($students, $mentors, $prefs, $weights);
    $prefs_ms = preference_score($mentors, $students, $prefs, $weights);

    echo "<br />";
    echo "====== PREF SCORES: STUDENT PREFER MENTOR ======<br />";
    var_dump($prefs_sm);
    echo "<br />";

    echo "<br />";
    echo "====== PREF SCORES: MENTOR PREFER STUDENT ======<br />";
    var_dump($prefs_ms);
    echo "<br />";

    // Put student preference of mentors into alternate array form
    $spm = array();
    for ($i = 0; $i < count($prefs_sm); ++$i) {
        $curr = array();
        for ($j = 0; $j < count($prefs_sm[$i]); ++$j) {
            array_push($curr, $prefs_sm[$i][$j][0]);
        }
        array_push($spm, $curr);
    }

    echo "====== ORDERING OF STUDENT PREFER MENTOR ======<br />";
    var_dump($spm);
    echo "<br />";

    // Same for mentor preference of students
    $mps = array();
    for ($i = 0; $i < count($prefs_ms); ++$i) {
        $curr = array();
        for ($j = 0; $j < count($prefs_ms[$i]); ++$j) {
            array_push($curr, $prefs_ms[$i][$j][0]);
        }
        array_push($mps, $curr);
    }

    echo "====== ORDERING OF MENTOR PREFER STUDENT ======<br />";
    var_dump($mps);
    echo "<br />";

    // Stable match
    $matches = stable_match($spm, $mps, 'senior', 'mentor');

        echo '<br />';
        var_dump($students);
        echo '<br />';

    $groups = array();
    for ($i = 0; $i < count($matches); ++$i) {
        $men_index = $matches[$i]['mentor'];
        $sen_index = $matches[$i]['senior'];
        $curr = array(
            'mentor' => $mentors[$men_index],
            'senior' => $students[$sen_index]
            );
        array_push($groups, $curr);
        unset($students[$sen_index]);
        unset($mentors[$men_index]);
    }

    $students = array_values($students);
    $mentors = array_values($mentors);

    return $groups;
}

function generate_matches_all($students, $mentors, $prefs, $weights) {
    global $MALE, $FEMALE, $SAME, $DIFFERENT, $IRRELEVANT;

    usort($mentors, sort_mentors);
    usort($students, sort_students);
    $jun_students = array();
    $sen_students = array();

    // Separate junior and senior students
    for ($i = 0; $i < count($students) / 2; ++$i) {
        array_push($sen_students, $students[$i]);
    }
    for ($i = count($students); $i < count($students); ++$i) {
        array_push($jun_students, $students[$i]);
    }

    echo "<br />";
    echo "====== ALL SENIOR STUDENTS ======<br />";
    var_dump($sen_students);
    echo "<br />";

    // Match remaining students
    $all_matches = match_group_senior($sen_students, $mentors, $prefs, $weights);

    echo "<br />";
    echo "====== ALL MATCHES ======<br />";
    print_matches($all_matches);
    echo "<br />";
    echo "====== ALL UNMATCHED SENIOR STUDENTS ======<br />";
    var_dump($sen_students);
    echo "<br />";
    echo "====== ALL UNMATCHED MENTORS ======<br />";
    var_dump($mentors);
    echo "<br />";

    return $all_matches;

}

// Define test mentors
$smith = array(
    'name' => 'Smith',
    'gender' => $MALE,
    'gender_preference' => $SAME,
    'kickoff_availability' => array(1, 1, 0),
    'prefs' => array('cs_interests' => array('games', 'graphics'
                            ))
    );
$sandy = array(
    'name' => 'Sandy',
    'gender' => $FEMALE,
    'gender_preference' => $SAME,
    'kickoff_availability' => array(1, 1, 1),
    'prefs' => array('cs_interests' => array('games', 'big data', 'C++'
                            ))
    );
$samuel = array(
    'name' => 'Samuel',
    'gender' => $MALE,
    'gender_preference' => $IRRELEVANT,
    'kickoff_availability' => array(0, 1, 1),
    'prefs' => array('cs_interests' => array('databases', 'AI'
                            ))
    );

$mentors = array(
    $smith,
    $sandy,
    $samuel
    );

// Define test students
$john = array(
    'name' => 'John',
    'gender' => $MALE,
    'gender_preference' => $IRRELEVANT,
    'kickoff_availability' => array(1, 1, 1),
    'prefs' => array('cs_interests' => array('games', 'C++'
                            )),
    'year' => 2,
    'courses_taken' => 3
    );
$jane = array(
    'name' => 'Jane',
    'gender' => $FEMALE,
    'gender_preference' => $SAME,
    'kickoff_availability' => array(),
    'prefs' => array('cs_interests' => array('AI', 'graphics'
                            )),
    'year' => 3,
    'courses_taken' => 4
    );
$alice = array(
    'name' => 'Alice',
    'gender' => $FEMALE,
    'gender_preference' => $DIFFERENT,
    'kickoff_availability' => array(),
    'prefs' => array('cs_interests' => array('AI', 'databases'
                            )),
    'year' => 4,
    'courses_taken' => 6
    );
$bob = array(
    'name' => 'Bob',
    'gender' => $MALE,
    'gender_preference' => $IRRELEVANT,
    'kickoff_availability' => array(),
    'prefs' => array('cs_interests' => array('software engineering'
                            )),
    'year' => 3,
    'courses_taken' => 6
    );
$yvelle = array(
    'name' => 'Yvelle',
    'gender' => $FEMALE,
    'gender_preference' => $SAME,
    'kickoff_availability' => array(),
    'prefs' => array('cs_interests' => array('vision', 'graphics'
                            )),
    'year' => 4,
    'courses_taken' => 11
    );
$zander = array(
    'name' => 'Zander',
    'gender' => $MALE,
    'gender_preference' => $IRRELEVANT,
    'kickoff_availability' => array(),
    'prefs' => array('cs_interests' => array('internet', 'networking'
                            )),
    'year' => 1,
    'courses_taken' => 1
    );

$students = array(
    $alice,
    $bob,
    $jane,
    $john,
    $yvelle,
    $zander
    );

$prefs = array('cs_interests');

$weights = array(
    'cs_interests' => 1.0,
    'gender_preference' => 1.0
    );

$allMatches = generate_matches_all($students, $mentors, $prefs, $weights);

echo "<br /><br />End<br />";

?>
Finished processing PHP file.
</body>
</html>