<?php

    require "db_connect.php";
    require "cors.php";
    require "user_id_enc.php";

    // Csak POST kérést fogadunk
    $data = json_decode(file_get_contents("php://input"), true);
    $token = $data["token"] ?? "";

    // 1. Token ellenőrzése a Google API-n keresztül (SDK nem szükséges)
    $verify = @file_get_contents("https://oauth2.googleapis.com/tokeninfo?id_token=" . $token);

    $payload = json_decode($verify, true);

    if (isset($payload['email'])) {
        $email = $payload['email'];
        $name = $payload['name'] ?? explode('@', $email)[0]; // Ha nincs név, az email elejét használjuk

        // 2. Felhasználó keresése az adatbázisban
        $stmt = $db->prepare("SELECT username, id, premium_type FROM users WHERE email = :email LIMIT 1");
        $stmt->execute([":email" => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            // 3. ÚJ FELHASZNÁLÓ REGISZTRÁCIÓJA
            // Üres jelszót adunk, mert Google-lel regisztrált
            $stmt = $db->prepare("INSERT INTO users (username, email, password_hash, verified, tries) VALUES (:u, :e, '', 1, 5)");
            $stmt->execute([
                ":u" => $name,
                ":e" => $email
            ]);
            $username = $name;
        } else {
            // 4. LÉTEZŐ FELHASZNÁLÓ
            $username = $user["username"];
            // Frissítjük a státuszt: verified legyen és a próbálkozások száma resetelődjön
            $db->prepare("UPDATE users SET verified = 1, tries = 5 WHERE email = :email")
            ->execute([":email" => $email]);
        }

        echo json_encode([
            "success" => true,
            "username" => $username,
            "id" => encryptUserId($user["id"] ?? $db->lastInsertId()), // Visszaadjuk az újonnan létrehozott felhasználó ID-jét, vagy a meglévőét
            "premium_type" => $user["premium_type"] ?? 0 // Új felhasználónak 0, meglévőnek a DB-ből
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Érvénytelen Google profil"]);
    }
?>