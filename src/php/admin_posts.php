<?php
    header("Content-Type: application/json; charset=UTF-8");
    require "db_connect.php"; // Feltételezve, hogy ez a fájl tartalmazza a PDO kapcsolatot

    try {
        // Lekérdezzük a posztokat. A képeid alapján ezek a mezők léteznek.
        $query = "SELECT id, brand_id, problem_id, post_id, user_id, name, content, view_count, date, likes, dislikes, reply_count, file_name FROM posts ORDER BY date DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute();

        $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["posts" => $posts]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
?>