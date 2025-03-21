import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // Import Firestore
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore'; // Firestore functions
import './ViewPage.css';
import { FaWhatsapp } from 'react-icons/fa'; // Import WhatsApp icon from FontAwesome or similar

const ViewPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [playerCount, setPlayerCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [playerTypeFilter, setPlayerTypeFilter] = useState('all');

  const paymentPassword = 'pay_2024_password'; // Password to mark payment as "paid"

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), orderBy('orderid', 'asc'));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Exclude "Owner", "Legend Player" and "Icon Player" from the users list
      const filteredUsersList = usersList.filter(user => user.player_type !== 'Owner' && user.player_type !== 'Icon Player' && user.player_type !== 'Legend Player');
      setUsers(filteredUsersList);
      setFilteredUsers(filteredUsersList); // Initially, show all filtered users
      setPlayerCount(filteredUsersList.length); // Set count for the filtered list
    };
    fetchUsers();
  }, []);

  // Handle search and filtering logic
  useEffect(() => {
    let filtered = users;

    // Filter by player type
    if (playerTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.player_type === playerTypeFilter);
    }

    // Filter by search term (name)
    if (searchTerm) {
      filtered = filtered.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    setFilteredUsers(filtered);
  }, [searchTerm, playerTypeFilter, users]);

  // Handle payment status update
  const handlePaymentUpdate = async (userId) => {
    const enteredPassword = prompt('Enter payment password to confirm:');
    if (enteredPassword === paymentPassword) {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { payment: 'paid' });
      // Update the local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, payment: 'paid' } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers); // Update filtered users
      alert('Payment status updated to "paid".');
    } else {
      alert('Incorrect password. Payment status not updated.');
    }
  };

  // Function to create WhatsApp link
  const createWhatsAppLink = (mobileNumber) => {
    return `https://wa.me/${mobileNumber}`;
  };

  return (
    <div className="view-container">
      {/* No password protection for the page anymore */}
      
      <div className="top-bar">
        <div className="player-count">
          Total Players: {playerCount}
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select onChange={(e) => setPlayerTypeFilter(e.target.value)} value={playerTypeFilter}>
            <option value="all">All</option>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="Wicket Keeper">Wicket Keeper</option>
            <option value="Allrounder">Allrounder</option>
          </select>
        </div>
      </div>

      <h2>Players List</h2>
      <div className="card-list">
        {filteredUsers.map((user,index) => (
          <div className="card" key={user.id}>
            <div className="card-content-1">
            <img src={user.photo_url} alt="User" className="user-image" />
            <h3>{user.name} ({index+1})</h3>
            </div>
            <div className="card-content">
              <p><strong>FMC ID:</strong> FMC{user.fmcid}</p>
              <p><strong>Shirt Size:</strong> {user.shirt_size}</p>
              <p><strong>Jersey Number:</strong> {user.jersey_number}</p>
              <p><strong>Mobile:</strong> {user.mobile_number}</p>
              <p><strong>Address:</strong> {user.address}</p>
              <p><strong>Player Type:</strong> {user.player_type}</p>
              {/* <p>{user.payment || 'Not Paid'}</p> */}

              {/* Payment Button */}
              {/* {(!user.payment || user.payment.toLowerCase() === 'not paid') && (
                <button
                  className="payment-button"
                  onClick={() => handlePaymentUpdate(user.id)}
                >
                  Mark as Paid
                </button>
              )} */}

              {/* WhatsApp Button */}
              {/* <a
                href={createWhatsAppLink(user.mobile_number)}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-button"
                title={`Message ${user.name} on WhatsApp`}
              >
                <FaWhatsapp style={{ color: 'green', fontSize: '24px' }} />
              </a> */}
            </div>
          </div>
        ))}
      </div>

      {/* Footer section for copyright */}
      {/* <footer className="footer" id="footerview">
        <p>&copy; 2024 mpshetty. All rights reserved.</p>
      </footer> */}
    </div>
  );
};

export default ViewPage;




// import React, { useState, useEffect } from "react";
// import { db } from "./firebase"; // Replace with your Firebase config file path
// import { collection, getDocs } from "firebase/firestore";
// import { getStorage, ref, getDownloadURL } from "firebase/storage";
// import pptxgen from "pptxgenjs";

// const ViewPage = () => {
//     const [players, setPlayers] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchUsers = async () => {
//             try {
//                 const usersSnapshot = await getDocs(collection(db, "users"));
//                 const users = usersSnapshot.docs.map(doc => ({
//                     id: doc.id, // Firebase document ID
//                     ...doc.data() // All document fields
//                 }));
//                 setPlayers(users);
//             } catch (error) {
//                 console.error("Error fetching users:", error);
//                 setPlayers([]);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchUsers();
//     }, []);

//     const fetchImageAsBase64 = async (imageUrl) => {
//         try {
//             const response = await fetch(imageUrl);
//             if (!response.ok) {
//                 throw new Error('Failed to load image');
//             }
//             const blob = await response.blob();
//             const reader = new FileReader();
//             return new Promise((resolve, reject) => {
//                 reader.onloadend = () => resolve(reader.result); // Convert blob to base64
//                 reader.onerror = reject;
//                 reader.readAsDataURL(blob); // Start reading the blob as data URL (base64)
//             });
//         } catch (error) {
//             throw new Error("Error fetching image as base64: " + error.message);
//         }
//     };

//     const exportToPPT = async () => {
//         const ppt = new pptxgen();

//         for (const player of players) {
//             const slide = ppt.addSlide();

//             // Add player details
//             slide.addText(player.name || "Unknown Player", { x: 1, y: 0.5, fontSize: 24 });
//             slide.addText(`FMCID: ${player.fmcid || "N/A"}`, { x: 1, y: 1 });
//             slide.addText(`Player ID: ${player.player_id || "N/A"}`, { x: 1, y: 1.5 });

//             // Fetch and add player photo
//             try {
//                 const storage = getStorage();
//                 const imageRef = ref(storage, player.photo_url);
//                 const url = await getDownloadURL(imageRef);
//                 const base64Image = await fetchImageAsBase64(url);

//                 slide.addImage({
//                     path: base64Image, // Player image from Firebase
//                     x: 0.5,
//                     y: 2,
//                     w: 3,
//                     h: 3
//                 });
//             } catch (error) {
//                 console.error(`Error fetching photo for player ${player.name}:`, error);
//                 slide.addText("Image not available", { x: 0.5, y: 2, fontSize: 16 });
//             }
//         }

//         ppt.writeFile("Players.pptx");
//     };

//     if (loading) return <p>Loading players...</p>;

//     if (players.length === 0) return <p>No player data available.</p>;

//     return (
//         <div>
//             <h1>Player Details</h1>
//             <button onClick={exportToPPT}>Export to PPT</button>
//             <div>
//                 {players.map(player => (
//                     <div key={player.id} style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
//                         <PlayerDetails player={player} />
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// const PlayerDetails = ({ player }) => {
//     const [photoUrl, setPhotoUrl] = useState("https://via.placeholder.com/150");

//     useEffect(() => {
//         const fetchPhoto = async () => {
//             if (player.photo_url) {
//                 try {
//                     const storage = getStorage();
//                     const imageRef = ref(storage, player.photo_url);
//                     const url = await getDownloadURL(imageRef);
//                     setPhotoUrl(url);
//                 } catch (error) {
//                     console.error(`Error fetching photo for player ${player.name}:`, error);
//                 }
//             }
//         };
//         fetchPhoto();
//     }, [player]);

//     return (
//         <div style={{ display: "flex", alignItems: "center" }}>
//             <img src={photoUrl} alt={player.name || "Player"} style={{ width: 150, height: 150, marginRight: 20 }} />
//             <div>
//                 <h3>{player.name || "Unknown Player"}</h3>
//                 <p>FMCID: {player.fmcid || "N/A"}</p>
//                 <p>Player ID: {player.player_id || "N/A"}</p>
//             </div>
//         </div>
//     );
// };

// export default ViewPage;
