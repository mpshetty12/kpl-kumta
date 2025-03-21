import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();
  //const [isAdmin, setIsAdmin] = useState(false);
  //const [error, setError] = useState('');

  // Correct Admin Password
  //const correctAdminPassword = '1010';  // Change this password to whatever you prefer
  
  //setIsAdmin(false);
  //setError('');
  // const handleAdminClick = () => {
  //   const enteredPassword = prompt('Please enter the admin password:');
    
  //   if (enteredPassword === correctAdminPassword) {
  //     setIsAdmin(true); // Activate admin mode
  //     setError('');
  //   } else {
  //     setError('Incorrect password! Please try again.');
  //   }
  // };

  return (
    <div className='welcome-container'>
      {/* Logo */}
      <img src="./jv.jpeg" alt="KPL 2025" className="logo" />

      {/* President and Vice President images */}
      <div className="leaders-container">
        <div className="leader">
          {/* <img src="./jv.jpeg" alt="President" className="leader-image" /> */}
          <p className="leader-title">ಫ್ರೆಂಡ್ಸ್ ಯೂತ್ ಕ್ಲಬ್ ಇವರ ಆಶ್ರಯದಲ್ಲಿ</p>
          <p className="leader-title">ದಿನಾಂಕ : ಎಪ್ರಿಲ್ 14, 15, 16 ಮತ್ತು 17  2025</p>
          <p className="leader-title1">ಸ್ಥಳ: ಕುಮಟಾ</p>
        </div>
        {/* <div className="leader">
          <img src="./surendra.jpeg" alt="Vice President" className="leader-image" />
          <p className="leader-title">Surendra Devadiga</p>
          <p className="leader-title1">Vice President</p>
        </div> */}
      </div>

      {/* Welcome Text */}
      <h1>ಕುಮಟಾ ಪ್ರೀಮಿಯರ್ ಲೀಗ್ - 2025</h1>
      {/* <h4>Registration Closed, Thanks everyone who are all registered to KPL-2025</h4> */}

      {/* Error Message for Incorrect Password */}
      {/* {error && <p className="error-message">{error}</p>} */}

      {/* Button container */}
      <p  className="info-title">ಕುಮಟಾ ಹಾಗೂ ಹೊನ್ನಾವರ ಕಾಲೇಜು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾತ್ರ ಅವಕಾಶ, ಆ ಆಟಗಾರರು ಮಾತ್ರ ನೋಂದಣಿಯಾಗಬೇಕು (ಕಾಲೇಜು ಗುರುತಿನ ಚೀಟಿ ಕಡ್ಡಾಯವಾಗಿರುತ್ತದೆ) </p>
      <div className="button-container">
          <>
            <button onClick={() => navigate('/form')}>ಆಟಗಾರರ ನೋಂದಣಿ</button>
            {/* <button onClick={() => navigate('/view')}>PLayers view</button> */}
            {/* <button onClick={() => navigate('/view')}>Players View/ ನೋಂದಣಿಯಾದ ಆಟಗಾರರ ಪಟ್ಟಿ</button> */}
            {/* <button onClick={() => navigate('/teamview')}>Team View</button>
            <button onClick={() => navigate('/login')}>Team Login</button>
            <button onClick={handleAdminClick}>KPL Organizers Panel</button> */}
          </>
      </div>

      <p className="leader-title">ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಸಂಪರ್ಕಿಸಿ 👇</p>
      <p className="leader-title">8867141341,8867223314</p>
      <p className="leader-title">7022120631,7676878527</p>

      {/* Footer */}
      <footer className="footer" id="footerright">
        <p>&copy; 2025 mpshetty. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default WelcomePage;


