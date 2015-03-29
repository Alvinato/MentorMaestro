<?php
// this page needs to close the current window and then alter the json file to add someone.

/*chromephp:: log(isset($_POST['report']);
if (isset($_POST['report'])) {
  Chromephp::log("this got called");
        echo("hello");
        select("hello");
    }

echo "this is being run right now";



function highScore(){

	Chromephp::log("query.php is being run right now");
}*/

  Chromephp::log("query.php is being run right now");
 header('Content-Type: application/json');

    $aResult = array();

    if( !isset($_POST['functionname']) ) { $aResult['error'] = 'No function name!'; }

    if( !isset($_POST['arguments']) ) { $aResult['error'] = 'No function arguments!'; }

    if( !isset($aResult['error']) ) {

        switch($_POST['functionname']) {
            case 'add':
               if( !is_array($_POST['arguments']) || (count($_POST['arguments']) < 2) ) {
                   $aResult['error'] = 'Error in arguments!';
               }
               else {
                   $aResult['result'] = add(floatval($_POST['arguments'][0]), floatval($_POST['arguments'][1]));
               }
               break;

            default:
               $aResult['error'] = 'Not found function '.$_POST['functionname'].'!';
               break;
        }

    }

    echo json_encode($aResult);

 // this function needs to alter the json file...
function add($arguments){
include 'ChromePhp.php';
  Chromephp::log("omg this add function is being called");
  Chromephp::log($aResult);
  ChromePhp::log($arguments);
}

?>