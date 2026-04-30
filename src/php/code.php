<?php

    require "db_connect.php";
    require "cors.php";

    // JSON body beolvasása
    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data["email"] ?? "";
    $code = $data["code"] ?? "";

    if ($email === "" || $code === "") {
        echo json_encode(["success" => false]);
        exit;
    }

    // User lekérdezés (prepared)
    $stmt = $db->prepare("SELECT verification, verified FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($code === $user["verification"]) {
        // Frissítjük a verified mezőt
        $updateStmt = $db->prepare("UPDATE users SET verified = 1, tries = 5 WHERE email = :email");
        $updateStmt->execute([":email" => $email]);

        echo json_encode(["success" => true]);
    } 
    else {
        echo json_encode(["success" => false]);
    }

?>