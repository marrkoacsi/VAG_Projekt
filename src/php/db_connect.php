<?php

    $host = getenv('DB_HOST');
    $dbname = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $password = getenv('DB_PASSWORD');
    $sslmode = "require";

    try{
        $db = new PDO("pgsql:host=$host; dbname=$dbname; sslmode=$sslmode", $user, $password);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    catch (PDOException $e){
        echo "Connection failed: " . $e->getMessage();
    }

?>