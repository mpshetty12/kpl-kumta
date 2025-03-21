import React, { useState, useEffect } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, orderBy, limit, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import './FormPage.css';

const FormPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    shirtSize: '',
    jerseyNumber: '',
    address: '',
    mobileNumber: '',
    photo: null,
    playerType: '',
    aadharNumber: '',
    aadharPhoto: null,
    idcardPhoto: null,
    transactionId: '', // New field added here
    team: '',
    top: 1000,
    orderid: 10000
  });
  const [teams, setTeams] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      const teamCollection = collection(db, 'teams');
      const teamSnapshot = await getDocs(teamCollection);
      setTeams(teamSnapshot.docs.map((doc) => ({
        id: doc.id,
        team_id: doc.data().team_id,
        team_name: doc.data().team_name,
      })));
    };
    fetchTeams();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const checkIfMobileNumberExists = async (mobileNumber) => {
    const q = query(collection(db, 'kumtaplayers'), where('mobile_number', '==', mobileNumber));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const getNextFmcid = async () => {
    const q = query(collection(db, 'kumtaplayers'), orderBy('fmcid', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const lastUser = querySnapshot.docs[0].data();
      return lastUser.fmcid + 1;
    } else {
      return 1;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.photo) {
      alert('Please select a photo to upload.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.idcardPhoto) {
      alert('Please upload your ID card photo.');
      setIsSubmitting(false);
      return;
    }

    try {
      const mobileNumberExists = await checkIfMobileNumberExists(formData.mobileNumber);
      if (mobileNumberExists) {
        alert('This mobile number is already registered. Please use a different number.');
        setIsSubmitting(false);
        return;
      }

      const nextFmcid = await getNextFmcid();

      const photoFileName = `${Date.now()}_${formData.photo.name}`;
      const storageRef = ref(storage, `kumtaplayers/${photoFileName}`);
      await uploadBytes(storageRef, formData.photo);
      const photoUrl = await getDownloadURL(storageRef);

      const idcardFileName = `${Date.now()}_${formData.idcardPhoto.name}`;
      const idcardStorageRef = ref(storage, `idcardphoto/${idcardFileName}`);
      await uploadBytes(idcardStorageRef, formData.idcardPhoto);
      const idcardPhotoUrl = await getDownloadURL(idcardStorageRef);

      await addDoc(collection(db, 'kumtaplayers'), {
        name: formData.name,
        shirt_size: formData.shirtSize,
        jersey_number: formData.jerseyNumber,
        address: formData.address,
        mobile_number: formData.mobileNumber,
        photo_url: photoUrl,
        idcard_photo_url: idcardPhotoUrl,
        player_type: formData.playerType,
        transaction_id: formData.transactionId, // Save transaction ID
        fmcid: nextFmcid,
        teamid: formData.team,
        payment: '',
        orderid: 10000,
        top: 1000
      });

      if (formData.team) {
        const selectedTeam = teams.find((team) => team.team_id === Number(formData.team));
        if (selectedTeam) {
          const teamDocRef = doc(db, 'teams', selectedTeam.id);
          await updateDoc(teamDocRef, {
            players: arrayUnion(nextFmcid),
          });
        }
      }

      setFormSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      {formSubmitted ? (
        <div className="success-message">
          <h2>Form Submitted Successfully!</h2>
          <div className="checkmark">&#10004;</div>
          <p>ನಿಮ್ಮ ವಿವರಗಳು ಗಣನೆಗೆ ತೆಗೆದುಕೊಂಡಿದೆ, ನಿರ್ವಾಹಕರುಗಳು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುವರು</p>
        </div>
      ) : (
        <>
          <h2>Enter Player Details / ಆಟಗಾರರ ವಿವರಗಳು</h2>
          <h4>ಕುಮಟಾ ಹಾಗೂ ಹೊನ್ನಾವರ ಕಾಲೇಜು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾತ್ರ ಅವಕಾಶ, ಆ ಆಟಗಾರರು ಮಾತ್ರ ನೋಂದಣಿಯಾಗಬೇಕು (ಕಾಲೇಜು ಗುರುತಿನ ಚೀಟಿ ಕಡ್ಡಾಯವಾಗಿರುತ್ತದೆ)</h4>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Name/ ಹೆಸರು</label>
              <input type="text" id="name" name="name" onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label htmlFor="shirtSize">T-Shirt Size/ ಟೀ ಶರ್ಟ್ ಸೈಜ್</label>
              <select id="shirtSize" name="shirtSize" onChange={handleChange} required>
                <option value="">ಸೈಜ್ ಆಯ್ಕೆ ಮಾಡಿ</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="jerseyNumber">Jersey Number/ ಜೆರ್ಸಿ ನಂಬರ್ (0-999)</label>
              <input type="number" id="jerseyNumber" name="jerseyNumber" min="0" max="999" onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label htmlFor="address">Address / ವಿಳಾಸ</label>
              <input type="text" id="address" name="address" onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label htmlFor="mobileNumber">Mobile Number/ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ</label>
              <input type="text" id="mobileNumber" name="mobileNumber" onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label htmlFor="playerType">Player Type/ ಆಟಗಾರನ ವಿಧ</label>
              <select id="playerType" name="playerType" onChange={handleChange} required>
                <option value="">ಆಯ್ಕೆ ಮಾಡಿ</option>
                <option value="Batsman">Batsman/ ಬ್ಯಾಟ್ಸ್ ಮ್ಯಾನ್</option>
                <option value="Bowler">Bowler/ ಬೋಲರ್</option>
                <option value="Wicket Keeper">Wicket Keeper/ ವಿಕೆಟ್ ಕೀಪರ್</option>
                <option value="Allrounder">Allrounder/ ಆಲ್ ರೌಂಡರ್</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="photo">Upload Photo/ ಫೋಟೋ</label>
              <input type="file" id="photo" name="photo" onChange={handleFileChange} required />
            </div>

            <div className="input-group">
              <label htmlFor="idcardPhoto">Upload College ID Card Photo/ College ಗುರುತಿನ ಚೀಟಿ ಫೋಟೋ</label>
              <input type="file" id="idcardPhoto" name="idcardPhoto" onChange={handleFileChange} required />
            </div>

            <div className="input-group">
  <label>Pay Rupees 100 Here / ಇಲ್ಲಿ 100 Rupees ಪಾವತಿ ಮಾಡಿ</label>
  <div className="qr-section">
    <img 
      src="./pay.jpeg" 
      alt="QR Code for Payment" 
      className="qr-code" 
    />
    <p>Use this QR code to make the UPI payment and enter the Transaction ID below / ಈ QR ಕೋಡ್ ಬಳಸಿ ಪಾವತಿ ಮಾಡಿ ಮತ್ತು ಕೆಳಗಿನ ಟ್ರಾನ್ಸಾಕ್ಷನ್ ಐಡಿ ನಮೂದಿಸಿ</p>
  </div>
</div>


            <div className="input-group">
              <label htmlFor="transactionId">Transaction ID / UPI ವಹಿವಾಟು ಐಡಿ</label>
              <input type="text" id="transactionId" name="transactionId" onChange={handleChange} required />
            </div>

            <button type="submit" disabled={isSubmitting}>Submit/ ಸಲ್ಲಿಸಿ</button>
          </form>
        </>
      )}
    </div>
  );
};

export default FormPage;
