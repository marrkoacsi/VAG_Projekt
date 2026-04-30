<?php

    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";
    require "user_id_enc.php";

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        try {
            $postId = $_GET['postId'];
            
            $query = "SELECT f.id, f.user_id, f.name, f.content, f.file_name, f.likes, f.dislikes, f.date, f.view_count, u.username, u.ppicture
                    FROM forum f 
                    JOIN users u ON f.user_id = u.id 
                    WHERE f.id = :postId AND f.post_id IS NULL";
            $stmt = $db->prepare($query);
            $stmt->execute([':postId' => $postId]);
            $post = $stmt->fetch(PDO::FETCH_ASSOC);


            $replies = [];
            try {
                $repliesQuery = "SELECT f.id, f.post_id, f.user_id, f.name, f.content, f.file_name, f.date, u.username, u.ppicture
                                FROM forum f 
                                JOIN users u ON f.user_id = u.id 
                                WHERE f.post_id = :postId 
                                ORDER BY f.date ASC";
                $repliesStmt = $db->prepare($repliesQuery);
                $repliesStmt->execute([':postId' => $postId]);
                $replies = $repliesStmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $e) {
                $replies = [];
            }
            
            echo json_encode([
                "success" => true,
                "post" => $post,
                "replies" => $replies
            ]);

            $query = ("UPDATE forum SET view_count = view_count + 1 WHERE id = $postId");
            $stmt = $db->prepare($query);
            $stmt->execute();

            exit;
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => $e->getMessage()
            ]);
        }
        exit;
    }

    if ($method === 'POST') {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $postId = $data['postId'];
            $userId = decryptUserId($data['userId']);
            $content = $data['content'];
            $name = 'Re: Reply';
            
            $insertQuery = "INSERT INTO forum (post_id, user_id, name, content, date) 
                        VALUES (:postId, :userId, :name, :content, NOW()) 
                        RETURNING id";
            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->execute([
                ':postId' => $postId,
                ':userId' => $userId,
                ':name' => $name,
                ':content' => $content
            ]);
            
            $result = $insertStmt->fetch(PDO::FETCH_ASSOC);
            $newReplyId = $result['id'];
            
            $selectQuery = "SELECT f.id, f.post_id, f.user_id, f.name, f.content, f.file_name, f.date, u.username, u.ppicture
                        FROM forum f 
                        JOIN users u ON f.user_id = u.id 
                        WHERE f.id = :replyId";
            $selectStmt = $db->prepare($selectQuery);
            $selectStmt->execute([':replyId' => $newReplyId]);
            $newReply = $selectStmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "success" => true,
                "reply" => $newReply
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "error" => $e->getMessage()
            ]);
        }
        exit;
    }
?>
