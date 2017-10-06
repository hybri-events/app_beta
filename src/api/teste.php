<?php
  require __DIR__ . '/vendor/autoload.php';

  define('DEFAULT_URL','https://api-4996752536673032512-480980.firebaseio.com/');
  define('DEFAULT_TOKEN','PdHdZ16Qa3INEiuIWl3gSgSp7Jxh4KQNDfqK6zrr');
  define('DEFAULT_PATH1','/teste/');
  define('DEFAULT_PATH2','/teste2/');

  $firebase = new \Firebase\FirebaseLib(DEFAULT_URL, DEFAULT_TOKEN);

  $push1 = $firebase->push(DEFAULT_PATH1, array());
  $pos1 = strpos($push1,'":"');
  $pos2 =  strpos($push1,'"}');
  $key1 = substr($push1,($pos1 + 3),($pos2 - ($pos1 + 3)));
  echo $key1.'<br>';

  $push2 = $firebase->push(DEFAULT_PATH2, array());
  $pos1 = strpos($push2,'":"');
  $pos2 =  strpos($push2,'"}');
  $key2 = substr($push2,($pos1 + 3),($pos2 - ($pos1 + 3)));
  echo $key2;

  $update = array(
    'teste' => array($key1 => array('teste' => 'teste')),
    'teste2' => array($key2 => array('teste2' => 'teste2'))
  );

  $firebase->set('/teste/',$update);
?>
