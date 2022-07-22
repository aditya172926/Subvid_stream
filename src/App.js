import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import celo_logo from './assets/Celo_logo.png';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");

  const connectWallet = async () => {
    setWalletConnected(true);
    console.log(walletConnected);
  }

  const sampleArray = [
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
    "0x00DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD"
  ]

  return (
    <div className="App">
      <nav className="navbar bg-light">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">SubVid</span>
        </div>
      </nav>
      <div className="container-fluid">
        <Modal show={!walletConnected} onClick={() => connectWallet()} size="sm" centered>
            <Button variant='light'>
              <div className='text-center'>
                <div className='logo mb-4 mt-4'>
                  <img src={celo_logo} alt='celo logo' width={50} height={50} />
                </div>

                <div className='mb-4'>
                    Connect Wallet
                </div>
              </div>
            </Button>
        </Modal>

        <div className='d-flex flex-row justify-content-around'>
          <div className='addressList'>
            <h3>Address List</h3>
            <ul className="list-group">
              {sampleArray.map((a, b) => {
                return (
                  <li className='list-group-item'>{a}</li>
                )
              })}
            </ul>
          </div>
          <div className='contentList flex-grow-1'>Content List</div>
        </div>

      </div>
    </div>
  );
}

export default App;
