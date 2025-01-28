<?php
$cid = "a".$_GET['cid'];
$mid = $_GET['mid'];
$msg = $_GET['msg'];
$act = $_GET['act'];

//$link = mysql_connect('fdb3.biz.nf', '1521979_chat', 'H6n84HsX1wInCvGpL0pH');
$link = mysql_connect('localhost', 'root', '');
if(!$link) die("SM".mysql_error);
$db_selected = mysql_select_db('1521979_chat');
$ermsg = "SM".mysql_error();
if (!$db_selected) die($ermsg);

if($act == "create") create();
else if($act == "upload") insert();
else if($act=="update") read();
else if($act=="terminate") terminate($cid);
else echo 'SM Error, no Action specified';



function create()
{
    global $cid;
    $sql = "CREATE TABLE IF NOT EXISTS `$cid` (
      `id` int(4) NOT NULL AUTO_INCREMENT,
      `msg` varchar(65500) NOT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1
    AUTO_INCREMENT=1;";
    mysql_query($sql);
    insert();
}
function insert()
{
    global $cid;
    global $msg;
    $sql = "INSERT INTO `$cid` VALUES('', '$msg');";
    if(!mysql_query($sql)) die("SMCHANNEL_DELETED!!");
}
function read()
{
    global $cid;
    global $mid;
    $sql = "SELECT * FROM $cid WHERE id > '$mid';";
    $result = mysql_query($sql);
    if(!$result) die("SMCHANNEL_DELETED!!");
    $chat = "";
    for($i = 0; $row = mysql_fetch_assoc($result); $i++)
    {
        $chat .= $row['id'].";".$row['msg']."#";
    }
    echo $chat;
}
function terminate($cid)
{
    $sql = "DROP TABLE $cid;";
    mysql_query($sql);
}

mysql_close($link);
?>
