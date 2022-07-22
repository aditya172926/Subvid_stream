import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import celo_logo from './assets/Celo_logo.png';

import Web3 from 'web3';
import { newKitFromWeb3 } from '@celo/contractkit';
import BigNumber from 'bignumber.js';

const ERC20_DECIMALS = 18;

var kit;

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [userBalance, setUserBalance] = useState(0.0);
  const [loadingSpinner, setLoadingSpinner] = useState(false);

  const connectWallet = async () => {
    if (window.celo) {
      console.log("Please approve this dapp to use it");
      try {
        setLoadingSpinner(true);
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        kit = newKitFromWeb3(web3);
        const accounts = await kit.web3.eth.getAccounts();
        kit.defaultAccount = accounts[0];
        setUserAddress(accounts[0]);
      } catch (error) {
        console.log(error);
        setLoadingSpinner(false);
      }
    } else {
      console.log("Install Celo Extension wallet");
    }
    await getBalance();
    setWalletConnected(true);
    setLoadingSpinner(false);
    console.log(walletConnected);
  }

  const getBalance = async () => {
    const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
    console.log(totalBalance);
    const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
    setUserBalance(cUSDBalance);
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
          Balance - {userBalance}
        </div>
      </nav>
      <div className="container-fluid">
        <Modal show={!walletConnected} onClick={() => connectWallet()} size="sm" centered>

          <Button variant='light'>
            <div className='text-center'>
              <div className='logo mb-4 mt-4'>
                <img src={celo_logo} alt='celo logo' width={50} height={50} />
              </div>
              {!loadingSpinner ? (
                <div className='mb-4'>
                  Connect Wallet
                </div>) : (
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
          </Button>
        </Modal>
        <div className='d-flex flex-row justify-content-around'>
          <div className='addressList'>
            <h3>Address List</h3>
            <ul className="list-group">
              {sampleArray.map((a, b) => {
                return (
                  <li className='list-group-item' key={b}>{a}</li>
                )
              })}
            </ul>
          </div>
          <div className='contentList flex-grow-1'>
            Connected Wallet
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
