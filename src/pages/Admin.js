import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
    collection,
    getDoc,
    getDocs,
    doc,
    setDoc,
    onSnapshot,
    updateDoc,
    query,
    where,
    arrayUnion,
} from "firebase/firestore";
import "./Admin.css";

const Admin = () => {
    const updatePlayerIds = async () => {
        try {
            const teamsSnapshot = await getDocs(collection(db, "teams"));

            for (const teamDoc of teamsSnapshot.docs) {
                const teamData = teamDoc.data();
                const teamId = teamData.team_id;
                const players = teamData.players || [];

                console.log(`Processing team: ${teamId}, Players:`, players);

                for (let index = 0; index < players.length; index++) {
                    const fmcid = players[index];

                    console.log(`Player index: ${index}, FMCID:`, fmcid, `Type:`, typeof fmcid);

                    const playerId = teamId * 10 + index;

                    const usersQuery = query(
                        collection(db, "users"),
                        where("fmcid", "==", fmcid)
                    );
                    const usersSnapshot = await getDocs(usersQuery);

                    if (!usersSnapshot.empty) {
                        usersSnapshot.forEach(async (userDoc) => {
                            const userRef = doc(db, "users", userDoc.id);
                            await updateDoc(userRef, { player_id: playerId });
                            console.log(`Updated player_id for fmcid: ${fmcid} to ${playerId}`);
                        });
                    } else {
                        console.warn(`No user document found with fmcid: ${fmcid}`);
                    }
                }
            }

            console.log("Player IDs updated successfully.");
        } catch (error) {
            console.error("Error updating player IDs:", error);
        }
    };

    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    // const [currentFmcid, setCurrentFmcid] = useState(0);
    const [timer, setTimer] = useState(100);
    const [currentBidData, setCurrentBidData] = useState({
        team_id: "N/A",
        playercurrentbidpoint: 0,
        isClosed: false,
        winner: "N/A",
        winningBid: 0,
    });
    const [teamName, setTeamName] = useState("N/A");
    const [showWinnerScreen, setShowWinnerScreen] = useState(false);
    const [showMaxBidPoints, setShowMaxBidPoints] = useState(false);
    const [teamsMaxBidPoints, setTeamsMaxBidPoints] = useState([]);
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const correctPassword = "admin123";

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (password === correctPassword) {
            setIsAuthenticated(true);
        } else {
            alert("Incorrect password. Please try again.");
        }
    };

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
        const fetchPlayers = async () => {
            const playerSnapshot = await getDocs(collection(db, "users"));
            const fetchedPlayers = playerSnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter(
                    (player) =>
                        player.isBidded !== true &&
                        !["Owner", "Icon Player", "Legend Player"].includes(
                            player.player_type
                        )
                )
                .sort((a, b) => a.orderid - b.orderid); // Sort by orderid
            setPlayers(fetchedPlayers);
        };
        fetchPlayers();

        const unsubscribe = onSnapshot(doc(db, "bids", "currentBid"), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const bidData = docSnapshot.data();
                setCurrentBidData({
                    team_id: bidData.team_id || "N/A",
                    playercurrentbidpoint: bidData.playercurrentbidpoint || 0,
                    isClosed: bidData.isClosed || false,
                    winner: bidData.winner || "N/A",
                    winningBid: bidData.winningBid || 0,
                });
                if (bidData.time) {
                    setTimer(bidData.time);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const nextPlayer = async () => {
        setShowWinnerScreen(false);
        setShowMaxBidPoints(false);

        const currentBidRef = doc(db, "bids", "currentBid");
        setTimer(60);

        if (!players || players.length === 0) {
            alert("No players available.");
            return;
        }

        const remainingPlayers = players.filter(
            (player) => player.orderid > (currentPlayer?.orderid || 0)
        );

        if (remainingPlayers.length === 0) {
            alert("No more eligible players left. Restarting the player list.");
            setPlayers((prevPlayers) => prevPlayers.sort((a, b) => a.orderid - b.orderid));
            return;
        }

        const nextPlayer = remainingPlayers[0];
        setCurrentPlayer(nextPlayer);

        const playerData = {
            playerId: nextPlayer.id || "",
            playerName: nextPlayer.name || "Unknown Player",
            playerFmcid: nextPlayer.fmcid,
            playerJerseynumber: nextPlayer.jersey_number || "Unknown Team",
            playerShirtsize: nextPlayer.shirt_size || "Unknown Player",
            playerMobilenumber: nextPlayer.mobile_number || "Unknown Position",
            playerType: nextPlayer.player_type || "Unknown Team",
            playerPayment: nextPlayer.payment || "Unknown Team",
            playerAddress: nextPlayer.address || "Unknown Team",
            playerTop: nextPlayer.top,
            Playerphotourl: nextPlayer.photo_url || "https://via.placeholder.com/150",
            playercurrentbidpoint: 0,
            isClosed: false,
            winner: "N/A",
            winningBid: 0,
            time: 0,
        };

        try {
            await setDoc(currentBidRef, playerData);
        } catch (error) {
            console.error("Failed to update current bid:", error);
        }
    };

    const closeBid = async () => {
        const { team_id, playercurrentbidpoint } = currentBidData;
        if (team_id === "N/A" || !currentPlayer) {
            alert("No active bid to close or missing team ID.");
            return;
        }

        try {
            const teamDocRef = doc(db, "teams", team_id);
            const teamSnapshot = await getDoc(teamDocRef);

            if (teamSnapshot.exists()) {
                const teamData = teamSnapshot.data();
                const currentMaxBidPoint = teamData.maxbidpoint || 0;
                const newMaxBidPoint = currentMaxBidPoint - playercurrentbidpoint;

                if (newMaxBidPoint < 0) {
                    alert("The bid point exceeds the team's available maxbidpoint.");
                    return;
                }

                await updateDoc(teamDocRef, {
                    maxbidpoint: newMaxBidPoint,
                    players: arrayUnion(currentPlayer.fmcid),
                });

                const playerDocRef = doc(db, "users", currentPlayer.id);
                await updateDoc(playerDocRef, {
                    isBidded: true,
                });

                await updateDoc(doc(db, "bids", "currentBid"), {
                    isClosed: true,
                    winner: team_id,
                    winningBid: playercurrentbidpoint,
                });

                setShowWinnerScreen(true);
                alert(
                    `Bid closed for player ${currentPlayer.name}, assigned to team ${team_id}, and ${playercurrentbidpoint} deducted from team's max bid points.`
                );
            } else {
                alert("Team not found.");
            }
        } catch (error) {
            console.error("Error closing bid:", error);
            alert("Failed to close bid.");
        }
    };

    const viewMaxBidPoints = async () => {
        try {
            const teamsSnapshot = await getDocs(collection(db, "teams"));
            const teamMaxBidPoints = teamsSnapshot.docs.map((doc) => ({
                teamName: doc.data().team_name,
                maxBidPoint: doc.data().maxbidpoint,
            }));

            setTeamsMaxBidPoints(teamMaxBidPoints);
            setShowMaxBidPoints(true);
        } catch (error) {
            console.error("Error fetching teams' max bid points:", error);
            alert("Failed to fetch teams' max bid points.");
        }
    };

    return (
        <div className="admin-container">
            {!isAuthenticated ? (
                <div className="password-section">
                    <h2>Enter Password to Access Admin</h2>
                    <form onSubmit={handlePasswordSubmit}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                        <button type="submit">Submit</button>
                    </form>
                </div>
            ) : (
                <>
                    {showWinnerScreen ? (
                        <div className="">
                            <h5>Winner: {teamName}</h5>
                            <h5>Winning Bid: {currentBidData.winningBid}</h5>
                            <button onClick={nextPlayer} className="next-player-btn">
                                Next Player
                            </button>
                            <button
                                onClick={viewMaxBidPoints}
                                className="view-max-bidpoints-btn"
                            >
                                View All Teams' Max Bid Points
                            </button>

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
                                    <button onClick={nextPlayer} className="next-player-btn">
                                        Next Player
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="timer-container">
                                <div
                                    className={`timer-circle ${timer <= 10 ? "blinking-red" : ""}`}
                                >
                                    {timer}
                                </div>
                            </div>

                            <div className="bid-info">
                                <h3 className="left-align">Team Name: {teamName}</h3>
                                <h3 className="right-align">Bid Points: {currentBidData.playercurrentbidpoint}</h3>
                            </div>

                            {currentPlayer ? (
                                <div className="player-info">
                                    <img
                                        src={currentPlayer.photo_url || "https://via.placeholder.com/150"}
                                        alt={currentPlayer.name}
                                        className="player-image"
                                    />
                                    <h3>{currentPlayer.name}</h3>
                                    <p><strong>FMCID:</strong> {currentPlayer.fmcid}</p>
                                </div>
                            ) : (
                                <p>Waiting for the admin to select a player...</p>
                            )}

                            <div className="action-buttons">
                                <button className="next-player-btn" onClick={nextPlayer}>
                                    Next Player
                                </button>
                                <button
                                    className="close-bid-btn"
                                    onClick={closeBid}
                                    disabled={!currentPlayer || currentBidData.isClosed}
                                >
                                    Close Bid
                                </button>
                                <button onClick={updatePlayerIds} className="view-max-bidpoints-btn">
                                    Update Player IDs
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Admin;
