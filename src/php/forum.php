<?php

    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";
    require "user_id_enc.php";

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // Paraméterek beolvasása
        $sortBy   = $_GET['sortBy'] ?? null;
        $category = $_GET['category'] ?? null;
        $tag      = $_GET['tag'] ?? null;

        // Alap WHERE feltételek
        $whereParts = ["forum.post_id IS NULL"];
        $params = [];

        switch ($sortBy) {
            case 'oldest':
                $orderBy = 'forum.date ASC';
                break; // Fontos!
            case 'likes':
                $orderBy = 'forum.likes DESC, forum.date DESC';
                break; // Fontos!
            case 'views':
                $orderBy = 'forum.view_count DESC, forum.date DESC';
                break; // Fontos!
            case 'newest':
            default:
                $orderBy = 'forum.date DESC';
                break;
        }


        if($method == 'GET' && $sortBy == 'newest' && !$tag && !$category)
        {
            // LEKÉRÉS LOGIKA - csak a fő posztok (ahol post_id IS NULL)
            $sql = "SELECT forum.*, users.username, users.ppicture
                    FROM forum
                    JOIN users ON forum.user_id = users.id
                    WHERE forum.post_id IS NULL
                    ORDER BY forum.view_count DESC
                    LIMIT 10";

            $stmt = $db->prepare($sql);
            $stmt->execute();
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(["post" => $posts]);
            exit; // Megállítjuk a futást, hogy ne küldjön több adatot!

        }

        // Márka szerinti szűrés (#vw, #skoda, stb. + brand_id)
        if ($category && $orderBy) {
            $category = strtolower(trim($category));
            $categoryTags = [];
            $brandId = null;
            switch ($category) {
                case 'volkswagen':
                case 'vw':
                    $categoryTags = ['vw', 'volkswagen'];
                    $brandId = 2;
                    break;
                case 'skoda':
                    $categoryTags = ['skoda'];
                    $brandId = 4;
                    break;
                case 'seat':
                    $categoryTags = ['seat'];
                    $brandId = 3;
                    break;
                case 'audi':
                    $categoryTags = ['audi'];
                    $brandId = 1;
                    break;
                default:
                    $categoryTags = [];
                    break;
            }

            $newTag = '%#'.$category.'%';

            // LEKÉRÉS LOGIKA - csak a fő posztok (ahol post_id IS NULL)
            $sql = "SELECT forum.*, users.username, users.ppicture
                    FROM forum
                    JOIN users ON forum.user_id = users.id
                    WHERE forum.post_id IS NULL AND forum.content ILIKE :tag
                    ORDER BY $orderBy";

            $stmt = $db->prepare($sql);
            $stmt->execute(['tag' => $newTag]);
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(["post" => $posts, "orderby" => $orderBy]);
            exit; // Megállítjuk a futást, hogy ne küldjön több adatot!
        }

        // Szabad hashtag keresés (pl. #fabia)
        if ($tag) {
            $tag = strtolower(trim($tag));
            if ($tag !== '') {
                if ($tag[0] === '#') {
                    $tag = substr($tag, 1);
                }
                // egyszerű sanitization: csak [a-z0-9_-] maradjon
                $tag = preg_replace('/[^a-z0-9_-]/', '', $tag);
                if ($tag !== '') {
                    $whereParts[] = "forum.content ILIKE :tag";
                    $params[":tag"] = "%#{$tag}%";
                }
            }

            $whereSql = implode(" AND ", $whereParts);

            // LEKÉRÉS LOGIKA - csak a fő posztok (ahol post_id IS NULL)
            $sql = "SELECT forum.*, users.username, users.ppicture
                    FROM forum
                    JOIN users ON forum.user_id = users.id
                    WHERE forum.post_id IS NULL AND {$whereSql}
                    ORDER BY $orderBy";

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(["post" => $posts]);
            exit; // Megállítjuk a futást, hogy ne küldjön több adatot!
        }

    }

    if ($method === 'POST') {
        // REAKCIÓ LOGIKA
        $data = json_decode(file_get_contents("php://input"), true);
        $postId = $data['id'] ?? "";
        $type = $data['action'] ?? "";
        $userid = decryptUserId($data['userId']);

        if ($userid === false) {
            echo json_encode(["success" => false, "message" => "Érvénytelen azonosító!"]);
            exit;
        }

        $db->beginTransaction();

    try {

        $stmt = $db->prepare("SELECT lordl FROM likes WHERE userid = :userid AND postid = :postid FOR UPDATE");
        $stmt->execute([
            ":userid" => $userid,
            ":postid" => $postId
        ]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($postId && ($type === 'likes' || $type === 'dislikes')) {

            $stmt = $db->prepare("SELECT * FROM likes WHERE userid = :userid AND postid = :postid LIMIT 1");
            $stmt->execute([":userid" => $userid, ":postid" => $postId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if(!$user) {        
                if ($type === 'likes') {
                    $stmt = $db->prepare("UPDATE forum SET likes = likes + 1 WHERE id = :id");
                    $stmt->execute([":id" => $postId]);
                    $stmt = $db->prepare("INSERT INTO likes (userid, postid, lordl) VALUES (:userid, :postid, 1)");
                    $stmt->execute([":userid" => $userid, ":postid" => $postId]);
                }
                if ($type === 'dislikes') {
                    $stmt = $db->prepare("UPDATE forum SET dislikes = dislikes + 1 WHERE id = :id");
                    $stmt->execute([":id" => $postId]);
                    $stmt = $db->prepare("INSERT INTO likes (userid, postid, lordl) VALUES (:userid, :postid, 0)");
                    $stmt->execute([":userid" => $userid, ":postid" => $postId]);
                }
            }
            if($user){
                if($user['lordl'] == 1 && $type === 'likes'){
                    $stmt = $db->prepare("UPDATE forum SET likes = likes - 1 WHERE id = :id");
                    $stmt->execute([":id" => $postId]);
                    $stmt = $db->prepare("DELETE FROM likes WHERE userid = :userid AND postid = :postid");
                    $stmt->execute([":userid" => $userid, ":postid" => $postId]);
                }
                if($user['lordl'] == 0 && $type === 'dislikes'){
                    $stmt = $db->prepare("UPDATE forum SET dislikes = dislikes - 1 WHERE id = :id");
                    $stmt->execute([":id" => $postId]);
                    $stmt = $db->prepare("DELETE FROM likes WHERE userid = :userid AND postid = :postid");
                    $stmt->execute([":userid" => $userid, ":postid" => $postId]);
                }
                if($user['lordl'] == 1 && $type === 'dislikes'){
                    $stmt = $db->prepare("UPDATE forum SET likes = likes - 1, dislikes = dislikes + 1 WHERE id = :id");
                    $stmt->execute([":id" => $postId]);
                    $stmt = $db->prepare("UPDATE likes SET lordl = 0 WHERE userid = :userid AND postid = :postid");
                    $stmt->execute([":userid" => $userid, ":postid" => $postId]);
                }
                if($user['lordl'] == 0 && $type === 'likes'){
                    $stmt = $db->prepare("UPDATE forum SET dislikes = dislikes - 1, likes = likes + 1 WHERE id = :id");
                    $stmt->execute([":id" => $postId]);
                    $stmt = $db->prepare("UPDATE likes SET lordl = 1 WHERE userid = :userid AND postid = :postid");
                    $stmt->execute([":userid" => $userid, ":postid" => $postId]);
                }
            }
        $stmt = $db->prepare("SELECT likes, dislikes FROM forum WHERE id = :id");
        $stmt->execute([":id" => $postId]);
        $counts = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true, 
            "like" => $counts['likes'], 
            "dislike" => $counts['dislikes']
        ]);
        }

            $db->commit();

        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }
    }
?>