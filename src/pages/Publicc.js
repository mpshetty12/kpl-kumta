import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, getDoc, updateDoc, getDocs, collection } from "firebase/firestore";
import "./Publicc.css";
const messages = [
    "KPL 2025",
    "AUCTION ENTRY",
    "WELCOME EVERYONE",
    "ಕೆ ಪಿ ಎಲ್ - ೨೦೨೫",
    "ಆಟಗಾರರ ಹರಾಜು ಕಾರ್ಯಕ್ರಮ",
    "ಎಲ್ಲರಿಗೂ ಸ್ವಾಗತ"
];
const PubliccDisplay = () => {

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [letterIndex, setLetterIndex] = useState(0);

    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    useEffect(() => {
        const message = messages[currentMessageIndex];

        if (letterIndex < message.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + message[letterIndex]);
                setLetterIndex((prev) => prev + 1);
            }, 100); // Adjust speed of letter-by-letter display

            return () => clearTimeout(timeout);
        } else {
            const delay = setTimeout(() => {
                setDisplayedText("");
                setLetterIndex(0);
                setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
            }, 20000); // 20-second pause between messages

            return () => clearTimeout(delay);
        }
    }, [letterIndex, currentMessageIndex]);

    const [showMaxBidPoints, setShowMaxBidPoints] = useState(false);
    const [teamsMaxBidPoints, setTeamsMaxBidPoints] = useState([]);
    const viewMaxBidPoints = async () => {
        try {
            const teamsSnapshot = await getDocs(collection(db, "teams"));
            const teamMaxBidPoints = teamsSnapshot.docs.map((doc) => ({
                teamName: doc.data().team_name,
                maxBidPoint: doc.data().maxbidpoint,
            }));

            setTeamsMaxBidPoints(teamMaxBidPoints); // Store the max bid points in state
            setShowMaxBidPoints(true); // Show the max bid points section
        } catch (error) {
            console.error("Error fetching teams' max bid points:", error);
            alert("Failed to fetch teams' max bid points.");
        }
    };
    const [currentBidData, setCurrentBidData] = useState({
        team_id: "N/A",
        playercurrentbidpoint: 0,
        isClosed: false,
        winner: "N/A",
        winningBid: 0,
    });
    const [teamName, setTeamName] = useState("N/A");
    const [timer, setTimer] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState(null);

    useEffect(() => {
        if (currentBidData.team_id !== "N/A") {
            const fetchTeamName = async () => {
                const teamRef = doc(db, "teams", currentBidData.team_id);
                const teamSnapshot = await getDoc(teamRef);
                if (teamSnapshot.exists()) {
                    setTeamName(teamSnapshot.data().team_name || "Unknown Team");
                } else {
                    setTeamName("N/A");
                }
            };
            fetchTeamName();
        }
    }, [currentBidData.team_id]);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "bids", "currentBid"), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const bidData = docSnapshot.data();
                setCurrentBidData({
                    team_id: bidData.team_id || "N/A",
                    playercurrentbidpoint: bidData.playercurrentbidpoint || 0,
                    isClosed: bidData.isClosed || false,
                    winner: bidData.winner || "N/A",
                    winningBid: bidData.winningBid || 0,
                    playerFmcid:bidData.playerFmcid || 0,
                    playerName:bidData.playerName || ""
                });
                if (bidData.time) {
                    setTimer(bidData.time);
                }
                if (bidData.playerId) {
                    const playerRef = doc(db, "users", bidData.playerId);
                    getDoc(playerRef).then((playerDoc) => {
                        if (playerDoc.exists()) {
                            setCurrentPlayer(playerDoc.data());
                        }
                    });
                }
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (timer === 0) {
            const currentBidRef = doc(db, "bids", "currentBid");
            updateDoc(currentBidRef, { time: 0 }).catch(console.error);
            return;
        }

        const timerInterval = setInterval(() => {
            setTimer((prevTimer) => {
                const newTimer = prevTimer > 0 ? prevTimer - 1 : 0;
                const currentBidRef = doc(db, "bids", "currentBid");
                updateDoc(currentBidRef, { time: newTimer }).catch(console.error);
                return newTimer;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [timer]);

    return (
        <div className="kpl-container">
            {currentBidData.isClosed ? (
                <div className="winning-overlay">
                    <h1 className="winner-announcement">🏆SOLDOUT :  {teamName} - {currentBidData.winningBid} POINTS 🏆</h1>
                    <h1><strong>FMC ID  : {currentBidData.playerFmcid}</strong></h1>
                    <h1><strong>Player Name  : {currentBidData.playerName}</strong></h1>
                    <button onClick={viewMaxBidPoints} >View All Teams' Max Bid Points </button>
                    {showMaxBidPoints && (
                                <div className="max-bid-points">
                                    <h3>All Teams' Max Bid Points:</h3>
                                    <ul>
                                        {teamsMaxBidPoints.map((team, index) => (
                                            <li key={index}>
                                                {team.teamName}: {team.maxBidPoint}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                </div>
            ) : (
                <>
                    {/* <div className="timer-container">
                        <div className={`timer-circle ${timer <= 10 ? "blinking-red" : ""}`}>
                            {timer}
                        </div>
                    </div> */}
                    <div className="marquee-container">
            <div className="marquee-text">{displayedText}</div>
        </div>

                    <div className="second-row">
                        <div className="column">
                            <h3 className="team-name">TEAM: {teamName}</h3>
                        </div>
                        <div className="column large">
                            {currentPlayer ? (
                                <div className="player-info">
                                    <img
                                        src={currentPlayer.photo_url || "https://via.placeholder.com/150"}
                                        alt={currentPlayer.name}
                                        className="player-image"
                                    />
                                    <h3>{currentPlayer.name}   ({currentPlayer.address})</h3>
                                    <p><strong>FMCID:</strong> {currentPlayer.fmcid}</p>
                                    <p><strong>{currentPlayer.player_type}</strong></p>
                                </div>
                            ) : (
                                <p>Waiting for the admin to select a player...</p>
                            )}
                        </div>
                        <div className="column">
                            <h3 className="bid-points">Bid Points: {currentBidData.playercurrentbidpoint}</h3>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PubliccDisplay;
