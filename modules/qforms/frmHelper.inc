<?php

/*
	returns a string formatted to database settings 
	'Male' = 'M' ; 'Female' = 'F' ; 'Neutral' = 'N'
*/
function genderHelper($gender) {
	if ($gender == 'Male') {
			$gender = 'M'; 		
	} elseif ($gender == 'Female'){
			$gender = 'F';
	} else {
			$gender = 'N';
	}
	return $gender;
}

/*
* Helper to translate array of dates into one string to be stored in database
* convience for parsing
*
function kickoffHelper($array_dates) {
	$returnString = '{';
	$len = count($array_dates);
	$i = 0;
	foreach ($array_dates as $key => $value){
			if ($value != 0){
					$returnString .= "\"$key\": 1";
			} else{
					$returnString .= "\"$key\": 0";
			}
			if ($i != $len - 1){
					$returnString .= ', ';
			} else {
					$returnString .= '}';
			}
			$i++;
	}
	return $returnString;
}
*/

function kickoffHelper($array_dates) {
	$returnString = '{';
	$len = count($array_dates);
	$i = 0;
	foreach ($array_dates as $key => $value){
			if ($value){
					$returnString .= "\"$key\": 1";
			} else{
					$returnString .= "\"$key\": 0";
			}
			if ($i != $len - 1){
					$returnString .= ', ';
			} else {
					$returnString .= '}';
			}
			$i++;
	}
	return $returnString;
}

/*
Helper function to translate checkbox respondses into a comma-separated string
*/	
function checkboxHelper($array_checkbox_response) {
	$returnString = '';
	$len = count($array_checkbox_response);
	$i = 0;
	foreach ($array_checkbox_response as $key => $value){

			if ($value) {
					$returnString .= $value;
					$returnString .= ', ';
			}
	}

	if ($returnString == '') return '';
	return substr($returnString, 0, strlen($returnString) - 2);
}


/*
* Helper function to produce simplified response for database: in regards to alumni status
*/
function alumniHelper($status) {
	$return_status = 0;
	if ($status == 'Yes') {
			$return_status = 1; 		
	}		
	return $return_status;
}


