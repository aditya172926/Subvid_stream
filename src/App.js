import logo from './logo.svg';
import './App.css';
import React, { useRef, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import celo_logo from './assets/Celo_logo.png';
import ABI from './assets/SubscribeMovie.json';
import erc20ABI from './assets/erc20.abi.json';

import Web3 from 'web3';
import { newKitFromWeb3 } from '@celo/contractkit';
import BigNumber from 'bignumber.js';

const ERC20_DECIMALS = 18;
const contractAddress = "0x0788A2D3cC8917e1cfb0217F6cfEf2c47c1969B5";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

var kit;
var contract;

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const [currentCreatorAddress, setCurrentCreatorAddress] = useState("");
  const [userBalance, setUserBalance] = useState(0.0);
  const [loadingSpinner, setLoadingSpinner] = useState(false);
  const [listAccounts, setListAccounts] = useState([]);
  const [userContent, setUserContent] = useState([]);
  const [notSubscribed, setNotSubscribed] = useState();
  const [showAddModal, setShowAddModal] = useState(false);

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
        setConnectedAddress(accounts[0]);

        contract = new kit.web3.eth.Contract(ABI, contractAddress);
        const testcount = await contract.methods.totalContent().call();
        console.log("The testcount is ", testcount);
        const getSignedAccounts = await contract.methods.getContentCreators().call();
        console.log(getSignedAccounts);
        setListAccounts(getSignedAccounts);
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

  async function approve(_price) {
    const cUSDContract = new kit.web3.eth.Contract(erc20ABI, cUSDContractAddress);
    const result = await cUSDContract.methods.approve(contractAddress, _price).send({ from: kit.defaultAccount });
    return result;
  }

  const SubscribeContent = async () => {
    try {
      await approve(1000);
    } catch (error) {
      console.log("Some error in approval, ", error);
    }
    try {
      const result = await contract.methods.subscribeMovie(currentCreatorAddress, 500, 1000).send({ from: kit.defaultAccount });
    } catch (error) {
      console.log("Some error in payment, ", error);
    }
  }

  const getBalance = async () => {
    const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
    console.log(totalBalance);
    const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
    setUserBalance(cUSDBalance);
  }

  // form inputs
  const streamTitle = useRef();
  const streamDescription = useRef();
  const streamURL = useRef();

  const submitForm = async (e) => {
    e.preventDefault();
    const params = [
      streamTitle.current.value,
      streamDescription.current.value,
      streamURL.current.value,
      'true'
    ]
    try {
      const result = await contract.methods.addContent(...params)
        .send({ from: kit.defaultAccount });
    } catch (error) {
      console.log(error);
    }
    console.log('Title is ', streamTitle.current.value);
    console.log('Desc is ', streamDescription.current.value);
  }

  const subscriptionStatus = async (useraddress) => {
    const mystatus = await contract.methods.getSubscriptionStatus(useraddress).call();
    console.log(mystatus);
    setNotSubscribed(mystatus);
  }

  const getContent = async (useraddress) => {
    await subscriptionStatus(useraddress);
    setCurrentCreatorAddress(useraddress);
    const contents = await contract.methods.getMyUploadedMovies(useraddress).call();
    console.log(contents);
    setUserContent(contents);
  }

  return (
    <div className="App">

      <nav className="navbar navbar-expand-lg bg-light">
        <div className="container-fluid">
          <span className="navbar-brand">SubVid</span>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <button className="btn btn-light" onClick={() => setShowAddModal(!showAddModal)} >Add</button>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Earnings</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Withdraw Money</a>
              </li>
              <li className="nav-item">
                <a className="nav-link">Cancel Subscription</a>
              </li>
            </ul>
          </div>
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
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
          </Button>
        </Modal>

        <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Upload Your Content</Modal.Title>
          </Modal.Header>
          <form onSubmit={submitForm}>
            <input ref={streamTitle} type="text" placeholder='enter title' />
            <input ref={streamDescription} type="text" placeholder='enter desc' />
            <input ref={streamURL} type='text' placeholder='enter link' />
            <button className='btn btn-primary' type='submit'>Add</button>
          </form>
        </Modal>


        <div className='d-flex flex-row justify-content-around'>

          <div>
            <h3>Creators List</h3>
            <ul className="list-group">
              {listAccounts.map((creator, index) => {
                return (
                  <li onClick={() => getContent(creator)} className='list-group-item' key={index}>
                    {creator.substring(0, 15)}...{creator.substring(38)}
                  </li>
                )
              })}
            </ul>
          </div>

          {notSubscribed ? (
            <div className='alert alert-danger mt-5' role='alert'>
              <h4 className='alert-heading'>⚠ You don't have subscription for this creator ⚠</h4>
              <p>Susbcribe to view the content posted</p>
              <hr></hr>
              <div className='d-grid col-6 mx-auto'>
                <button className='btn btn-danger' onClick={() => SubscribeContent()}>Subscribe</button>
              </div>
            </div>
          ) : (
            <div className='w-75'>
              Uploaded Content


              <div className='d-flex flex-wrap justify-content-around'>
                {userContent.length === 0 ? (
                  <div className='alert alert-success' role='alert'>
                    <h4 className='alert-heading'>🎉 Wallet Successfully Connected 🎉</h4>
                    <p>Congratulations and Welcome to the website</p>
                    <p>Your connected Wallet address is {connectedAddress}</p>
                    <hr></hr>
                    <p>Please select any address from the side panel to view their content</p>
                  </div>
                ) : (
                  userContent.map((mycontent, index) => {
                    return (
                      <div className='card mb-2 mt-2' style={{ width: "18rem" }} key={index}>
                        <iframe src={mycontent[4]} frameBorder="0" allow='autoplay; encrypted-media' allowFullScreen title='video' />
                        <div className='card-body'>
                          <h5 className='card-title'>{mycontent['title']}</h5>
                          <p className="card-text">{mycontent['description']}</p>
                          <a href={mycontent['movieUrl']} target="_blank" rel='noreferrer' style={{ color: "white", textDecoration: "none" }}>
                            <button className='btn btn-primary'>Go somewhere</button>
                          </a>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div >
  );
}

export default App;
