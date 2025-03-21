import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './ViewPage.css';

const ViewPage = () => {
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); // state to hold the search query
  const [filteredPlayers, setFilteredPlayers] = useState([]); // state to hold filtered players

  useEffect(() => {
    const fetchPlayers = async () => {
      const userCollection = collection(db, 'kumtaplayers');
      const userSnapshot = await getDocs(userCollection);
      const sortedPlayers = userSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => a.fmcid - b.fmcid); // Sort by fmcid instead of player_id

      setPlayers(sortedPlayers);
      setFilteredPlayers(sortedPlayers); // Initially, show all players
    };

    fetchPlayers();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase(); // Convert to lowercase for case-insensitive matching
    setSearchQuery(query);

    // Filter players based on name or mobile number
    const filtered = players.filter(
      (player) =>
        player.name?.toLowerCase().includes(query) ||
        player.mobile_number?.toLowerCase().includes(query)
    );

    setFilteredPlayers(filtered); // Update the filtered players state
  };

  const renderPlayerCard = (player, index) => (
    <div className="player-cards" key={index}>
      <div className="player-card-inners">
        {/* Front Side */}
        <div className="player-card-fronts">
          <img
            src={player?.photo_url || 'https://via.placeholder.com/150'}
            alt={player?.name || `Player ${index + 1}`}
            className="player-image"
          />
          <h3>{player?.name || `Player ${index + 1}`}</h3>
        </div>

        {/* Back Side (Details) */}
        <div className="player-card-backs">
          {player ? (
            <>
              <h3>{player.name}</h3>

              <div className={`player-types ${player?.player_type}`}>
                {player?.player_type && <span>{player.player_type}</span>}
              </div>
              <p>
                <strong>Player ID:</strong> {player.fmcid}
              </p>
              <p>
                <strong>Shirt Size:</strong> {player.shirt_size}
              </p>
              <p>
                <strong>Jersey Number:</strong> {player.jersey_number}
              </p>
              <p>
                <strong>Mobile:</strong> {player.mobile_number}
              </p>
              <p>
                <strong>Address:</strong> {player.address}
              </p>
              <p>
                <strong>Player Type:</strong> {player.player_type}
              </p>
              <p>
                <strong>Payment Transaction ID:</strong> {player.transaction_id}
              </p>
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
      <h2>All Registered Players</h2>

      {/* Search Input */}
      <div className="search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Name or Mobile"
          className="search-input"
        />
      </div>

      <div className="players-lists">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map((player, index) => renderPlayerCard(player, index))
        ) : (
          <p className="no-players">No players registered.</p>
        )}
      </div>
    </div>
  );
};

export default ViewPage;