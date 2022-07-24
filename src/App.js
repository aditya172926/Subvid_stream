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
const contractAddress = "0x95ce455f07E611fe1449e3b59E20e699DDD3fe84";
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
      await approve(1);
    } catch (error) {
      console.log("Some error in approval, ", error);
    }
    try {
      const result = await contract.methods.subscribeMovie(currentCreatorAddress, 500).send({ from: kit.defaultAccount });
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
    setCurrentCreatorAddress(useraddress);
    const contents = await contract.methods.getMyUploadedMovies(useraddress).call();
    console.log(contents);
    setUserContent(contents);
    await subscriptionStatus(useraddress);
  }

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
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              )}
            </div>
          </Button>
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
            <>
            <button className='btn btn-primary' onClick={() => SubscribeContent()}>Subscribe</button>
            </>
          ) : (

            <div className='flex-grow-1'>
              Uploaded Content
              <form onSubmit={submitForm}>
                <input ref={streamTitle} type="text" placeholder='enter title' />
                <input ref={streamDescription} type="text" placeholder='enter desc' />
                <input ref={streamURL} type='text' placeholder='enter link' />
                <button>add</button>
              </form>

              <div className='d-flex flex-wrap justify-content-around'>
                {userContent.length === 0 ? (
                  <div className='alert alert-success' role='alert'>
                    <h4 className='alert-heading'>🎉 Wallet Successfully Connected 🎉</h4>
                    <p>Congratulations and Welcome to the website 🤘</p>
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
