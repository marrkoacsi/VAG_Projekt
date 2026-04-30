import { useState } from "react";
import { Link } from "react-router-dom"; 

export default function handleLogout() {

    // töröljük a localStorage-t
    localStorage.removeItem("user");
    
    window.location.reload("/"); 

}
