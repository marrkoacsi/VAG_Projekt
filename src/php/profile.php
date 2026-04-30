<?php

    header('Content-Type: application/json; charset=utf-8');
    
    require "db_connect.php";
    require "cors.php";
    require "user_id_enc.php";

    
    try {
        // request body beolvasása, ha JSON akkor tömbbé alakítjuk, különben üres tömb
        $data = json_decode(file_get_contents("php://input"), true);
    
        // action és userId kinyerése
        $action = $data["action"] ?? "";
        $userId = decryptUserId($data['userId'] ?? "") ?? "";

        if ($action === "get_by_username") {
            $username = trim((string)($data["username"] ?? ""));

            $stmt = $db->prepare("
                SELECT 
                    id,
                    username,
                    email,
                    first_name,
                    last_name,
                    gender,
                    birth_date,
                    car_model,
                    ppicture,
                    premium_type,
                    registration_date
                FROM users
                WHERE username = :username
                LIMIT 1
            ");

            $stmt->execute([":username" => $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                echo json_encode([
                    "ok" => false,
                    "message" => "User nem található"
                ]);
                exit;
            }

            echo json_encode([
                "ok" => true,
                "user" => $user
            ]);
            exit;
        }

        // lekerdezes posztok
        if ($action === "get_posts") {
            $profileUserId = $data['profileUserId'] ?? decryptUserId($data['userId']);

            $limit = isset($data['limit']) ? (int)$data['limit'] : 20;
            $offset = isset($data['offset']) ? (int)$data['offset'] : 0;

            $stmt = $db->prepare("
                SELECT 
                    f.id,
                    f.brand_id,
                    f.problem_id,
                    f.post_id,
                    SUBSTRING(MD5(CONCAT(f.user_id, 'your_secret_salt_key')), 1, 8) as user_id_hash,
                    f.name,
                    f.content,
                    f.view_count,
                    f.date,
                    f.likes,
                    f.dislikes,
                    f.reply_count,
                    f.file_name,
                    CASE 
                        WHEN f.user_id = :current_user_id THEN true 
                        ELSE false 
                    END as is_own_post
                FROM forum f
                WHERE f.user_id = :profile_user_id AND f.post_id IS NULL
                ORDER BY f.date DESC
                LIMIT :limit OFFSET :offset
            ");

            $stmt->execute([
                ":profile_user_id" => $profileUserId,
                ":current_user_id" => $userId,
                ":limit" => $limit,
                ":offset" => $offset
            ]);

            $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Összes poszt 
            $countStmt = $db->prepare("
                SELECT COUNT(*) as total
                FROM forum
                WHERE user_id = :profile_user_id AND post_id IS NULL
            ");
            $countStmt->execute([":profile_user_id" => $profileUserId]);
            $totalPosts = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            echo json_encode([
                "ok" => true,
                "posts" => $posts,
                "total" => (int)$totalPosts,
                "limit" => $limit,
                "offset" => $offset
            ]);
            exit;
        }
    
        // Profile lekérése db-ból
        if ($action === "get") {

            $decryptedUserId = decryptUserId($data['userId']);
            
            $stmt = $db->prepare("
                SELECT 
                    id,
                    username,
                    email,
                    first_name,
                    last_name,
                    gender,
                    birth_date,
                    car_model,
                    ppicture,
                    premium_type,
                    registration_date
                FROM users
                WHERE id = :id
                LIMIT 1
            ");
    
            $stmt->execute([":id" => $decryptedUserId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
            if (!$user) {
                echo json_encode([
                    "ok" => false,
                    "message" => "User nem található"
                ]);
                exit;
            }
    
            echo json_encode([
                "ok" => true,
                "user" => $user
            ]);
            exit;
        }
    
        // PREMIUM FRISSÍTÉS
        if ($action === "update_premium") {
            $stmt = $db->prepare("
                SELECT id
                FROM users
                WHERE id = :id
                LIMIT 1
            ");
            $stmt->execute([":id" => decryptUserId($data['userId'])]);
    
            if (!$stmt->fetch()) {
                echo json_encode([
                    "ok" => false,
                    "message" => "User nem található"
                ]);
                exit;
            }

            $plan = trim($data["plan"] ?? "");
    
            if ($plan === "Pro Tag") {
                $premiumType = 1;
            } elseif ($plan === "Lifetime") {
                $premiumType = 2;
            } else {
                $premiumType = 0;
            }
    
            $stmt = $db->prepare("
                UPDATE users
                SET premium_type = :premium_type
                WHERE id = :id
            ");
    
            $stmt->execute([
                ":premium_type" => $premiumType,
                ":id" => $userId
            ]);
    
            echo json_encode([
                "ok" => true,
                "message" => "Premium csomag sikeresen frissítve",
                "premium_type" => $premiumType
            ]);
            exit;
        }
    
        // UPDATE PROFILE
        if ($action === "update") {
            // először ellenőrizzük, hogy létezik-e a user
            $stmt = $db->prepare("
                SELECT id
                FROM users
                WHERE id = :id
                LIMIT 1
            ");
            $stmt->execute([":id" => $userId]);
    
            if (!$stmt->fetch()) {
                echo json_encode([
                    "ok" => false,
                    "message" => "User nem található"
                ]);
                exit;
            }
    
            // mezök beolvasása trimelve, üres string -> null (kivéve a profil szerkesztésnél küldött mezöket)
            $username   = isset($data["username"])   ? trim($data["username"])   : null;
            $email      = isset($data["email"])      ? trim($data["email"])      : null;
            $first_name = isset($data["first_name"]) ? trim($data["first_name"]) : null;
            $last_name  = isset($data["last_name"])  ? trim($data["last_name"])  : null;
            $gender     = isset($data["gender"])     ? trim($data["gender"])     : null;
            $birth_date = isset($data["birth_date"]) ? trim($data["birth_date"]) : null;
            $car_model  = isset($data["car_model"])  ? trim($data["car_model"])  : null;
    
            if ($username !== null) {
                $stmt = $db->prepare("
                    SELECT id
                    FROM users
                    WHERE username = :u AND id <> :id
                    LIMIT 1
                ");
                $stmt->execute([
                    ":u"  => $username,
                    ":id" => $userId
                ]);
    
                if ($stmt->fetch()) {
                    echo json_encode([
                        "ok" => false,
                        "message" => "Username foglalt"
                    ]);
                    exit;
                }
            }
    
            if ($email !== null) {
                $stmt = $db->prepare("
                    SELECT id
                    FROM users
                    WHERE email = :e AND id <> :id
                    LIMIT 1
                ");
    
                $stmt->execute([
                    ":e"  => $email,
                    ":id" => $userId
                ]);
    
                if ($stmt->fetch()) {
                    echo json_encode([
                        "ok" => false,
                        "message" => "Email foglalt"
                    ]);
                    exit;
                }
            }
    
            // Build dynamic UPDATE query for fields that are being sent (including empty strings)
            $updateFields = [];
            $updateParams = [":id" => $userId];
            
            if (isset($data["username"])) {
                $updateFields[] = "username = :username";
                $updateParams[":username"] = $username;
            }
            if (isset($data["email"])) {
                $updateFields[] = "email = :email";
                $updateParams[":email"] = $email;
            }
            if (isset($data["first_name"])) {
                $updateFields[] = "first_name = :first_name";
                $updateParams[":first_name"] = $first_name;
            }
            if (isset($data["last_name"])) {
                $updateFields[] = "last_name = :last_name";
                $updateParams[":last_name"] = $last_name;
            }
            if (isset($data["gender"])) {
                $updateFields[] = "gender = :gender";
                $updateParams[":gender"] = $gender;
            }
            if (isset($data["birth_date"])) {
                $updateFields[] = "birth_date = :birth_date";
                $updateParams[":birth_date"] = $birth_date;
            }
            if (isset($data["car_model"])) {
                $updateFields[] = "car_model = :car_model";
                $updateParams[":car_model"] = $car_model;
            }
            
            $updateFieldsStr = implode(", ", $updateFields);
            $stmt = $db->prepare("
                UPDATE users SET
                    $updateFieldsStr
                WHERE id = :id
            ");
    
            $stmt->execute($updateParams);
    
            echo json_encode([
                "ok" => true,
                "message" => "Profil sikeresen frissítve"
            ]);
            exit;
        }
    
    } catch (Throwable $e) {
        
        echo json_encode([
            "ok" => false,
            "message" => "Szerver hiba történt: " . $e->getMessage()
        ]);
        exit;
    }
?>
