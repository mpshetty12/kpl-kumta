import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import './bidview.css';

const BidView = () => {
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      const userCollection = collection(db, '8starplayers');
      const userSnapshot = await getDocs(userCollection);
      const sortedPlayers = userSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((player) => player.orderid === 10000)
        .sort((a, b) => a.fmcid - b.fmcid);

      setPlayers(sortedPlayers);
    };

    const fetchTeams = async () => {
      const teamsCollection = collection(db, 'teams');
      const teamsSnapshot = await getDocs(teamsCollection);
      const teamsData = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTeams(teamsData);
    };

    fetchPlayers();
    fetchTeams();
  }, []);


  const handleGoToPlayer = () => {
    const playerId = prompt("Enter PlayerID of the player:");
    if (!playerId) return;
  
    const index = players.findIndex((player) => player.fmcid.toString() === playerId);
    if (index !== -1) {
      setCurrentPlayerIndex(index);
    } else {
      alert("Player ID not found.");
    }
  };
  
  const handleNext = () => {
    if (currentPlayerIndex < players.length - 1) {
      setSelectedTeamId(''); // Reset team selection
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentPlayerIndex > 0) {
      setSelectedTeamId(''); // Reset team selection
      setCurrentPlayerIndex(currentPlayerIndex - 1);
    }
  };
  const handleTeamChange = async (e) => {
    const teamId = e.target.value;
    setSelectedTeamId(teamId);

    if (!teamId || !players[currentPlayerIndex]) return;

    const selectedTeam = teams.find((team) => team.id === teamId);
    const currentPlayer = players[currentPlayerIndex];

    const isConfirmed = window.confirm(
      `Are you sure you want to assign ${currentPlayer.name} (ID: ${currentPlayer.fmcid}) to team "${selectedTeam.team_name}"?\n\n` +
        `Once confirmed, this player will no longer be in the bid.`
    );

    if (!isConfirmed) {
      setSelectedTeamId('');
      return;
    }

    const newOrderid = selectedTeam.team_id * 30 + selectedTeam.players.length;

    const playerDocRef = doc(db, '8starplayers', currentPlayer.id);
    await updateDoc(playerDocRef, {
      team_id: selectedTeam.team_name,
      orderid: newOrderid,
    });

    const teamDocRef = doc(db, 'teams', selectedTeam.id);
    await updateDoc(teamDocRef, {
      players: arrayUnion(currentPlayer.fmcid),
    });

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) =>
        player.id === currentPlayer.id
          ? { ...player, team_id: selectedTeam.team_name, orderid: newOrderid }
          : player
      )
    );

    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === selectedTeam.id
          ? { ...team, players: [...team.players, currentPlayer.fmcid] }
          : team
      )
    );

    alert(`Player ${currentPlayer.name} successfully assigned to team "${selectedTeam.team_name}".`);
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="bid-view-container">
      
      {currentPlayer ? (
        <div className="player-container">
          {/* Player Photo Section */}
          <div className="player-photo-section">
            <img
              src={currentPlayer?.photo_url || 'https://via.placeholder.com/800'}
              alt={currentPlayer?.name || 'Player'}
              className="player-photo"
            />
          </div>

          {/* Player Details Section */}
          <div className="player-details-section">
            <h2 className="player-namess">{currentPlayer?.name}  ({currentPlayer?.fmcid})</h2>
            <div className="player-info">
              <p><strong>Shirt Size:</strong> {currentPlayer?.shirt_size}</p>
              <p><strong>Mobile:</strong> {currentPlayer?.mobile_number}</p>
              <p><strong>Player Type:</strong> {currentPlayer?.player_type}</p>
              <p><strong>Jersey Number:</strong> {currentPlayer?.jersey_number}</p>
              <p><strong>Address:</strong> {currentPlayer?.address}</p>
            </div>
            <button onClick={handleGoToPlayer}>Go To Player</button>
            <div className="team-selection">
              <label htmlFor="team-select">Assign to Team:</label>
              <select
                id="team-select"
                value={selectedTeamId}
                onChange={handleTeamChange}
                className="team-dropdown"
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="navigation-buttons">
              <button
                onClick={handlePrev}
                className="action-button"
                disabled={currentPlayerIndex === 0}
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="action-button"
                disabled={currentPlayerIndex === players.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-player">
          <p>No players found.</p>
        </div>
      )}
    </div>
  );
};

export default BidView;
