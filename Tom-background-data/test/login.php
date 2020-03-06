<?php
if(isset($_POST['User']) && !empty($_POST['User']) && isset($_POST['Pwd']) && !empty($_POST['Pwd'])) {
  
  $conn = new mysqli("Server", "User", "Password", "Table");
  if ($conn->connect_error) {die("Connection failed: " . $conn->connect_error);} 

  $return = "false";
  
  foreach ($conn->query("SELECT * FROM `baccusers") as $row){
    if($row['user'] == $_POST['User'] && $row['pwd'] == $_POST['Pwd'] && $row['verify'] == "0"){
      $return = "true";
    }      
  };
  $return = "true";
  
  if($return == "true"){
    // $conn->query("UPDATE baccusers SET verify = '1' WHERE baccusers.user = '". $_POST['User'] ."'");
    echo true;
  }else echo false;
}
?>