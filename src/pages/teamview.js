import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import './teamview.css';

// const addPlayerIdField = async () => {
//   try {
//     const usersCollection = collection(db, 'users'); // Reference to the users collection
//     const snapshot = await getDocs(usersCollection);

//     // Loop through each document to add the player_id field
//     for (const userDoc of snapshot.docs) {
//       const userRef = doc(db, 'users', userDoc.id); // Reference to the specific document
//       await updateDoc(userRef, { player_id: 10000 }); // Add or update the player_id field
//     }

//     console.log('player_id field adplded successfully to all documents.');
//   } catch (error) {
//     console.error('Error updating documents:', error);
//   }
// };


const TeamView = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [players, setPlayers] = useState([]);
 

  useEffect(() => {
      const fetchTeams = async () => {
        const teamCollection = collection(db, 'teams');
        const teamSnapshot = await getDocs(teamCollection);
        setTeams(
          teamSnapshot.docs.map((doc) => ({
            id: doc.id,
            team_id: doc.data().team_id,
            team_name: doc.data().team_name,
            players: doc.data().players || [],
          }))
        );
      };
      fetchTeams();
  },);


  const handleTeamChange = async (e) => {
    const teamId = e.target.value;
    setSelectedTeam(teamId);

    if (!teamId) {
      setPlayers([]); // Clear players if no team is selected
      return;
    }

    const selected = teams.find((team) => team.team_id === Number(teamId));
    if (selected && selected.players.length > 0) {
      const userQuery = query(
        collection(db, '8starplayers'),
        where('fmcid', 'in', selected.players),
      );
      
      const userSnapshot = await getDocs(userQuery);
      const sortedPlayers = userSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => a.player_id - b.player_id); // Sort by player_id

    setPlayers(sortedPlayers);
    } else {
      setPlayers([]);
    }

  };

  const renderPlayerCard = (player, placeholderText, index) => (
    <div className="player-card" key={index}>
      <div className="player-card-inner">
        {/* Front Side */}
        <div className="player-card-front">
          <img src={player?.photo_url || 'https://via.placeholder.com/150'} alt={player?.name || `Player ${index + 1}`} className="player-image" />
          <h3>{player?.name || `Player ${index + 1}`}</h3>
          <h4>{player?.player_type}</h4>
        </div>
        
        {/* Back Side (Details) */}
        <div className="player-card-back">
          {player ? (
            <>
              <h3>{player.name}</h3>
              
              <div className={`player-type ${player?.player_type}`}>
            {player?.player_type && <span>{player.player_type}</span>}
          </div>
              <p><strong>Player ID:</strong> FMC{player.fmcid}</p>
              <p><strong>Shirt Size:</strong> {player.shirt_size}</p>
              <p><strong>Jersey Number:</strong> {player.jersey_number}</p>
              <p><strong>Mobile:</strong> {player.mobile_number}</p>
              <p><strong>Address:</strong> {player.address}</p>
              <p><strong>Player Type:</strong> {player.player_type}</p>
              <p><strong>Payment Status:</strong> {player.payment || 'Not Paid'}</p>
            </>
          ) : (
            <p>Details not available</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="teamview-container">
      {/* <button onClick={addPlayerIdField}>Admin Panel</button> */}
      <h2>Team View</h2>
        <>
          <header className="header">
            <h1>8 ಸ್ಟಾರ್ ಟ್ರೋಫಿ 2025</h1>
            <p>
              <strong>Date:</strong> ದಿನಾಂಕ : ಫೆಬ್ರವರಿ 14, 15, 16  2025 | <strong>ಸ್ಥಳ:</strong>
              ಗಾಂಧಿ ಮೈದಾನ ಬೈಂದೂರು
            </p>
          </header>

          <nav className="navbar">
            <h2>Select Team</h2>
            <select value={selectedTeam} onChange={handleTeamChange}>
              <option value="">Choose a team</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </nav>

          {selectedTeam ? (
            <div className="players-list">
              {Array.from({ length: players.length }).map((_, index) => {
                const player = players[index];
                const placeholderText = `Player ${index + 1} - ${
                  index < players.length ? '' : 'Not yet registered'
                }`;
                return renderPlayerCard(player, placeholderText, index);
              })}
            </div>
          ) : (
            <p className="no-team-selected">Please select a team to view players.</p>
          )}
        </>
    </div>
  );
};

export default TeamView;