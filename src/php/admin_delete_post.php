<?php
    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";

    // Beolvassuk a JSON kérést
    $json = file_get_contents('php://input');
    $data = json_decode($json);

    if (isset($data->id)) {
        try {
            $stmt = $db->prepare("DELETE FROM posts WHERE id = ?");
            $success = $stmt->execute([$data->id]);

            if ($success) {
                echo json_encode([
                    "success" => true,
                    "message" => "Post törölve"
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Törlési hiba"
                ]);
            }
        } catch (Exception $e) {
            echo json_encode([
                "success" => false,
                "message" => $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Nincs ID megadva"
        ]);
    }
?>