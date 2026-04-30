<?php

    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";
    require "vendor/autoload.php";

    use Cloudinary\Configuration\Configuration;
    use Cloudinary\Api\Upload\UploadApi;

    Configuration::instance([
        'cloud' => [
            'cloud_name' => getenv('CLOUDINARY_CLOUD_NAME'),
            'api_key'    => getenv('CLOUDINARY_API_KEY'),
            'api_secret' => getenv('CLOUDINARY_API_SECRET')
        ],
        'url' => [
            'secure' => true
        ]
    ]);
    
    // Beérkező adatok beolvasása
    $username = $_POST['username'] ?? null;
    $postname = $_POST['name'] ?? null;
    $content  = $_POST['post'] ?? null;

    // Kötelező: legalább 1 márka hashtag a tartalomban (pl. #skoda),
    // és közben meghatározzuk a brand_id-t is.
    $normalized = strtolower($content);
    $brandId = null;

    if (strpos($normalized, '#vw') !== false || strpos($normalized, '#volkswagen') !== false) {
        $brandId = 1; // VW
    } elseif (strpos($normalized, '#skoda') !== false) {
        $brandId = 2; // Škoda
    } elseif (strpos($normalized, '#seat') !== false) {
        $brandId = 3; // SEAT
    } elseif (strpos($normalized, '#audi') !== false) {
        $brandId = 4; // Audi
    }

    if ($brandId === null) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Adj meg legalább 1 márka hashtaget a posztban (pl. #vw / #skoda / #seat / #audi)."
        ]);
        exit;
    }

    $stmt = $db->prepare("SELECT id FROM users WHERE username = :username LIMIT 1");
    $stmt->execute([":username" => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    $fileUrl = null;

    if (!empty($_FILES['file']['name'])) {

        $file = $_FILES['file'];

        if ($file['size'] > 15 * 1024 * 1024) {
            echo json_encode(["success" => false, "message" => "Max 15MB fájl engedélyezett"]);
            exit;
        }

        $fileName = $file['name'];
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        try {

            $uploadApi = new UploadApi();

            $options = [
                'folder' => 'vag_projekt_forum',
                'resource_type' => 'auto',
                'use_filename' => true,
                'unique_filename' => true,
                'overwrite' => false
            ];

            if (in_array($extension, ['jpg','jpeg','png','webp','gif'])) {
                $options['transformation'] = [
                   ['width' => 1000, 'height' => 800, 'crop' => 'fill']
                ];
            }

            $result = $uploadApi->upload($file['tmp_name'], $options);

            $fileUrl = $result['secure_url'] ?? null;

        } catch (Exception $e) {
            // Ha a feltöltés elhasal (pl. rossz Cloudinary config), ne álljon le az egész poszt,
            // csak maradjon null a file_url.
            $fileUrl = null;
        }
    }

    $stmt = $db->prepare("
        INSERT INTO forum 
        (brand_id, user_id, name, content, file_name, date)
        VALUES 
        (:brand_id, :user_id, :name, :content, :file_name, NOW())
    ");

    $result = $stmt->execute([
        ":brand_id" => $brandId,
        ":user_id" => $user["id"],
        ":name" => $postname,
        ":content" => $content,
        ":file_name" => $fileUrl
    ]);

    if ($result) {
        echo json_encode([
            "success" => true
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Adatbázis hiba"
        ]);
    }

    exit;
?>