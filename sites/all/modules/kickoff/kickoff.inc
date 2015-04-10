<?php

$GLOBALS['MAX_GROUP_SIZE'] = 9;
$GLOBALS['MAX_MENTORS'] = 3;

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
function choosePerson($night, $people, $currentPrefs, $groupHobbies, $currentGroup)
{
	if (empty($currentPrefs))
	{
		if (empty($people)) { return -1; }
		//else{	return 0; }
	}
	
	$currentTrioIds = $currentGroup->getTrioIds();
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
		$currentDiff = ~PHP_INT_MAX;
		$numMentors = $currentGroup->getNumberOfMentors();
		
		$choseAtLeastOne = false;
		for ($x = 0; $x < count($people); ++$x)
		{
			$p = $people[$x];
			$isMentor = $p['title'] === 'mentor';
			if ($isMentor && $numMentors === $GLOBALS['MAX_MENTORS'])
			{
				continue;
			}
			else if (!$isMentor && $numMentors < $GLOBALS['MAX_MENTORS'])
			{
				continue;
			}
			
			if (array_key_exists($p['trio'], $currentTrioIds)) { continue; }
			$diff = $p['prefs']['year'] - $currentAverage + getDifferentHobbies($p['prefs']['hobbies'],$groupHobbies);
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
			error_log('WARNING: Could not choose a person optimally. Relaxing constraints. ' . $people[$person]['name'] . ' will not be happy. <br />');
		}
		error_log($person);
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

function getIdFromTitle($title)
{
	if ($title === 'senior') { return 1; }
	else if ($title === 'junior') { return 2; }
	return 0;
}

function getTitleFromId($id)
{
	switch ($id)
	{
		case 1:
			return 'junior';
		case 2:
			return 'senior';
		default:
			return 'mentor';
	}
}

class Group
{
	private $people = array();
	private $trioIds = array();
	
	function Group()
    {
		for ($x = 0; $x < 3; ++$x)
		{
			array_push($this->people, array());
		}
	}
	
	public function addTrioId($id) { $this->trioIds[$id] = true; } 
	public function getTrioIds() { return $this->trioIds; }
	
	public function getAllPeople() { return array_merge($this->people[0],$this->people[1],$this->people[2]); }
	public function getMentors() { return $this->people[0]; }
	public function getNumberOfMentors() { return count($this->people[0]); }
	public function getSeniors() { return $this->people[1]; }
	public function getJuniors() { return $this->people[2]; }
	
	public function getPersonIds($type)
	{
		$ids = array();
		foreach ($this->people[$type] as $person)
		{
			array_push($ids, $person['id']);
		}
		return $ids;
	}
	
	public function addPerson($person)
	{
		$id = getIdFromTitle($person['title']);
		array_push($this->people[$id], $person);
	}
	
	private function add($which, $person) { array_push($people[$which], $person); }
	public function addToMentors($person) { add(0, $person); }
	public function addToSeniors($person) { add(1, $person); }
	public function addToJuniors($person) { add(2, $person); }
	
	public function getSize()
	{
		return count($this->people[0]) + count($this->people[1]) + count($this->people[2]);
	}
	
	public function isEmpty()
	{
		return $this->getSize() === 0;
	}
}

function kickoff($night, $people)
{
	$groups = array();
	$currentGroup = new Group();
	$currentPrefs = array();
	$currentHobbies = array();

	while (!empty($people))
	{
		$person = choosePerson($night, $people, $currentPrefs, $currentHobbies, $currentGroup);
		
		array_push($currentPrefs, $people[$person]["prefs"]);
		
		for ($x = 0; $x < count($people[$person]["prefs"]["hobbies"]); ++$x)
		{
			$currentHobbies[$people[$person]["prefs"]["hobbies"][$x]] = true;
		}
		
		$currentGroup->addPerson($people[$person]);
		$currentGroup->addTrioId($people[$person]["trio"]);
		array_splice($people, $person, 1);
		if ($currentGroup->getSize() === $GLOBALS['MAX_GROUP_SIZE'])
		{
			array_push($groups, $currentGroup);
			$currentGroup = new Group();
			$currentPrefs = array();
		}
	}

	if ($currentGroup->isEmpty())
	{
		if ($currentGroup->getSize() > $GLOBALS['MAX_GROUP_SIZE'] - 2)
		{
			array_push($groups, $currentGroup);
		}
		else
		{
			foreach ($currentGroup->getAllPeople() as $person)
			{
				if (fixGroupHelper($groups, $person)) { break; }
			}
		}
	}

	return $groups;
}

function fixGroupHelper($allGroups, $person)
{
	foreach ($allGroups as $group)
	{
		if (!array_key_exists($person['trio'], $group->getTrioIds()))
		{
			array_push($personList, $person);
			return true;
		}
	}
	return false;
}

function outputGroups($groups)
{
	$output = '';
	for ($x = 0; $x < count($groups); ++$x)
	{
		$output = $output . '<h3>Group ' . ($x + 1) . '</h3>';
		$output = $output . '<br />';
		$currentGroup = $groups[$x];
		foreach ($currentGroup->getAllPeople() as $person)
		{
			$output = $output . $person['name'] . ' <span style="color: #bbb;">' . $person['trio'] . ' ' . $person['title'] . '</span>';
			$output = $output . '<br />';
		}
	}
	return $output;
}

?>