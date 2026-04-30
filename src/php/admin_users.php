<?php

    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";

    $stmt = $db->query("
    SELECT
    id,
    email,
    username,
    verified,
    is_admin,
    premium_type,
    registration_date
    FROM users
    ORDER BY id DESC
    ");

    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success"=>true,
        "users"=>$users
    ]);

?>