<?php

function printTrioBuckets($trioBuckets)
{
	foreach ($trioBuckets as $night => $trios)
	{
		echo 'Trio Bucket ' . $night . '<br />';
		var_dump($trios);
	}
}

function printNights($nights)
{
	foreach ($nights as $night=>$trios)
	{
		echo 'Night ' . $night . '<br />';
		var_dump($trios);
		echo '<br />';
	}
}