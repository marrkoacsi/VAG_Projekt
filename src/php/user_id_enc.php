<?php

    function encryptUserId($id) {
        $key = 'ezmiatokulcskulcs_32_karakter';
        $method = 'aes-256-ctr';
        $ivLength = openssl_cipher_iv_length($method);
        $iv = openssl_random_pseudo_bytes($ivLength);
        
        $encrypted = openssl_encrypt($id, $method, $key, 0, $iv);
        
        return base64_encode($iv . $encrypted);
    }

    function decryptUserId($data) {
        $key = 'ezmiatokulcskulcs_32_karakter';
        $method = 'aes-256-ctr';
        $data = base64_decode($data);
        $ivLength = openssl_cipher_iv_length($method);
        $iv = substr($data, 0, $ivLength);
        $encrypted = substr($data, $ivLength);
        
        return openssl_decrypt($encrypted, $method, $key, 0, $iv);
    }

?>