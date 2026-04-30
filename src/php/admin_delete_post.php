<?php
    header("Content-Type: application/json; charset=UTF-8");

    require "db_connect.php";

    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->id)) {
        try {
            $query = "DELETE FROM posts WHERE id = ?";
            $stmt = $conn->prepare($query);
            
            if ($stmt->execute([$data->id])) {
                echo json_encode(["message" => "Post deleted successfully"]);
            } else {
                echo json_encode(["message" => "Unable to delete post"]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["message" => "Incomplete data. Post ID is required."]);
    }
?>