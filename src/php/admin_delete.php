<?php

    header('Content-Type: application/json');

    require "db_connect.php";
    require "cors.php";

    $data = json_decode(file_get_contents("php://input"), true);

    $id = $data["id"] ?? 0;

    if(!$id) {
        echo json_encode(["success"=>false, "message"=>"Nincs ID megadva"]);
        exit;
    }

    if($id){

        $stmt = $db->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([":id"=>$id]);

        echo json_encode(["success"=>true]);
    } else {
        echo json_encode(["success"=>false, "message"=>"Hiba történt"]);
    }

?>