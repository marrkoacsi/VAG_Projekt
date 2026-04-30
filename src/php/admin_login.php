<?php

header('Content-Type: application/json');

require "db_connect.php";
require "cors.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data["email"] ?? "";
$password = $data["password"] ?? "";

if ($email === "" || $password === "") {
    echo json_encode([
        "success" => false,
        "message" => "missing data"
    ]);
    exit;
}

$stmt = $db->prepare("SELECT id, username, password_hash, verified, is_admin 
                      FROM users 
                      WHERE email = :email 
                      LIMIT 1");

$stmt->execute([
    ":email" => $email
]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode([
        "success" => false,
        "message" => "user not found"
    ]);
    exit;
}

if (!password_verify($password, $user["password_hash"])) {
    echo json_encode([
        "success" => false,
        "message" => "wrong password"
    ]);
    exit;
}

if ((int)$user["verified"] !== 1) {
    echo json_encode([
        "success" => false,
        "message" => "account not verified"
    ]);
    exit;
}

if ((int)$user["is_admin"] !== 1) {
    echo json_encode([
        "success" => false,
        "message" => "not admin"
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "id" => (int)$user["id"],
    "username" => $user["username"],
    "admin" => true
]);

exit;