<?php

    $allowed_origins = explode(",", getenv('ORIGIN'));
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    // Ha üres az origin (asztali app), vagy benne van a listában, engedélyezzük
    if (empty($origin) || in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . ($origin ? $origin : "*"));
    }

    header("Vary: Origin");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    
?>