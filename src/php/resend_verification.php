<?php

    header("Content-Type: application/json; charset=utf-8");

    require_once "db_connect.php";
    require_once "cors.php";
    require "autoload.php";

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    $data = json_decode(file_get_contents("php://input"), true);
    $email = trim($data["email"] ?? "");

    $stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
    $stmt->execute([":email" => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // kód generátor
    $code = str_pad(random_int(0, 999999), 6, "0", STR_PAD_LEFT);

    // adatbázis updateee
    $updateStmt = $db->prepare("UPDATE users SET verification = :code WHERE email = :email");
    $result = $updateStmt->execute([
        ":code" => $code,
        ":email" => $email
    ]);

    // emaail kuldese
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
        $mail->addAddress($email);

        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Subject = "Új megerősítő kód - VAG Forum";
        $mail->Body = "<p>Kedves {$user['username']}!</p>
                    <p>Ezzel az új kóddal tudja aktiválni a fiókját:</p>
                    <h2>{$code}</h2>
                    <p>A kód 10 percig érvényes.</p>";

        $mail->send();

        echo json_encode(["success" => true, "message" => "Új megerősítő kód elküldve"]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Email küldési hiba: " . $mail->ErrorInfo]);
    }

?>
