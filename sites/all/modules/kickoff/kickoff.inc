<?php

$GLOBALS['MAX_GROUP_SIZE'] = 9;

// diff year levels and hobbies
$people = array(
	array("name" => "Bill", "trio" => 1, "nights" => [1=>true], "prefs" => ["year" => 1, "hobbies" => ["sports","art"]])
	,array("name" => "Eric", "trio" => 1, "nights" => [1=>true], "prefs" => ["year" => 3, "hobbies" => ["sports","music"]])
	,array("name" => "Ted", "trio" => 3, "nights" => [1=>true], "prefs" => ["year" => 2, "hobbies" => ["fishing","cooking"]])
	,array("name" => "Alvin", "trio" => 2, "nights" => [1=>true], "prefs" => ["year" => 6, "hobbies" => ["sports","art"]])
	//,array("name" => "Alvin2", "prefs" => ["year" => 0])
	//,array("name" => "Alvin3", "prefs" => ["year" => 0])
	);
	
// diff year levels and hobbies
$people1 = array(
	array("name" => "Bill",  "nights" => [], "prefs" => ["year" => 1, "hobbies" => ["sports","art"]])
	,array("name" => "Eric", "nights" => [], "prefs" => ["year" => 3, "hobbies" => ["sports","music"]])
	,array("name" => "Ted", "nights" => [], "prefs" => ["year" => 2, "hobbies" => ["fishing","cooking"]])
	,array("name" => "Alvin", "nights" => [], "prefs" => ["year" => 6, "hobbies" => ["sports","art"]])
	//,array("name" => "Alvin2", "prefs" => ["year" => 0])
	//,array("name" => "Alvin3", "prefs" => ["year" => 0])
	);
	
// diff year levels only
$people2 = array(
	array("name" => "Bill", "nights" => [], "prefs" => ["year" => 1, "hobbies" => ["sports"]])
	,array("name" => "Eric", "nights" => [], "prefs" => ["year" => 7, "hobbies" => ["sports"]])
	,array("name" => "Ted", "nights" => [], "prefs" => ["year" => 10, "hobbies" => ["fishing"]])
	,array("name" => "Alvin", "nights" => [], "prefs" => ["year" => 4, "hobbies" => ["sports"]])
	,array("name" => "Bob", "nights" => [], "prefs" => ["year" => 6, "hobbies" => ["sports"]])
	,array("name" => "Fred", "nights" => [], "prefs" => ["year" => 3, "hobbies" => ["sports"]])
	,array("name" => "Old", "nights" => [], "prefs" => ["year" => 20, "hobbies" => ["sports"]])
	,array("name" => "ExtremeOld", "nights" => [], "prefs" => ["year" => 30, "hobbies" => ["sports"]])
	,array("name" => "Forsyth", "nights" => [],  "prefs" => ["year" => 4, "hobbies" => ["sports"]])
	);

//'
function choosePerson($night, $people, $currentPrefs, $groupHobbies, $currentTrioIds)
{
	if (empty($currentPrefs))
	{
		if (empty($people)) { return -1; }
		//else{	return 0; }
	}
	//else
	//{
		$currentAverage = 0;
		$x = 0;
		foreach ($currentPrefs as $value)
		{
			$currentAverage += $value['year'];
			++$x;
		}
		if ($x != 0) { $currentAverage /= $x; }
		
		$person = 0;
		$currentDiff = 0;
		$choseAtLeastOne = false;
		for ($x = 0; $x < count($people); ++$x)
		{
			if (array_key_exists($people[$x]['trio'], $currentTrioIds)) { continue; }
			$diff = $people[$x]['prefs']['year'] - $currentAverage + getDifferentHobbies($people[$x]['prefs']['hobbies'],$groupHobbies);
			if ($diff > $currentDiff)
			{
				$choseAtLeastOne = true;
				$person = $x;
				$currentDiff = $diff;
			}
		}
		if (!$choseAtLeastOne)
		{
			for ($x = 0; $x < count($people); ++$x)
			{
				if (array_key_exists($people[$x]['trio'], $currentTrioIds)) { continue; }
				
				$person = $x;
				return $person;
			}
			echo 'WARNING: Could not choose a person optimally. Relaxing constraints. ' . $people[$person]['name'] . ' will not be happy. <br />';
		}
		return $person;
	//}
}

function getDifferentHobbies($personHobbies, $groupHobbies)
{
	$diff = 0;
	for ($x = 0; $x < count($personHobbies); ++$x)
	{
		if (!array_key_exists($personHobbies[$x], $groupHobbies))
		{
			$diff++;
		}
	}
	return $diff;
}

function kickoff($night, $people)
{
	$groups = array();
	$currentGroup = array();
	$currentPrefs = array();
	$currentHobbies = array();
	$currentTrioIds = array();

	while (!empty($people))
	{
		$person = choosePerson($night, $people, $currentPrefs, $currentHobbies, $currentTrioIds);
		
		array_push($currentPrefs, $people[$person]["prefs"]);
		
		for ($x = 0; $x < count($people[$person]["prefs"]["hobbies"]); ++$x)
		{
			$currentHobbies[$people[$person]["prefs"]["hobbies"][$x]] = true;
		}
		
		array_push($currentGroup, $people[$person]);
		$currentTrioIds[$people[$person]["trio"]] = true;
		array_splice($people, $person, 1);
		if (count($currentGroup) === $GLOBALS['MAX_GROUP_SIZE'])
		{
			array_push($groups, array($currentGroup, $currentTrioIds));
			$currentGroup = array();
			$currentPrefs = array();
			$currentTrioIds = array();
		}
	}

	if (!empty($currentGroup))
	{
		if (count($currentGroup) > $GLOBALS['MAX_GROUP_SIZE'] - 2)
		{
			array_push($groups, array($currentGroup, $currentTrioIds));
		}
		else
		{
			foreach ($currentGroup as $person)
			{
				foreach ($groups as $group)
				{
					list($personList, $trioIds) = $group;
					if (!array_key_exists($person['trio'], $trioIds))
					{
						array_push($personList, $person);
						break;
					}
				}
			}
		}
	}

	return $groups;
}

function outputGroups($groups)
{
	$output = '';
	for ($x = 0; $x < count($groups); ++$x)
	{
		$output = $output . '<h3>Group ' . ($x + 1) . '</h3>';
		$output = $output . '<br />';
		list($personList, $trioIds) = $groups[$x];
		foreach ($personList as $person)
		{
			$output = $output . $person['name'] . ' <span style="color: #bbb;">' . $person['trio'] . ' ' . $person['title'] . '</span>';
			$output = $output . '<br />';
		}
	}
	return $output;
}

?>