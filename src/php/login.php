<?php

    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";
    require "autoload.php";
    require "user_id_enc.php";

    use PHPMailer\PHPMailer\PHPMailer;        // <-- ATIRVA
    use PHPMailer\PHPMailer\Exception;        // <-- ATIRVA

    $data = json_decode(file_get_contents("php://input"), true);
    $email = $data["email"] ?? "";
    $password = $data["password"] ?? "";


    $stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "not found"]);
        exit;
    }

    if (password_verify($password, $user["password_hash"])) {
        if ($user["verified"] === 0) {
            echo json_encode(["success" => false, "message" => "not verified"]);
            exit;
        }

        // opcionális: sikeres login után próbálkozások reset
        $db->prepare("UPDATE users SET tries = 5 WHERE email = :email") // <-- ATIRVA: reset tries sikeres loginra
        ->execute([":email" => $email]);

        echo json_encode(["success" => true, "username" => $user["username"], "id" => encryptUserId($user["id"]), "premium_type" => $user["premium_type"]]);

        exit;
    }

    // ---------------------------------------------------------------------------------------------------------------------------------------------------------

    // <-- ATIRVA: helyesen számoljuk ki a maradék próbát és azt mentjük
    $remaining = max(($user["tries"]) - 1, 0);

    $db->prepare("UPDATE users SET tries = :t WHERE email = :email") // <-- ATIRVA
    ->execute([":t" => $remaining, ":email" => $email]);

    // <-- ATIRVA: a friss maradékot küldjük vissza, nem a régi $user[tries]-t
    echo json_encode(["success" => false, "message" => $remaining." Próbálkozás maradt"]);

    // <-- ATIRVA: akkor küldünk helyreállító kódot, ha most fogyott el
    if ($remaining === 0) {

        // <-- ATIRVA: 6 jegyű kód, vezető nullákkal is
        $code = str_pad(random_int(0, 999999), 6, "0", STR_PAD_LEFT);

        // <-- ATIRVA: PHPMailer + Resend SMTP (mail() helyett)
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = getenv('MAIL_HOST');
            $mail->SMTPAuth = true;

            $mail->Username = getenv('MAIL_USERNAME');
            $mail->Password = getenv('MAIL_PASSWORD');

            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;


            $from = getenv("MAIL_FROM") ?: "info@vagforum.store"; // <-- ATIRVA: Render env var, fallback
            $mail->setFrom($from, "VAG Forum");
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->CharSet = "UTF-8";
            $mail->Subject = "Jelszó visszaállítás VAG Forum";
            $mail->Body = "<p>Kedves {$user['username']}!</p>
                        <p>Ezzel a kóddal tudja megváltoztatni a jelszót:</p>
                        <h2>{$code}</h2>";

            $mail->send();

            // <-- ATIRVA: kód elmentése DB-be (csak sikeres küldés után)
            $db->prepare("UPDATE users SET verification = :v WHERE email = :email")
            ->execute([":v" => $code, ":email" => $email]);

        } catch (Exception $e) {
            // <-- ATIRVA: ha nem ment ki, legalább logolható üzenet menjen vissza (fejlesztéshez)
            // élesben inkább ne add vissza az ErrorInfo-t
            echo json_encode(["success" => false, "message" => "mail error: " . $mail->ErrorInfo]);
        }
    }

    exit;
?>
