<?php

    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";

    // A nyers bemenet beolvasása
    $json = file_get_contents("php://input");
    $data = json_decode($json, true);

    $id = $data["id"];

    try {
        // Ellenőrizzük, létezik-e a felhasználó a törlés előtt
        $check = $db->prepare("SELECT id FROM users WHERE id = :id");
        $check->execute([":id" => $id]);
        
        if ($check->rowCount() === 0) {
            echo json_encode(["success" => false, "message" => "A felhasználó nem található"]);
            exit;
        }

        // Tényleges törlés
        $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
        $result = $stmt->execute([":id" => $id]);

        if ($result) {
            echo json_encode(["success" => true, "message" => "Felhasználó sikeresen törölve"]);
        } else {
            echo json_encode(["success" => false, "message" => "Adatbázis hiba történt a törlés során"]);
        }

    } catch (PDOException $e) {
        // SQL hiba (pl. idegen kulcs korlátozás)
        echo json_encode(["success" => false, "message" => "SQL Hiba: " . $e->getMessage()]);
    }

?>