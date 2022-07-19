import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");

  const connectWallet = async () => {
    setWalletConnected(true);
    console.log(walletConnected);
  }

  return (
    <div className="App">
      <nav className="navbar bg-light">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">SubVid</span>
        </div>
      </nav>
      <div className="container-fluid">
        <Modal show={!walletConnected}>
          <Modal.Header closeButton>
            <Modal.Title>Connect wallet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Button variant="primary" onClick={() => connectWallet()}>
              Connect Wallet
            </Button>
          </Modal.Body>
        </Modal>

        <div className='d-flex flex-row justify-content-around'>
          <div className='addressList'>Address list</div>
          <div className='contentList flex-grow-1'>Content List</div>
        </div>

      </div>
    </div>
  );
}

export default App;
