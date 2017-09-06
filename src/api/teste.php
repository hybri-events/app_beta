<?php
  //error_reporting(0);

  $host  = "mysql.hostinger.com.br";
  $user  = "u335490165_app";
  $senha = "X6ie6VvCeWit";
  $base  = "u335490165_app";

  $conn = mysqli_connect($host, $user, $senha, $base);
  $conn->set_charset("utf8mb4");

  $sql = "INSERT INTO localizacao VALUES(null,2,NOW(),'".json_encode($_POST)."','0')";
  $res = mysqli_query($conn, $sql);
?>
