<?php   

    header("Content-Type: application/json; charset=utf-8");

    require_once "db_connect.php";
    require_once "cors.php";
    require "autoload.php";

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;

    $data = json_decode(file_get_contents("php://input"), true);

    $email = trim($data["email"] ?? "");
    $password = $data["password"] ?? "";
    $password_confirm = $data["password_confirm"] ?? "";
    $username = trim($data["username"] ?? "");
    $first_name = trim($data["first_name"] ?? "");
    $last_name = trim($data["last_name"] ?? "");
    $birth_date = $data["birth_date"] ?? null;
    $gender = $data["gender"] ?? "";

    if ($email === "" || $password === "" || $username === "" || $password !== $password_confirm) {
        echo json_encode(["success" => false, "message" => "Hibás adatok."]);
        exit;
    }

    if (!$birth_date) {
        echo json_encode(["success" => false, "message" => "A születési dátum megadása kötelezõ!"]);
        exit;
    }

    $birth_date_obj = new DateTime($birth_date);
    $today = new DateTime();
    $min_date = new DateTime('1950-01-01');
    
    if ($birth_date_obj < $min_date) {
        echo json_encode(["success" => false, "message" => "A születési dátum nem lehet korábbi mint 1950.01.01!"]);
        exit;
    }
    
    $age = $today->diff($birth_date_obj)->y;
    if ($age < 16) {
        echo json_encode(["success" => false, "message" => "A regisztrációhoz legalább 16 évesnek kell lenned!"]);
        exit;
    }

    // email / username ellenőrzés
    $stmt = $db->prepare("SELECT COUNT(*) FROM users WHERE email = :email OR username = :username");
    $stmt->execute([
        ":email" => $email,
        ":username" => $username
    ]);

    if ($stmt->fetchColumn() > 0) {
        echo json_encode(["success" => false, "message" => "Az email vagy felhasználónév már foglalt."]);
        exit;
    }

    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $verification = random_int(100000, 999999);

    // user beszúrás
    $stmt = $db->prepare("
        INSERT INTO users 
        (email, password_hash, username, first_name, last_name, birth_date, gender, verification, premium_type, premium_until)
        VALUES 
        (:email, :password_hash, :username, :first_name, :last_name, :birth_date, :gender, :verification, 0, NULL)
    ");

    $result = $stmt->execute([
        ":email" => $email,
        ":password_hash" => $password_hash,
        ":username" => $username,
        ":first_name" => $first_name,
        ":last_name" => $last_name,
        ":birth_date" => $birth_date,
        ":gender" => $gender,
        ":verification" => $verification
    ]);

    if (!$result) {
        echo json_encode(["success" => false, "message" => "Adatbázis hiba."]);
        exit;
    }

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
            $mail->CharSet = 'UTF-8';
            $mail->Subject = "Sikeres regisztráció!";
            $mail->Body = "<p>Kedves {$last_name}!</p>
                        <p>Ezzel a kóddal tudja aktiválni a fiókját:</p>
                        <h2>{$code}</h2>";

            $mail->send();

            // <-- ATIRVA: kód elmentése DB-be (csak sikeres küldés után)
            $db->prepare("UPDATE users SET verification = :v WHERE email = :email")
            ->execute([":v" => $code, ":email" => $email]);

        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => "mail error: " . $mail->ErrorInfo]);
        }

    echo json_encode(["success" => true, "email" =>$email]);

?>
