<?php
//      (sample code)
//    $zip_code = db_query("SELECT zip from {zipcodes} WHERE city = :city LIMIT 1", array(":city" => $city))->fetchField();

    /**
     * creates a new table inside maestro_db
     *
     * @param $yr1      start year of tri-mentoring program
     * @param $yr2      end year of tri-mentoring program
     */
    function create_new_table($yr1, $yr2) {
        $new_table = db_query("CREATE TABLE maestro_signup_student_" . ":yr1" . ":yr2", array(':yr1' => $yr1, ':yr2' => $yr2));
    }

    /**
     * exports questions from qforms to maestro's tables
     *
     * @param $nid
     */
    function export_to_maestro_db($nid) {

        // first, grab the questions from where qforms stores them
        $all_questions = db_query("SELECT form_definition FROM qforms_definition WHERE nid = :nid", array(':nid' => $nid));

        // then, grab the responses from qforms

        // counter for foreach loop below
        $curr_q = 0;

        // foreach entry in qforms table, insert into maestro equivalent
        foreach ($all_questions as $row) {
            $curr_q++;
            $question = unserialize($row);
            $maestro_query = db_insert('maestro_')->fields(array(
                'column_name' => $question[f],
                'column_name' => $local_var_name
            ))
            ->execute();
        }

    }

    function maestro_remove_response() {

    }




    // $q = "SELECT * FROM {projects} WHERE uid = :uid";
    // $result = db_query($q, array(':uid' => $uid));
    // foreach ($result as $row) {
    //     // loop through your result set, working with $row here
    // }

    // $id = db_insert('projects')
    //     ->fields(array(
    //         'user_id' => $uid,
    //         'project_type' => $project_type,
    //         'name' => $name,
    //         'description' => $description,
    //         'last_updated' => $timestamp,
    //         'date_created' => $timestamp
    //     ))
    //     ->execute();

    $responses = db_query("SELECT data FROM qforms_submission WHERE nid=")

?>
