<?php

define('DRUPAL_ROOT', getcwd());
require_once DRUPAL_ROOT . '/includes/bootstrap.inc';
require_once DRUPAL_ROOT . '/includes/common.inc';
require_once DRUPAL_ROOT . '/includes/module.inc';
require_once DRUPAL_ROOT . '/includes/unicode.inc';
require_once DRUPAL_ROOT . '/includes/file.inc';
module_load_include('inc', 'matcherizer', 'attributematch');
module_load_include('inc', 'yearmanager', 'db');
drupal_bootstrap(DRUPAL_BOOTSTRAP_DATABASE);

include 'ChromePhp.php';

// Chromephp::log("this file is getting run right now!!");
header('Content-Type: application/json');
$aResult = array();
if (!isset($_POST['functionname'])) {
    // Chromephp::log(" no function arguments name");
    $aResult['error'] = 'No function name!';
}

if (!isset($_POST['arguments'])) {
    // Chromephp::log("no function arguments");
    $aResult['error'] = 'No function arguments!';
}

if (!isset($aResult['error'])) {
    // Chromephp::log(" there was no error");
    // Chromephp::log(($_POST['arguments']));
    switch ($_POST['functionname']) {
    case 'add':
        if (is_array($_POST['arguments'])) {
            // Chromephp::log("there was an error in arguments");
            $aResult['error'] = 'Error in arguments!';
        }
        else {
            // Chromephp::log("the function is getting called");
            // Chromephp::log(floatval($_POST['arguments'][0]));
            // $aResult['result'] = add(floatval($_POST['arguments'][0]), floatval($_POST['arguments'][1]));  // this is where it gets called.
            $aResult['result'] = add($_POST['arguments']); // just send the entire array through...
        }
        break;

    case 'save':
        if (is_array($_POST['arguments'])) {
            $aResult['error'] = 'Error in arguments!';
        }
        else {
            $aResult['result'] = save($_POST['arguments']); // call save instead of add
        }
        break;

    default:
        $aResult['error'] = 'Not found function ' . $_POST['functionname'] . '!';
        break;
    }
}
echo json_encode($aResult);
// this function renames all the groups because they are screwed up...
// this function also gets rid of any nulls within the json string.
function json_fixer($args)
{
    /*Chromephp::log("before getting rid of the nulls");
    Chromephp::log($args);
    Chromephp::log(array_filter($args));
    Chromephp::log($args);
    /*if (($key = array_search('null', $args)) !== false) {
    unset($args[$key]);
    }
    Chromephp::log("json fixer is getting called");
    Chromephp::log($args);*/
    // first get rid of the nulls...
    /*for ($g = 0; $g < count($args->children); $g++){  // go through the json file and search up the correct index.
    // go thorugh every gorup
    $group = $args->children[$g];  // this is going to be the current group...
    for($r = 0; $r < count($group->children); $r++){
    // this is giong through every single person.. check for nulls...
    $group1 = $group->children[$r];
    Chromephp::log($group1);
    if (is_null($group1)){
    // then we have to get rid of this group...
    }
    }*/
    // }
}
// this function updates the json file when there is any movement inside the javascript
// we need it to recalculate the weights and output them onto the screen...
// arguments1 is the json file that is sent from javascript...
function add($arguments1)
{
    // Chromephp::log("inside the add function");
    $decoded = json_decode($arguments1);
    // Chromephp::log($decoded);  // lets save the weighting for this particular trio...
    // Chromephp::log("add is running");
    // loop through this...
    for ($g = 0; $g < count($decoded->children); $g++) {
        $current_group = $decoded->children[$g];
        //  Chromephp::log("inside the first loop");
        //  Chromephp::log($current_group);
        // check if the size is three...
        $MENTOR_INDEX = - 1; // holds the index that we are going to get...
        $SENIOR_INDEX = - 1;
        $JUNIOR_INDEX = - 1;
        $applicant_senior;
        $applicant_mentor;
        $applicant_junior;
        if (count($current_group->children) != 3) {
            // WE NEED TO DELETE ALL ATTRIBUTES IN THIS CONDITION HERE...
            for ($r = 0; $r < count($current_group->children); $r++) {
                $applicant = $current_group->children[$r];
                $applicant_name = $applicant->name;
                $applicant_familyname = $applicant->familyname;
                $applicant_weighting = $applicant->weighting;
                // go through the loop again...
                // Chromephp::log("inside the second condition loop");
                // Chromephp::log($applicant);
                // lets delete an attribute in the array...
                // Chromephp::log($applicant_weighting);
                $applicant->weighting = null; // change the weighting...
                $applicant->{"weighting"} = null;
                // Chromephp::log("this is changing it to null");
                // Chromephp::log($applicant->weighting);
            }
            continue;
        }
        // lets go through every single one now..
        for ($r = 0; $r < count($current_group->children); $r++) {
            // Chromephp::log("inside teh second loop");
            $applicant = $current_group->children[$r];
            $applicant_name = $applicant->name;
            $applicant_familyname = $applicant->familyname;
            // we need to push something to this array.
            // now we need to call his function...
            $applicant_position = $applicant->position;
            $mentor = "Mentor";
            //   Chromephp::log("before the first loop...");
            if ($applicant_position == $mentor) {
                //     Chromephp::log("we found a mentor");
                $applicant_mentor = $applicant; // set the mentor object...
                $MENTOR_INDEX = traverser($applicant_name, $applicant_familyname, "mentor");
            }
            $junior = "Junior";
            if ($applicant_position == $junior) {
                $applicant_junior = $applicant; // set the junior
                $JUNIOR_INDEX = traverser($applicant_name, $applicant_familyname, "junior");
            }
            $senior = "Senior";
            if ($applicant_position == $senior) {
                $applicant_senior = $applicant; // set the senior object...
                $SENIOR_INDEX = traverser($applicant_name, $applicant_familyname, "senior");
            }
        }
        if ($MENTOR_INDEX == - 1 || $JUNIOR_INDEX == - 1 || $SENIOR_INDEX == - 1) {
            // WE NEED TO DELETE ALL ATTRIBUTES IN THIS CONDITION HERE...
            for ($r = 0; $r < count($current_group->children); $r++) {
                $applicant = $current_group->children[$r];
                $applicant_name = $applicant->name;
                $applicant_familyname = $applicant->familyname;
                $applicant_weighting = $applicant->weighting;
                // go through the loop again...
                //   Chromephp::log("inside the second condition loop");
                //  Chromephp::log($applicant);
                // lets delete an attribute in the array...
                //  Chromephp::log($applicant_weighting);
                // $applicant->weighting = null;   // change the weighting...
                $applicant->{"weighting"} = null;
                // Chromephp::log("this is changing it to null");
                // Chromephp::log($applicant_weighting);
            }
            continue;
        }
        $trio = array(
            'mentor' => $MENTOR_INDEX,
            'senior' => $SENIOR_INDEX,
            'junior' => $JUNIOR_INDEX
        );
        // the weights are no longer hardcoded...
        // $weights = '{"gender_pref":"2","cs_interests":"3","hobbies_interests":"5","birth_year":"7","program":"11","career":"13"}';
        // just grab from the weightings.json file.
        $file = "weightings.json";
        $theactualweightings = file_get_contents($file); // gets the json file.
        Chromephp::log($theactualweightings); // this is going to be the weightings fetched from the json file.
        $percentage1 = getAttributeScoreTrio($trio, $theactualweightings);
        //     Chromephp::log("this is the percentage found:  ". $percentage1);
        $applicant_senior->{'weighting'} = $percentage1;
        $applicant_mentor->{'weighting'} = $percentage1;
        $applicant_junior->{'weighting'} = $percentage1;
        /*Chromephp::log($applicant_senior);
        Chromephp::log($applicant_mentor);
        Chromephp::log($applicant_junior);*/
    }
    // Chromephp::log("the loop finished");
    // we alter the json file before sending it in
    // Chromephp::log("outside the important part here");
    // Chromephp::log($decoded);
    $encode = json_encode($decoded);
    $file = 'TESTING.json';
    file_put_contents($file, $encode);
    $overrall_percentage = 0;
    $elements = 0;
    // TODO!!
    // right here we are going to calculate the overrall score and return...
    for ($g = 0; $g < count($decoded->children); $g++) {
        $current_group = $decoded->children[$g];
        for ($r = 0; $r < count($current_group->children); $r++) {
            $applicant = $current_group->children[$r];
            $applicant_name = $applicant->name;
            $applicant_familyname = $applicant->familyname;
            $applicant_weighting = $applicant->weighting;
            // Chromephp::log("the calculator function!!");
            // Chromephp::log("tthe weighting");
            // Chromephp::log($applicant);
            // Chromephp::log($applicant->{"weighting"});
            // Chromephp::log($applicant_weighting);
            if (!is_null($applicant_weighting)) {
                // if its not null then keep summing it...
                $overrall_percentage = $overrall_percentage + $applicant_weighting;
                $elements++;
            }
        }
    }
    // Chromephp::log("this is the overrall percentage");
    // Chromephp::log($overrall_percentage);
    $overrall_percentage = $overrall_percentage / $elements;
    // Chromephp::log($overrall_percentage);
    return $overrall_percentage;
}
// function saves the json file into the database.
// we need a checker in the start that says whether or not we can save because some groups are not trios...
function save($arguments1)
{
    $decoded = json_decode($arguments1); // takes in the json file
    // right here we are going to calculate the overrall score and return...
    // this code here will save to the kickoff db...
    // Chromephp::log(substr($decoded->type, 0, 0));
    // Chromephp::log(substr($decoded->type, 0, 7));
    // Chromephp::log(substr($decoded->type, 7, 8));
    if (substr($decoded->type, 0, 7) == "kickoff") {
        // holds the list of numbers...
        $myArray1 = array();
        for ($g = 0; $g < count($decoded->children); $g++) { // go through the json file and search up the correct index.
            $current_group = $decoded->children[$g]; // this is the current group that we are searching
            $mentor_id = array();
            $senior_id = array();
            $junior_id = array();
            for ($r = 0; $r < count($current_group->children); $r++) {
                //  Chromephp::log($current_group->children[$r]);
                $applicant = $current_group->children[$r];
                $applicant_name = $applicant->name;
                $applicant_familyname = $applicant->familyname;
                $applicant_position = $applicant->position;
                $mentor = 'Mentor';
                if ($applicant_position == $mentor) {
                    //   Chromephp::log("found a mentor");
                    array_push($mentor_id, traverser($applicant_name, $applicant_familyname, "mentor"));
                    //   Chromephp::log($mentor_id);
                }
                $junior = "Junior";
                if ($applicant_position == $junior) {
                    // Chromephp::log("found a junior");
                    array_push($junior_id, traverser($applicant_name, $applicant_familyname, "student"));
                    //  Chromephp::log($junior_id);
                }
                $senior = "Senior";
                if ($applicant_position == $senior) {
                    // Chromephp::log("found a senior");
                    array_push($senior_id, traverser($applicant_name, $applicant_familyname, "student"));
                    // Chromephp::log($senior_id);
                }
            }
            // this is one group...
            $myArray = array(
                'mentor' => $mentor_id,
                'senior' => $senior_id,
                'junior' => $junior_id,
            );
            array_push($myArray1, $myArray);
        }
        // Chromephp::log($myArray1);
        // loop through and check...
        // Chromephp::log("hello");
        // Chromephp::log($senior_id);
        // array_push($thearray, $myArray); // push the array...
        $encode = json_encode($myArray1);
        // Chromephp::log($encode);
        /*$query = "INSERT INTO TESTING.maestro_matched_kickoff_groups (timestamp, mentoring_year, kickoff_night, groups) VALUES (:ts, :my, :k, :t)";
        db_query($query, array(
            ':ts' => date('Y-m-d H:i:s') ,
            ':my' => "2014-2015",
            ':k' => substr($decoded->type, 7, 15) ,
            ':t' => $encode,
        ));*/
        db_insert('maestro_matched_kickoff_groups')
            ->fields(array(
                'timestamp'      => date('Y-m-d H:i:s'),
                'mentoring_year' => getYear(),
                'kickoff_night'  => substr($decoded->type, 7, 15),
                'groups'         => $encode,
                ))
            ->execute();
        // Chromephp::log("after inserting into the db");
    }
    if ($decoded->type == "trio") {
        $overrall_percentage = 0;
        $elements = 0;
        for ($g = 0; $g < count($decoded->children); $g++) {
            $current_group = $decoded->children[$g];
            for ($r = 0; $r < count($current_group->children); $r++) {
                $applicant = $current_group->children[$r];
                $applicant_name = $applicant->name;
                $applicant_familyname = $applicant->familyname;
                $applicant_weighting = $applicant->weighting;
                if (!is_null($applicant_weighting)) {
                    $overrall_percentage = $overrall_percentage + $applicant_weighting;
                    $elements++;
                }
            }
        }
        $overrall_percentage = $overrall_percentage / $elements;
        // this needs to be fixed...
        $answer = right_form_checker($decoded);
        if (!is_null($answer)) {
            // Chromephp::log("there was an error message returned");
            return $answer;
        }
        // Chromephp::log(count($decoded->children));
        // Chromephp::log("just before the for loop");
        $mentor_id;
        $junior_id;
        $senior_id;
        $thearray = array(); // this is going to be pushed to
        for ($g = 0; $g < count($decoded->children); $g++) { // go through the json file and search up the correct index.
            // Chromephp::log("the loop is running right now");
            // go through all the groups.
            // Chromephp::log($g);
            $current_group = $decoded->children[$g]; // this is the current group that we are searching
            // Chromephp::log($current_group);
            // ChromePhp::log($current_group->children);
            for ($r = 0; $r < count($current_group->children); $r++) {
                $applicant = $current_group->children[$r];
                $applicant_name = $applicant->name;
                $applicant_familyname = $applicant->familyname;
                $applicant_position = $applicant->position;
                // sql query and get the id.
                $mentor = 'Mentor';
                if ($applicant_position == $mentor) {
                    // Chromephp::log("found a mentor");
                    $mentor_id = traverser($applicant_name, $applicant_familyname, "mentor"); // finding a mentor finding his unique id...
                    // Chromephp::log($mentor_id);
                }
                $junior = "Junior";
                if ($applicant_position == $junior) {
                    // Chromephp::log("found a junior");
                    $junior_id = traverser($applicant_name, $applicant_familyname, "student");
                    // Chromephp::log($junior_id);
                }
                $senior = "Senior";
                if ($applicant_position == $senior) {
                    // Chromephp::log("found a senior");
                    $senior_id = traverser($applicant_name, $applicant_familyname, "student");
                    // Chromephp::log($senior_id);
                }
            }
            // we need to create the group for this particular array now
            $myArray = array(
                'mentor' => $mentor_id,
                'senior' => $senior_id,
                'junior' => $junior_id,
            );
            array_push($thearray, $myArray); // push the array...*/
        }
        // Chromephp::log($thearray);
        $encode = json_encode($thearray); // this
        // Chromephp::log($encode);
        // read from the json file to save in...
        $weighting_content = file_get_contents("weightings.json");
        // Chromephp::log($weighting_contents);
        /*$query = "INSERT INTO TESTING.maestro_matched_trios (timestamp, mentoring_year, weightings, percentage, trios) VALUES (:ts, :my, :w, :p, :t)";
        db_query($query, array(
            ':ts' => date('Y-m-d H:i:s') ,
            ':my' => "2014-2015",
            ':w' => $weighting_content, // this needs to be dynamic
            ':p' => $overrall_percentage, // this needs to save the actual percentage..  summation of everything...
            ':t' => $encode,
        ));*/
        db_insert('maestro_matched_trios')
            ->fields(array(
                'timestamp'      => date('Y-m-d H:i:s'),
                'mentoring_year' => getYear(),
                'weightings'     => $weighting_content,
                'percentage'     => $overrall_percentage,
                'trios'          => $encode,
                ))
            ->execute();
        //  Chromephp::log("after inserting into the db");
    }
}
// gathers the indices for the json array...
function traverser($firstname, $lastname, $choose)
{
    $current_year = getYear();
    list($mentor_table, $student_table) = getParticipantTableNames($current_year);
    // Chromephp::log("traverser is being called ");
    $db_table_name = $student_table;
    if ($choose == "mentor") {
        $db_table_name = $mentor_table;
        //$query = "SELECT * FROM TESTING.maestro_signup_mentor_20142015";
    }
    /*else {
        $query = "SELECT * FROM TESTING.maestro_signup_student_20142015";
        // Chromephp::log($query);
    }*/
    //$result1 = db_query($query)->fetchAll();
    $result1 = db_select($db_table_name, 'dtn')
        ->fields('dtn')
        ->execute()
        ->fetchAll();
    for ($a = 0; $a < count($result1); $a++) {
        if ($result1[$a]->last_name == $lastname && $result1[$a]->first_name == $firstname) {
            return $result1[$a]->id;
        }
    }
}
// this function is going to check whether the json file has the right form and can be saved into the trio database...
// if it does not return null then return the message that was sent...
function right_form_checker($json_input)
{
    // Chromephp::log("this is the right form checker");
    // Chromephp::log($json_input);
    for ($g = 0; $g < count($json_input->children); $g++) { // go through the json file and search up the correct index.
        $current_group = $json_input->children[$g];
        // Chromephp::log("inside the loop checker");
        // Chromephp::log($current_group);
        // check the size of each group...
        if (count($current_group->children) != 3) // if the size is not equal to three...
        {
            return "There is a group that is not three!";
        }
        $mentor = 0;
        $junior = 0;
        $senior = 0;
        // this for loop has an error inside...
        for ($i = 0; $i < count($current_group->children); $i++) {
            // going through each child within each group make sure that we have each thing...
            $current_group1 = $current_group->children[$i];
            $position = $current_group1->position;
            $mentorstring = "Mentor";
            if ($position == $mentorstring) {
                $mentor = 1;
            }
            $juniorstring = "Junior";
            if ($position == $juniorstring) {
                $junior = 1;
            }
            $seniorstring = "Senior";
            if ($position == $seniorstring) {
                $senior = 1; // this line is failing right now...
            }
        }
        // check if we found one of each here.
        if ($mentor == 0 || $junior == 0 || $senior == 0) {
            return "There is a group that does not comprise of a Mentor, Senior student and Junior student";
        }
    }
    return null;
}
?>