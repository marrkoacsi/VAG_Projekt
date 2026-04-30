<?php

header('Content-Type: application/json');

require "db_connect.php";
require "cors.php";

$stmt = $db->query("
SELECT
COUNT(*) as total,
SUM(CASE WHEN is_admin = 1 THEN 1 ELSE 0 END) as admins,
SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified
FROM users
");

$stats = $stmt->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "success"=>true,
    "total"=>$stats["total"],
    "admins"=>$stats["admins"],
    "verified"=>$stats["verified"]
]);