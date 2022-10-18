import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import celo_logo from "./assets/Celo_logo.png";
import ABI from "./assets/SubscribeMovie.json";
import erc20ABI from "./assets/erc20.abi.json";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";

const ERC20_DECIMALS = 18;
const contractAddress = "0xd84D2801b8D01Fb5435231EF1850DF09FA3d80bD";
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

    const [my_earnedBalance, setMy_earnedBalance] = useState(0.0);
    const [subscriptionAmt, setSubscriptionAmt] = useState(0);

    // modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEarningsModal, setShowEarningsModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);

    // Connect Celo wallet
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
                const getSignedAccounts = await contract.methods
                    .getContentCreators()
                    .call();
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
    };

    // Checks if the wallet is connected with any account on the site
    const checkWalletConnected = async () => {
        if (window.celo) {
            try {
                setLoadingSpinner(true);
                const web3 = new Web3(window.celo);
                kit = newKitFromWeb3(web3);
                const accounts = await kit.web3.eth.getAccounts();
                kit.defaultAccount = accounts[0];
                setConnectedAddress(accounts[0]);
                contract = new kit.web3.eth.Contract(ABI, contractAddress);
                const getSignedAccounts = await contract.methods
                    .getContentCreators()
                    .call();
                setListAccounts(getSignedAccounts);
                await getBalance();
                setLoadingSpinner(false);
                setWalletConnected(true);
            } catch (error) {
                console.log(error);
                setLoadingSpinner(false);
            }
        }
    };

    // React hook to check if wallet is connected
    useEffect(() => {
        checkWalletConnected();
    }, [connectedAddress]);

    // Approve payment for subscription
    async function approve(_price) {
        const cUSDContract = new kit.web3.eth.Contract(
            erc20ABI,
            cUSDContractAddress
        );
        const result = await cUSDContract.methods
            .approve(contractAddress, _price)
            .send({ from: kit.defaultAccount });
        return result;
    }

    // Register function
    const submitRegister = async (e) => {
        e.preventDefault();
        const params = [
            userName.current.value
        ]
        try {
            await contract.methods.addUser(...params)
                .send({ from: kit.defaultAccount });
            setShowRegisterModal(false);
        } catch (error) {
            console.log(error);
        }
        console.log('Username is ', userName.current.value);
    }

    // subscribe to selected users content
    const SubscribeContent = async () => {
        let duration;
        if (subscriptionAmt == 1000000000000000000) {
            duration = 600; // 10 minutes
        } else if (subscriptionAmt == 3000000000000000000) {
            duration = 1200; // 20 minutes
        } else {
            duration = 1800; // 30 minutes
        }
        console.log(`The duration is ${duration} seconds for ${subscriptionAmt}`);
        try {
            await approve(subscriptionAmt);
        } catch (error) {
            console.log("Some error in approval, ", error);
        }
        try {
            const result = await contract.methods
                .subscribeMovie(currentCreatorAddress, duration, subscriptionAmt)
                .send({ from: kit.defaultAccount });
        } catch (error) {
            console.log("Some error in payment, ", error);
        }
    };

    // get user balance
    const getBalance = async () => {
        const totalBalance = await kit.getTotalBalance(kit.defaultAccount);
        console.log(totalBalance);
        const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
        setUserBalance(cUSDBalance);
    };

    // form inputs
    const streamTitle = useRef();
    const streamDescription = useRef();
    const streamURL = useRef();
    const userName = useRef();

    // Add content function
    const submitAddContent = async (e) => {
        e.preventDefault();
        const params = [
            streamTitle.current.value,
            streamDescription.current.value,
            streamURL.current.value,
            "true",
        ];
        try {
            const result = await contract.methods
                .addContent(...params)
                .send({ from: kit.defaultAccount });
            setShowAddModal(false);
        } catch (error) {
            console.log(error);
        }
        console.log("Title is ", streamTitle.current.value);
        console.log("Desc is ", streamDescription.current.value);
    };

    // Withdraw function
    const getMyEarnings = async () => {
        try {
            const earnedBalance = await contract.methods.checkEarnings().call();
            setMy_earnedBalance(earnedBalance);
            setShowEarningsModal(true);
        } catch (error) {
            console.log("Error in checking earned balance", error);
        }
    };

    // Get subsciption status
    const subscriptionStatus = async (useraddress) => {
        const mystatus = await contract.methods
            .getSubscriptionStatus(useraddress)
            .call();
        console.log(mystatus);
        setNotSubscribed(mystatus);
    };

    // Get uploaded content for useraddress
    const getContent = async (useraddress) => {
        await subscriptionStatus(useraddress);
        setCurrentCreatorAddress(useraddress);
        const contents = await contract.methods
            .getMyUploadedMovies(useraddress)
            .call();
        console.log(contents);
        setUserContent(contents);
    };

    const handleChange = (e) => {
        setSubscriptionAmt(e.target.value);
        console.log(e.target.value);
    };

    return (
        <div className="App">
            <nav className="navbar navbar-expand-lg bg-light">
                <div className="container-fluid">
                    <span className="navbar-brand">SubVid</span>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <button
                                    className="btn btn-light"
                                    onClick={() => setShowAddModal(!showAddModal)}
                                >
                                    Add
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className="btn btn-light"
                                    onClick={() => getMyEarnings()}
                                >
                                    Earnings
                                </button>
                            </li>
                        </ul>
                    </div>
                    Balance - {userBalance} cUSD
                </div>
            </nav>

            <div className="container-fluid">
                {/* wallet connected modal */}
                <Modal
                    show={!walletConnected}
                    onClick={() => connectWallet()}
                    style={{ backdropFilter: "blur(20px)" }}
                    size="sm"
                    centered
                >
                    <Button variant="light">
                        <div className="text-center">
                            <div className="logo mb-4 mt-4">
                                <img src={celo_logo} alt="celo logo" width={50} height={50} />
                            </div>
                            {!loadingSpinner ? (
                                <div className="mb-4">
                                    <h5>Connect Wallet</h5>
                                </div>
                            ) : (
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            )}
                        </div>
                    </Button>
                </Modal>

                {/* Add content modal */}
                <Modal
                    show={showAddModal}
                    onHide={() => setShowAddModal(false)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Upload Your Content</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={submitAddContent}>
                            <div className="mb-3">
                                <label htmlFor="exampleInputEmail1" className="form-label">
                                    Title
                                </label>
                                <input
                                    ref={streamTitle}
                                    type="text"
                                    className="form-control"
                                    id="inputTitle"
                                    aria-describedby="titleHelp"
                                    placeholder="Enter the title of your content"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="inputDesc" className="form-label">
                                    About
                                </label>
                                <input
                                    ref={streamDescription}
                                    type="text"
                                    className="form-control"
                                    id="inputDesc"
                                    placeholder="2 liner about your content"
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="inputLink" className="form-label">
                                    Content Link
                                </label>
                                <input
                                    ref={streamURL}
                                    type="text"
                                    className="form-control"
                                    id="inputLink"
                                    placeholder="Paste your content link"
                                />
                            </div>
                            <div className="d-grid gap-2">
                                <button type="submit" className="btn btn-success">
                                    Add
                                </button>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>

                {/* Register with username (you won't be able to access contract features properly without registering) */}
                <Modal show={showRegisterModal} onHide={() => setShowRegisterModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Register</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form onSubmit={submitRegister}>
                            <div className="mb-3">
                                <label htmlFor="exampleInputEmail1" className="form-label">User Name</label>
                                <input ref={userName} type="text" className="form-control" id="inputTitle" aria-describedby="titleHelp" placeholder='Enter UserName' />
                            </div>
                            <div className="d-grid gap-2">
                                <button type='submit' className='btn btn-success'>Register</button>
                            </div>
                        </form>
                    </Modal.Body>
                </Modal>

                {/* Earnings Modal */}
                <Modal
                    show={showEarningsModal}
                    onHide={() => setShowEarningsModal(false)}
                    size="sm"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>My Earnings</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="d-flex flex-row justify-content-center">
                        <h5>{(my_earnedBalance / 10 ** ERC20_DECIMALS).toFixed(2)} cUSD</h5>
                    </Modal.Body>
                </Modal>

                <div className='d-flex flex-row justify-content-around'>
                    <div>
                        <h3>Creators</h3>
                        <ul className="list-group">
                            {listAccounts.map((creator, index) => {
                                const { creatorAddress, creatorUsername } = creator;
                                return (
                                    <button onClick={() => getContent(creatorAddress)} className='list-group-item btn btn-outline-success' key={creatorAddress} id={creatorAddress}>
                                        {creatorUsername}
                                    </button>
                                )
                            })}
                        </ul>
                    </div>

                    {notSubscribed ? (
                        <div className="alert alert-danger mt-5" role="alert">
                            <h4 className="alert-heading">
                                ⚠ You don't have subscription for this creator ⚠
                            </h4>
                            <p>Susbcribe to view the content posted</p>
                            <hr></hr>

                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="inlineRadioOptions"
                                    id="inlineRadio1"
                                    value="1000000000000000000"
                                    onChange={handleChange}
                                />
                                <label className="form-check-label" htmlFor="inlineRadio1">
                                    1 cUSD
                                </label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="inlineRadioOptions"
                                    id="inlineRadio2"
                                    value="3000000000000000000"
                                    onChange={handleChange}
                                />
                                <label className="form-check-label" htmlFor="inlineRadio2">
                                    3 cUSD
                                </label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="inlineRadioOptions"
                                    id="inlineRadio3"
                                    value="5000000000000000000"
                                    onChange={handleChange}
                                />
                                <label className="form-check-label" htmlFor="inlineRadio3">
                                    5 cUSD
                                </label>
                            </div>
                            <div className="d-grid col-6 mx-auto mt-3">
                                <button
                                    className="btn btn-danger"
                                    onClick={() => SubscribeContent()}
                                >
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-75">
                            <div className="d-flex flex-wrap justify-content-around mt-5">
                                {userContent.length === 0 ? (
                                    <div className="alert alert-success" role="alert">
                                        <h4 className="alert-heading">
                                            🎉 Wallet Successfully Connected 🎉
                                        </h4>
                                        <p>Congratulations and Welcome to the SubVid</p>
                                        <p>Your connected Wallet address is {connectedAddress}</p>
                                        <hr></hr>
                                        <p>
                                            Please select any address from the <b>Creators'</b> list
                                            to subscribe and view their content
                                        </p>
                                        <h5>OR</h5>
                                        <button
                                            className="btn btn-success"
                                            onClick={() => setShowAddModal(true)}
                                        >
                                            Add your own 📣
                                        </button>
                                    </div>
                                ) : (
                                    userContent.map((mycontent, index) => {
                                        return (
                                            <div
                                                className="card mb-2 mt-2"
                                                style={{ width: "18rem" }}
                                                key={index}
                                            >
                                                <iframe
                                                    src={mycontent[4]}
                                                    frameBorder="0"
                                                    allow="autoplay; encrypted-media"
                                                    allowFullScreen
                                                    title="video"
                                                />
                                                <div className="card-body">
                                                    <h5 className="card-title">{mycontent["title"]}</h5>
                                                    <p className="card-text">
                                                        {mycontent["description"]}
                                                    </p>
                                                    <a
                                                        href={mycontent["movieUrl"]}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{ color: "white", textDecoration: "none" }}
                                                    >
                                                        <button className="btn btn-primary">Show</button>
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
