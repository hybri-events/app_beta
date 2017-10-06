<?php
  $postdata = file_get_contents("php://input");
  if ( isset($postdata) ){
    $request = json_decode($postdata);
    $de = $request->de;
    $para = $request->para;
    $valor = $request->valor;
    $check = $request->check;
    if ( $check ){
      $nEvent = $request->nEvent;
      $vezes = $request->vezes;
    }

    require __DIR__ . '/vendor/autoload.php';

    define('DEFAULT_URL','https://api-4996752536673032512-480980.firebaseio.com/');
    define('DEFAULT_TOKEN','PdHdZ16Qa3INEiuIWl3gSgSp7Jxh4KQNDfqK6zrr');
    define('DEFAULT_PATH','/conta/');

    date_default_timezone_set('America/Sao_Paulo');

    $firebase = new \Firebase\FirebaseLib(DEFAULT_URL, DEFAULT_TOKEN);

    $get1 = $firebase->get(DEFAULT_PATH . $de);
    $pos1 = strpos($get1,'{"');
    $pos2 =  strpos($get1,'":{"saldo');
    $key1 = substr($get1,($pos1 + 2),($pos2 - ($pos1 + 2)));
    $saldo1 = $firebase->get(DEFAULT_PATH . $de . "/" . $key1 . "/saldo");

    $get2 = $firebase->get(DEFAULT_PATH . $para);
    $pos1 = strpos($get2,'{"');
    $pos2 =  strpos($get2,'":{"saldo');
    $key2 = substr($get2,($pos1 + 2),($pos2 - ($pos1 + 2)));
    $saldo2 = $firebase->get(DEFAULT_PATH . $para . "/" . $key2 . "/saldo");

    $user1 = $firebase->get("usuario/".$de);
    $pos1 = strpos($user1,'{"');
    $pos2 =  strpos($user1,'":{"codcad');
    $key_user1 = substr($user1,($pos1 + 2),($pos2 - ($pos1 + 2)));
    $nome1 = $firebase->get("usuario/".$de."/".$key_user1."/nome");
    $nome1 = str_replace('""','',$nome1);

    $user2 = $firebase->get("usuario/".$para);
    $pos1 = strpos($user2,'{"');
    $pos2 =  strpos($user2,'":{"codcad');
    $key_user2 = substr($user2,($pos1 + 2),($pos2 - ($pos1 + 2)));
    $nome2 = $firebase->get("usuario/".$para."/".$key_user2."/nome");
    $nome2 = str_replace('""','',$nome2);

    $date1 = date('Y-m-d');
    $date2 = date('H:i:s.000');
    $date = $date1."T".$date2;

    $day = date('j');
    $month = date('n');
    $year = date('Y');
    $hour = date('G');
    $min = date('i');

    if ( $check ){
      $trans1 = array(
          "ano" => $year,
          "classe" => "saida",
          "descricao" => "Check-in no seu evento \"".$nEvent."\".",
          "dia" => $day,
          "dt_hr" => $date,
          "hora" => $hour,
          "mes" => $month,
          "min" => $min,
          "operador" => "-",
          "tipo" => "Saída",
          "valor" => $valor
      );

      $trans2 = array(
          "ano" => $year,
          "classe" => "entrada",
          "descricao" => "Check-in no evento \"".$nEvent."\". ".$vezes."ª vez neste estabelecimento.",
          "dia" => $day,
          "dt_hr" => $date,
          "hora" => $hour,
          "mes" => $month,
          "min" => $min,
          "operador" => "+",
          "tipo" => "Entrada",
          "valor" => $valor
      );

      $path1 = DEFAULT_PATH .$de. '/transacao';
      $path2 = DEFAULT_PATH .$de. '/transacao';
      $path3 = DEFAULT_PATH . $de .'/'. $key1;
      $path4 = DEFAULT_PATH . $para .'/'. $key2;

      $firebase->push($path1, array());
      $pos1 = strpos($push1,'":"');
      $pos2 =  strpos($push1,'"}');
      $key1 = substr($push1,($pos1 + 3),($pos2 - ($pos1 + 3)));

      $firebase->push($path2, array());
      $pos1 = strpos($push2,'":"');
      $pos2 =  strpos($push2,'"}');
      $key2 = substr($push2,($pos1 + 3),($pos2 - ($pos1 + 3)));

      $update = array(
        $path1 => array($key1 => $trans1),
        $path2 => array($key2 => $trans2),
        $path3 => array("saldo" => ($saldo1 - $valor)),
        $path4 => array("saldo" => ($saldo2 + $valor))
      );

      $firebase->set('/teste/', $update);

      echo "1";
    } else {
      $trans1 = array(
          "ano" => $year,
          "classe" => "saida",
          "descricao" => "Pagamento efetuado para ".$nome2,
          "dia" => $day,
          "dt_hr" => $date,
          "hora" => $hour,
          "mes" => $month,
          "min" => $min,
          "operador" => "-",
          "tipo" => "Saída",
          "valor" => $valor
      );

      $trans2 = array(
          "ano" => $year,
          "classe" => "entrada",
          "descricao" => "Pagamento recebido de ".$nome1,
          "dia" => $day,
          "dt_hr" => $date,
          "hora" => $hour,
          "mes" => $month,
          "min" => $min,
          "operador" => "+",
          "tipo" => "Entrada",
          "valor" => ($valor * 0.8)
      );

      if ( ($saldo1 - $valor) >= 0 ){
        $path1 = $de.'/transacao';
        $path2 = $de.'/transacao';
        $path3 = $de.'/'.$key1;
        $path4 = $para.'/'.$key2;

        $push1 = $firebase->push($path1, array());
        $pos1 = strpos($push1,'":"');
        $pos2 =  strpos($push1,'"}');
        $key1 = substr($push1,($pos1 + 3),($pos2 - ($pos1 + 3)));

        $push2 = $firebase->push($path2, array());
        $pos1 = strpos($push2,'":"');
        $pos2 =  strpos($push2,'"}');
        $key2 = substr($push2,($pos1 + 3),($pos2 - ($pos1 + 3)));

        $update = array(
          $path1 => array($key1 => $trans1),
          $path2 => array($key2 => $trans2),
          $path3 => array("saldo" => ($saldo1 - $valor)),
          $path4 => array("saldo" => ($saldo2 + ($valor * 0.8)))
        );

        $firebase->set('/teste/', $update);

        echo "1";
      } else {
        echo "0";
      }
    }
  }
?>
