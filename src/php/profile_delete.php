<?php

header('Content-Type: application/json; charset=utf-8');

require "db_connect.php";
require "cors.php";

require __DIR__ . "/phpmailer/phpmailer/src/Exception.php";
require __DIR__ . "/phpmailer/phpmailer/src/PHPMailer.php";
require __DIR__ . "/phpmailer/phpmailer/src/SMTP.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

try {
    // JSON beolvasás
    $data = json_decode(file_get_contents("php://input"), true);
    if (!is_array($data)) {
        $data = [];
    }

    $action = $data["action"] ?? "";
    $userId = ($data["userId"] ?? 0);

    // Törlés kérése
    if ($action === "request_delete") {
        // user adatainak lekérése a törléshez szükséges email cím és username miatt
        $stmt = $db->prepare("SELECT id, email, username FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([":id" => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // törlési kód generálása és eltárolása adatbázisban
        $deleteCode = str_pad((string)random_int(0, 999999), 6, "0", STR_PAD_LEFT);

        // a törlési kód 15 percig érvényes
        $deleteExpires = date("Y-m-d H:i:s", strtotime("+15 minutes"));

        // a delete_code és delete_expires mezők frissítése a user táblában
        $stmt = $db->prepare("
            UPDATE users 
            SET delete_code = :code, delete_expires = :exp 
            WHERE id = :id
        ");
        $stmt->execute([
            ":code" => $deleteCode,
            ":exp"  => $deleteExpires,
            ":id"   => $userId
        ]);

        // Email küldése a törlési kóddal
        try {
            $mail = new PHPMailer(true);

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
            $mail->Subject = "Fiók törlés megerősítése";
            $mail->Body = "
                <h2>Fiók törlés</h2>
                <p>A törlési kódod:</p>
                <h1>{$deleteCode}</h1>
                <p>Ez 15 percig érvényes.</p>
            ";

            $mail->send();

        } catch (Exception $e) {
            echo json_encode([
                "ok" => false,
                "message" => "Email küldési hiba"
            ]);
            exit;
        }

        // sikeres kód generálás és email küldés után visszajelzés a frontendnek
        echo json_encode([
            "ok" => true,
            "message" => "Kód elküldve emailben"
        ]);
        exit;
    }

    // Törlés megerősítése
    if ($action === "confirm_delete") {
        $code = trim($data["code"] ?? "");
        $password = $data["password"] ?? "";

        // user adatainak lekérése a törléshez szükséges jelszó hash, törlési kód és lejárati idő miatt
        $stmt = $db->prepare("
            SELECT password_hash, delete_code, delete_expires 
            FROM users 
            WHERE id = :id
        ");
        $stmt->execute([":id" => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user["delete_code"] !== $code) {
            echo json_encode([
                "ok" => false,
                "message" => "Hibás kód"
            ]);
            exit;
        }

        if (empty($user["delete_expires"]) || strtotime($user["delete_expires"]) < time()) {
            echo json_encode([
                "ok" => false,
                "message" => "Lejárt kód"
            ]);
            exit;
        }

        if (!password_verify($password, $user["password_hash"])) {
            echo json_encode([
                "ok" => false,
                "message" => "Hibás jelszó"
            ]);
            exit;
        }

        $db->beginTransaction();

        try {
            // forum törlés
            $stmt = $db->prepare("DELETE FROM forum WHERE user_id = :id");
            $stmt->execute([":id" => $userId]);

            // user törlés
            $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([":id" => $userId]);

            $db->commit();

            echo json_encode([
                "ok" => true,
                "message" => "Fiók törölve"
            ]);
            exit;

        } catch (Throwable $e) {
            $db->rollBack();

            echo json_encode([
                "ok" => false,
                "message" => "Törlés sikertelen"
            ]);
            exit;
        }
    }

} catch (Throwable $e) {
    echo json_encode([
        "ok" => false,
        "message" => "Szerver hiba"
    ]);
    exit;
}
?>
