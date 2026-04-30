<?php

    $allowed_origins = explode(",", getenv('ORIGIN')); // ORIGIN környezeti változóban megadott engedélyezett originok listája, vesszővel elválasztva

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    }

    header("Vary: Origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma");


    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204); 
        header("Content-Length: 0");
        header("Content-Type: text/plain");
        exit;
    }
?>
