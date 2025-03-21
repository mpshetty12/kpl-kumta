import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./logc.css";

const teamPasswords = {
    1: "0p1",
    2: "1p2",
    3: "2p3",
    4: "3p4",
    5: "4p5",
    6: "5p6",
    7: "6p7",
    8: "7p8",
    9: "8p9",
    10: "9p10",
    11: "10p11",
    12: "11p12",
    13: "12p13",
    14: "13p14",
    15: "14p15",
    16: "15p16",
    17: "16p17",
    18: "17p18",
    19: "18p19",
    20: "19p20"
};

const LoginPage = () => {
    const [teamId, setTeamId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        const teamPassword = teamPasswords[teamId];
        if (teamPassword && teamPassword === password) {
            sessionStorage.setItem("teamId", teamId);
            sessionStorage.setItem("loggedInTime", Date.now());
            navigate("/bidding");
        } else {
            setError("Invalid Team ID or Password");
        }
    };

    return (
        <div className="login-container">
            <div className="login-banner">
                <h1>Welcome to KPL-2025 Bidding</h1>
                <p>Join the excitement and bid for your winning team! </p>
                <p><strong>will open on December 22nd 2pm</strong></p>
            </div>
            <div className="login-form">
                <h2>Team Login</h2>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="text"
                    placeholder="Team ID"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                />
                <button onClick={handleLogin} className="login-button">Login</button>
            </div>
        </div>
    );
};

export default LoginPage;
