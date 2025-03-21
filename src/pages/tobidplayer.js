import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs} from 'firebase/firestore';
import './tobidplayer.css';

const TobidPlayer = () => {
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
//   const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const userCollection = collection(db, '8starplayers');
      const userSnapshot = await getDocs(userCollection);
      const sortedPlayers = userSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((player) => player.orderid === 10000)
        .sort((a, b) => a.fmcid - b.fmcid);

      setPlayers(sortedPlayers);
      setFilteredPlayers(sortedPlayers);
    };

    // const fetchTeams = async () => {
    //   const teamsCollection = collection(db, 'teams');
    //   const teamsSnapshot = await getDocs(teamsCollection);
    //   setTeams(teamsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    // };

    fetchPlayers();
   // fetchTeams();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredPlayers(
      players.filter(
        (player) =>
          player.name?.toLowerCase().includes(query) ||
          player.mobile_number?.toLowerCase().includes(query)
      )
    );
  };

//   const handleTeamAssign = async (player, teamId) => {
//     const team = teams.find((t) => t.id === teamId);
//     if (!team) return;

//     const newOrderid = team.team_id * 30 + team.players.length;
//     const playerDocRef = doc(db, '8starplayers', player.id);
//     const teamDocRef = doc(db, 'teams', team.id);

//     await updateDoc(playerDocRef, { team_id: team.team_name, orderid: newOrderid });
//     await updateDoc(teamDocRef, { players: arrayUnion(player.fmcid) });

//     alert(`${player.name} assigned to ${team.team_name}.`);
//     window.location.reload();
//   };

  return (
    <div className="teamview-container">
      <h2>Not bidded players</h2>
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Name or Mobile"
          className="search-input"
        />
      </div>
      <div className="players-grid">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player) => (
            <div className="player-card" key={player.id}>
              <div className="player-card-content">
                <div className="player-image-container">
                  <img
                    src={player.photo_url || 'https://via.placeholder.com/150'}
                    alt={player.name || 'Player'}
                    className="player-image"
                  />
                  <h4 className="player-name">{player.name} ({player.fmcid})</h4>
                </div>
                <div className="player-details">
                  <p><strong>Shirt Size:</strong> {player.shirt_size}</p>
                  <p><strong>Mobile:</strong> {player.mobile_number}</p>
                  <p><strong>Player Type:</strong> {player.player_type}</p>
                  <p><strong>Jersey Number:</strong> {player.jersey_number}</p>
                  <p><strong>Address:</strong> {player.address}</p>
                  {/* <button className="action-button" onClick={() => handleUpdateFmcid(player)}>Update FMCID</button> */}
                  {/* <select
                    className="team-dropdown"
                    onChange={(e) => handleTeamAssign(player, e.target.value)}
                  >
                    <option value="">Assign to Team</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.team_name}</option>
                    ))}
                  </select> */}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-players">No players registered.</p>
        )}
      </div>
    </div>
  );
};

export default TobidPlayer;








