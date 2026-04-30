<?php

header('Content-Type: application/json');

require "db_connect.php";
require "cors.php";

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? 0;

$stmt = $db->prepare("DELETE FROM users WHERE id = :id");
$stmt->execute([":id"=>$id]);

echo json_encode(["success"=>true]);