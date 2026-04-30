<?php

    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";
    require "user_id_enc.php";
    require "vendor/autoload.php";

    use Cloudinary\Configuration\Configuration;
    use Cloudinary\Api\Upload\UploadApi;

    // Cloudinary config with fallback values
    $cloudName = getenv('CLOUDINARY_CLOUD_NAME');
    $apiKey = getenv('CLOUDINARY_API_KEY');
    $apiSecret = getenv('CLOUDINARY_API_SECRET');
    
    Configuration::instance([
        'cloud' => [
            'cloud_name' => $cloudName,
            'api_key'    => $apiKey,
            'api_secret' => $apiSecret
        ],
        'url' => [
            'secure' => true
        ]
    ]);

    //userId beolvasása POST-ból és dekódolása
    $userId = decryptUserId($_POST["userId"]);

    // user adatainak lekérése a törléshez szükséges email cím és username miatt
    $file = $_FILES["ppicture"];

    // upload error
    if ($file["error"] !== UPLOAD_ERR_OK) {
        echo json_encode([
            "ok" => false,
            "message" => "Feltöltési hiba"
        ]);
        exit;
    }


    // fotó méret/felbontás ha valami nem stimm hibaüzi (10MB)
    if ($file["size"] > 10 * 1024 * 1024) {
        echo json_encode([
            "ok" => false,
            "message" => "Túl nagy fájl"
        ]);
        exit;
    }

    //fotó kiterjesztés ellenőrzése ha nem támogatott hibaüzi
    $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));
    $allowed = ["jpg", "jpeg", "png", "webp", "gif"];

    if (!in_array($ext, $allowed)) {
        echo json_encode([
            "ok" => false,
            "message" => "Nem támogatott fájl"
        ]);
        exit;
    }

    // upload Cloudinary és DB update
    try {

        $uploadApi = new UploadApi();

        $result = $uploadApi->upload($file["tmp_name"], [
            "folder" => "vag_projekt_pp",
            "public_id" => "user_" . $userId . "_profile",
            "overwrite" => true,
            "resource_type" => "image",
            "transformation" => [
                ["width" => 400, "height" => 400, "crop" => "fill", "gravity" => "face"]
            ]
        ]);

        // feltöltés eredményének ellenőrzése ha nincs secure_url hibaüzi
        $url = $result["secure_url"] ?? null;

        // ha nincs URL hibaüzi (ami elvileg nem lehet mert a feltöltés sikeres volt, de biztos ami biztos)
        if (!$url) {
            echo json_encode([
                "ok" => false,
                "message" => "Nincs URL"
            ]);
            exit;
        }

        // DB update ha hiba akkor Cloudinary-ról töröljük a feltöltött képet és hibaüzi
        $stmt = $db->prepare("
            UPDATE users
            SET ppicture = :ppicture
            WHERE id = :id
        ");

        
        $stmt->execute([
            ":ppicture" => $url,
            ":id" => $userId
        ]);

        
        echo json_encode([
            "ok" => true,
            "url" => $url
        ]);
        exit;

    } catch (Exception $e) {
        
        // hiba esetén Cloudinary vagy DB hiba
        echo json_encode([
            "ok" => false,
            "message" => "Profilkép feltöltése sikertelen: " . $e->getMessage()
        ]);
        exit;
    }
?>
