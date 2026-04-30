<?php

    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";
    require "vendor/autoload.php";
    require "autoload.php";
    require "user_id_enc.php";


    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    $method = $_SERVER['REQUEST_METHOD'];

    // JSON beolvasása és alapértelmezett értékek beállítása
    $data = json_decode(file_get_contents("php://input"), true);
    if (!is_array($data)) {
        $data = [];
    }

    $action = $data["action"] ?? "";
    $userId = decryptUserId($_POST["userId"]);
    
    //user lekérdezés
    $stmt = $db->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
    $stmt->execute([
        ":id" => $userId
    ]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode([
            "ok" => false,
            "message" => "Felhasználó nem található"
        ]);
        exit;
    }

    
    // 1. Jelszó módosítás
    
    if ($action === "change_password") {
        $current = trim($data["current_password"] ?? "");
        $new = trim($data["new_password"] ?? "");
        $confirm = trim($data["new_password_confirm"] ?? "");

        if ($current === "" || $new === "" || $confirm === "") {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Tölts ki minden mezőt"
            ]);
            exit;
        }

        if ($new !== $confirm) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Az új jelszavak nem egyeznek"
            ]);
            exit;
        }

        if (strlen($new) < 6) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Minimum 6 karakter"
            ]);
            exit;
        }

        if (!password_verify($current, $user["password_hash"])) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Hibás jelenlegi jelszó"
            ]);
            exit;
        }

        $stmt = $db->prepare("UPDATE users SET password_hash = :hash WHERE id = :id");
        $stmt->execute([
            ":hash" => password_hash($new, PASSWORD_BCRYPT),
            ":id" => $userId
        ]);

        echo json_encode([
            "ok" => true
        ]);
        exit;
    }

   
    //2. Jelszó módosítás kérés
    
    if ($action === "request_password_change") {
        $code = str_pad(random_int(0, 999999), 6, "0", STR_PAD_LEFT);
        $expires = (new DateTime("+10 minutes"))->format("Y-m-d H:i:s");

        $stmt = $db->prepare("
            UPDATE users
            SET password_change_code = :code,
                password_change_expires = :expires
            WHERE id = :id
        ");
        $stmt->execute([
            ":code" => $code,
            ":expires" => $expires,
            ":id" => $userId
        ]);

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = getenv('MAIL_HOST');
            $mail->SMTPAuth = true;
            $mail->Username = getenv('MAIL_USERNAME');
            $mail->Password = getenv('MAIL_PASSWORD');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $from = getenv("MAIL_FROM") ?: "info@vagforum.store";
            $mail->setFrom($from, "VAG Forum");
            $mail->addAddress($user["email"]);

            $mail->isHTML(true);
            $mail->CharSet = "UTF-8";
            $mail->Subject = "Jelszó módosítás - VAG Forum";
            $mail->Body = "<p>Jelszó módosításhoz add meg ezt a kódot:</p><h2>{$code}</h2><p>A kód 10 percig érvényes.</p>";

            $mail->send();

            echo json_encode([
                "ok" => true
            ]);
            exit;

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "ok" => false,
                "message" => "Email küldési hiba"
            ]);
            exit;
        }
    }

    
    //3. Jelszó módosítás megerősítés
    
    if ($action === "confirm_password_change") {
        $code = trim($data["code"] ?? "");
        $new = trim($data["new_password"] ?? "");
        $confirm = trim($data["new_password_confirm"] ?? "");

        if ($code === "" || $new === "" || $confirm === "") {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Hiányzó adatok"
            ]);
            exit;
        }

        if ($new !== $confirm) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Az új jelszavak nem egyeznek"
            ]);
            exit;
        }

        if (strlen($new) < 6) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Minimum 6 karakter"
            ]);
            exit;
        }

        if (empty($user["password_change_code"]) || empty($user["password_change_expires"])) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Nincs folyamatban jelszó módosítás"
            ]);
            exit;
        }

        if ($code !== $user["password_change_code"] || strtotime($user["password_change_expires"]) < time()) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Érvénytelen vagy lejárt kód"
            ]);
            exit;
        }

        $stmt = $db->prepare("
            UPDATE users
            SET password_hash = :hash,
                password_change_code = NULL,
                password_change_expires = NULL
            WHERE id = :id
        ");
        $stmt->execute([
            ":hash" => password_hash($new, PASSWORD_BCRYPT),
            ":id" => $userId
        ]);

        echo json_encode([
            "ok" => true
        ]);
        exit;
    }

   
    //4. Email módosítás kérés
    
    if ($action === "request_email_change") {
        $newEmail = trim($data["new_email"] ?? "");

        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1");
        $stmt->execute([
            ":email" => $newEmail,
            ":id" => $userId
        ]);

        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Az email már foglalt"
            ]);
            exit;
        }

        $code = str_pad((string)random_int(0, 999999), 6, "0", STR_PAD_LEFT);
        $expires = (new DateTime("+10 minutes"))->format("Y-m-d H:i:s");

        $stmt = $db->prepare("
            UPDATE users
            SET pending_email = :pending_email,
                email_change_code = :code,
                email_change_expires = :expires
            WHERE id = :id
        ");
        $stmt->execute([
            ":pending_email" => $newEmail,
            ":code" => $code,
            ":expires" => $expires,
            ":id" => $userId
        ]);

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = getenv('MAIL_HOST');
            $mail->SMTPAuth = true;
            $mail->Username = getenv('MAIL_USERNAME');
            $mail->Password = getenv('MAIL_PASSWORD');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $from = getenv("MAIL_FROM") ?: "info@vagforum.store";
            $mail->setFrom($from, "VAG Forum");
            $mail->addAddress($newEmail);

            $mail->isHTML(true);
            $mail->CharSet = "UTF-8";
            $mail->Subject = "Email cím módosítás - VAG Forum";
            $mail->Body = "<p>Az email módosításhoz add meg ezt a kódot:</p><h2>{$code}</h2><p>A kód 10 percig érvényes.</p>";

            $mail->send();

            echo json_encode([
                "ok" => true
            ]);
            exit;

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "ok" => false,
                "message" => "Email küldési hiba"
            ]);
            exit;
        }
    }

    //5. Email módosítás megerősítés
    
    if ($action === "confirm_email_change") {
        $code = trim($data["code"] ?? "");

        if ($code === "") {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Hiányzó kód"
            ]);
            exit;
        }

        if ($code !== $user["email_change_code"] || strtotime($user["email_change_expires"]) < time()) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Érvénytelen vagy lejárt kód"
            ]);
            exit;
        }

        $stmt = $db->prepare("SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1");
        $stmt->execute([
            ":email" => $user["pending_email"],
            ":id" => $userId
        ]);

        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode([
                "ok" => false,
                "message" => "Az email már foglalt"
            ]);
            exit;
        }

        $stmt = $db->prepare("
            UPDATE users
            SET email = :email,
                pending_email = NULL,
                email_change_code = NULL,
                email_change_expires = NULL
            WHERE id = :id
        ");
        $stmt->execute([
            ":email" => $user["pending_email"],
            ":id" => $userId
        ]);

        echo json_encode([
            "ok" => true
        ]);
        exit;
    }
?>
