<?php
    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";

    try {
        // Lekérjük a legfontosabb mezőket a posztok táblából
        $stmt = $db->query("
            SELECT 
                id, 
                user_id, 
                name, 
                content, 
                date, 
                likes, 
                file_name 
            FROM forum
            ORDER BY id DESC
        ");

        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "posts" => $posts
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }
?>