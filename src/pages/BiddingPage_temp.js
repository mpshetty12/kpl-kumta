import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, getDoc, updateDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { Navigate } from 'react-router-dom';
import "./bidc.css";

const BiddingPage = () => {
    useEffect(() => {
        const fetchTeamNames = async () => {
          const teamCollection = collection(db, "teams"); // Reference to the "teams" collection
          const teamQuery = query(teamCollection, orderBy("team_id")); // Query sorted by team_id field
          const teamSnapshot = await getDocs(teamQuery); // Fetch all documents from the collection
          const teamList = ["KPL"];  // Start with KPL as the first team
    
          // Collect teams and their IDs into an array
          const teamsArray = [];
          teamSnapshot.forEach((doc) => {
            const teamData = doc.data();
            teamsArray.push({
              id: doc.id,       // Document ID (if needed)
              name: teamData.team_name // Team name
            });
          });
    
          // Sort teams array by the team_id field in the document
          teamsArray.sort((a, b) => a.team_id - b.team_id); // Sort numerically if team_id is a number
    
          // Add sorted team names to the teamList
          teamsArray.forEach(team => {
            teamList.push(team.name);
          });
    
          setTeamss(teamList);  // Set the state with the fetched and sorted team names
          console.log(teamList);
        };
    
        fetchTeamNames();
      }, []);
    const [teamss, setTeamss] = useState([""]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [currentBidPoint, setCurrentBidPoint] = useState(0);
    const [maxBidPoint, setMaxBidPoint] = useState(100); // Default to 100 initially
    const [selectedBid, setSelectedBid] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [canBid, setCanBid] = useState(false);
    const [isBidClosed, setIsBidClosed] = useState(false); // Track if the bid is closed
    const [winningTeam, setWinningTeam] = useState(null); // Store the winning team ID
    const [winningBid, setWinningBid] = useState(null); // Store the winning bid amount
    const [timer, setTimer] = useState(100); // Initial timer value
    // const [playerCount, setPlayerCount] = useState(0); // Track the number of players for the team
    const teamId = sessionStorage.getItem("teamId");
    useEffect(() => {
        if (!teamId) {
            Navigate("/login");  // Redirect to login page if not logged in
        }
    }, [teamId]);
    const [teamName, setTeamName] = useState("null");

    //const timerRef = useRef(null); // Reference to store the timer interval

    // const handleBuyClick = () => {
    //     setDropdownVisible(true);
    // };

    useEffect(() => {
        // Fetch the current bid document to get the timer value
        const currentBidRef = doc(db, "bids", "currentBid");
        getDoc(currentBidRef).then((docSnapshot) => {
            if (docSnapshot.exists()) {
                const bidData = docSnapshot.data();
                if (bidData.time) {
                    setTimer(bidData.time); // Set timer to the value from Firestore
                }
            }
        });

        // Clear previous interval and start a new one when timer resets
       // if (timerRef.current) clearInterval(timerRef.current);

        // timerRef.current = setInterval(() => {
        //     setTimer((prevTimer) => {
        //         const newTimer = prevTimer > 0 ? prevTimer - 1 : 100;

        //         // Update timer in Firestore
        //         const currentBidRef = doc(db, "bids", "currentBid");
        //         updateDoc(currentBidRef, { time: newTimer }).catch(console.error);

        //         if (newTimer <= 0) {
        //             clearInterval(timerRef.current);
        //         }

        //         return newTimer;
        //     });
        // }, 1000);

        // // Clean up interval on component unmount
        // return () => clearInterval(timerRef.current);
    }, [currentPlayer]); // Reset timer every time `currentPlayer` changes

    useEffect(() => {
        // Fetch the current team document to get the maxBidPoint and players count
        const teamDocRef1 = doc(db, "teams", teamId);

        const unsubscribeTeam1 = onSnapshot(teamDocRef1, (teamSnapshot) => {
            if (teamSnapshot.exists()) {
                const teamData1 = teamSnapshot.data();
                setTeamName(teamData1.team_name);
            }
        });

        const teamRef = doc(db, "teams", teamId);
        const unsubscribeTeam = onSnapshot(teamRef, (teamSnapshot) => {
            if (teamSnapshot.exists()) {
                const teamData = teamSnapshot.data();
                setMaxBidPoint(teamData.maxbidpoint || 0); // Update maxBidPoint from Firestore, default to 100 if missing
                // setPlayerCount(teamData.players.length || 0); // Update player count
            }
        });

        // Listen to bid data from Firestore to update player and bid points
        const currentBidRef = doc(db, "bids", "currentBid");
        const unsubscribeBid = onSnapshot(currentBidRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const bidData = docSnapshot.data();
                setCurrentPlayer(bidData);
                setCurrentBidPoint(bidData.playercurrentbidpoint || 0);
                if (bidData.time) {
                    setTimer(bidData.time); // Update timer from Firestore
                }

                // Check if the bid is closed and update the state accordingly
                if (bidData.isClosed) {
                    setIsBidClosed(true);
                    setWinningTeam(bidData.winner);
                    setWinningBid(bidData.winningBid);
                    setCanBid(false); // Disable bidding
                } else {
                    setIsBidClosed(false);
                    setCanBid(bidData.playercurrentbidpoint < maxBidPoint); // Re-enable bidding if not closed
                }
            }
        });

        // Clean up listeners on component unmount
        return () => {
            unsubscribeTeam();
            unsubscribeTeam1();
            unsubscribeBid();
        };
    }, [teamId, maxBidPoint]); // Re-run when teamId or maxBidPoint changes

    const handleBidSelection = async (bid) => {
        setSelectedBid(bid);

        const currentBidRef = doc(db, "bids", "currentBid");

        if (bid > currentBidPoint) {
            await updateDoc(currentBidRef, {
                team_id: teamId,
                playercurrentbidpoint: bid,
                time: 45, // Reset timer to 45 seconds when a bid is placed
            });
            alert(`Your bid of ${bid} has been placed`);
            setDropdownVisible(false); // Hide dropdown after placing bid
        } else {
            alert("Your bid must be higher than the current bid point!");
        }
    };

    return (
        <div className="bidding-page-container">
            <h2>Welcome Team {teamName}</h2>
            {currentPlayer ? (
                <div className="b-player-card">
                    <img
                        src={currentPlayer.Playerphotourl || "https://via.placeholder.com/150"}
                        alt={currentPlayer.playerName}
                        className="b-player-image"
                    />
                    <div className="b-player-details">
                        <h3>{currentPlayer.playerName}</h3>
                        <p><strong>Player ID:</strong> {currentPlayer.playerFmcid}</p>
                        <p><strong>Mobile number:</strong> {currentPlayer.playerMobilenumber}</p>
                        <p><strong>Address:</strong> {currentPlayer.playerAddress}</p>
                        <p><strong>Jersey No :</strong> {currentPlayer.playerJerseynumber}</p>
                        <p><strong>Shirt Size:</strong> {currentPlayer.playerShirtsize}</p>
                        <p><strong>Player Type:</strong> {currentPlayer.playerType}</p>
                        <p><strong>Time remaining:</strong> {timer} seconds</p>
                        <p>*************</p>
                        <p><strong>Top Bidder:</strong> {teamss[currentPlayer.team_id]}</p>
                        <p><strong>Bid Point:</strong> {currentPlayer.team_id}</p>
                    </div>
                    {currentPlayer.playerTop === 1 || currentPlayer.playerTop === 2 ? (
    <div className="bid-buttons">
        {currentBidPoint + 1 <= maxBidPoint && (
            <button
                className="bid-button"
                onClick={() => handleBidSelection(currentBidPoint)}
                // disabled={timer === 0 || !canBid || isBidClosed} // Disable when timer is 0
            >
                +1
            </button>
        )}
        {currentBidPoint + 2 <= maxBidPoint && (
            <button
                className="bid-button"
                onClick={() => handleBidSelection(currentBidPoint + 2)}
                // disabled={timer === 0 || !canBid || isBidClosed} // Disable when timer is 0
            >
                +2
            </button>
        )}
    </div>
) : currentPlayer.playerTop === 3 && !isBidClosed ? (
    <div className="bid-buttons">
        {currentBidPoint + 1 <= maxBidPoint && (
            <button
                className="bid-button"
                onClick={() => handleBidSelection(currentBidPoint + 1)}
                disabled={timer === 0 || !canBid || isBidClosed} // Disable when timer is 0
            >
                +1
            </button>
        )}
        {currentBidPoint + 2 <= maxBidPoint && (
            <button
                className="bid-button"
                onClick={() => handleBidSelection(currentBidPoint + 2)}
                disabled={timer === 0 || !canBid || isBidClosed} // Disable when timer is 0
            >
                +2
            </button>
        )}
    </div>
) : null}


                    {isBidClosed ? (
                        <div className="winning-bid-info">
                            <p><strong>Winning Team:</strong>{teamss[winningTeam]}</p>
                            <p><strong>Winning Bid:</strong> {winningBid} points</p>
                            <p>Bidding closed for this player.</p>
                        </div>
                    ) : (
                        <div></div>
                    )}

                    {dropdownVisible && canBid && (
                        <div className="bid-dropdown">
                            <label>Select your bid: </label>
                            <select
                                onChange={(e) => handleBidSelection(Number(e.target.value))}
                                value={selectedBid || currentBidPoint}
                                disabled={!canBid}
                            >
                                <option value={0}>Select</option>
                                {Array.from(
                                    { length: maxBidPoint - currentBidPoint },
                                    (_, i) => i + currentBidPoint + 1
                                ).map((point) => (
                                    <option key={point} value={point}>
                                        {point}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            ) : (
                <p>Waiting for the admin to select a player for bidding...</p>
            )}
        </div>
    );
};

export default BiddingPage;
