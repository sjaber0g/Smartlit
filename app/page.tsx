"use client";

import {
  CrossmintAASDK,
  FireblocksNCWSigner,
  Blockchain,
  EVMAAWallet,
} from "@crossmint/client-sdk-aa";
import { useState } from "react";
import { ethers } from "ethers";
const { parseUnits, formatEther } = ethers.utils;

const userIdentifier = { email: "rrohitramesh710@gmail.com" };

export default function Home() {
  const [wallet, setWallet] = useState<EVMAAWallet | undefined>(undefined);
  const [balance, setBalance] = useState<string | undefined>(undefined);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [signedMessage, setSignedMessage] = useState<string | undefined>(
    undefined
  );
  const [verified, setVerified] = useState<string | undefined>(undefined);
  const [signedTypeData, setSignedTypeData] = useState<string | undefined>(
    undefined
  );
  const [txId, setTxId] = useState<string | undefined>(undefined);

  const createAAWallet = async () => {
    setLoading(true);
    const wallet = await createAAWalletHelper();
    console.log(wallet);
    setWallet(wallet);
    setLoading(false);
  };

  const retrieveAAWallet = async () => {
    setLoading(true);
    const wallet = await retrieveAAWalletHelper();
    console.log(wallet);
    setWallet(wallet);
    setLoading(false);
  };

  const purgeAAWalletData = async () => {
    setLoading(true);
    await purgeAAWalletHelper();
    setWallet(undefined);
    setBalance(undefined);
    setAddress(undefined);
    setLoading(false);
  };

  const signMessage = async () => {
    const message =
      "Hey, this app is requesting your signature to prove the ownership of this wallet!";
    // Sign the message
    const signature = await wallet!.signMessage(message);

    setSignedMessage(signature);
  };

  const verifyMessage = async () => {
    const message =
      "Hey, this app is requesting your signature to prove the ownership of this wallet!";
    // Verify the message
    const isVerified = await wallet!.verifyMessage(
      message,
      signedMessage || ""
    );
    if (isVerified) {
      setVerified("Message verified");
    } else {
      setVerified("Message not verified");
    }
    console.log(isVerified ? "Message verified" : "Message not verified");
  };

  const signTypedData = async () => {
    // Define your object with properties itemName and rarity
    if (!wallet) {
      return "The wallet is not initialized";
    }

    const yourObject = {
      itemName: "Your Item Name",
      rarity: "Rare",
    };

    // Define the schema according to EIP-712
    const domain = {
      name: "YourDomain",
      version: "1",
      chainId: 1261120, // Chain ID of Ethereum mainnet, change accordingly
      verifyingContract: "0xYourVerifyingContractAddress" as `0x${string}`, // Replace with the contract address
    };

    const types = {
      YourObject: [
        { name: "itemName", type: "string" },
        { name: "rarity", type: "string" },
      ],
    };

    // Create a typed data object
    const typedData = {
      types: types,
      primaryType: "YourObject",
      domain: domain,
      message: yourObject,
    };
    wallet.sendUserOperation;
    const signature = await wallet.signTypedData(typedData);
    console.log("Typed Data:", typedData);
    console.log("Signed Data:", signature);
    setSignedTypeData(signature);
  };

  const sendTransaction = async () => {
    if (!wallet) {
      return "The wallet is not initialized";
    }

    // Define the transaction parameters
    const transaction = {
      to: "0x6f30064f170921209b3f9e5f968bb3f59d598fe4", // Recipient address
      gasLimit: 21000, // Gas limit for the transaction (optional)
      gasPrice: parseUnits("20", "gwei"), // Gas price for the transaction (optional)
      data: "0x6057361d0000000000000000000000000000000000000000000000000000000000000022", // Arbitrary data, such as input parameters for smart contract functions or additional transaction details. (Optional)
    };

    // Send the transaction
    const txnResult = await wallet.sendTransaction(transaction);
    setTxId(txnResult.hash);
  };

  const getAddress = async () => {
    if (!wallet) {
      return "The wallet is not initialized";
    }

    const address = await wallet.getAddress();
    setAddress(address);
  };

  const getBalance = async () => {
    if (!wallet) {
      return "The wallet is not initialized";
    }

    const balance = await wallet.getBalance();
    setBalance(formatEther(balance.toString()));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Wallet not set section */}
      {!wallet && (
        <div>
          <div>Wallet not created</div>
          <div>
            <button onClick={createAAWallet}>Create Wallet</button>
          </div>
          <div>
            <button onClick={retrieveAAWallet}>Retrieve Wallet</button>
          </div>
        </div>
      )}
      {/* Wallet set section */}
      {wallet && (
        <>
          <div>
            <button onClick={getAddress}>Get Address</button>
            {address && <div>Address: {address}</div>}
          </div>
          <div>
            <button onClick={getBalance}>Get Balance</button>
            {balance && <div>Balance: {balance}</div>}
          </div>
          <div>
            <button onClick={purgeAAWalletData}>Purge wallet data</button>
          </div>
          <div>
            <button onClick={signMessage}>Sign Message</button>
            {signedMessage && <div>Signed Message: {signedMessage}</div>}
          </div>
          <div>
            <button onClick={verifyMessage}>Verify Message</button>
            {verified && <div>Verification: {verified}</div>}
          </div>
          <div>
            <button onClick={signTypedData}>Sign Typed Data</button>
            {signedTypeData && <div>Sign Typed Data: {signedTypeData}</div>}
          </div>
          <div>
            <button onClick={sendTransaction}>Send Transaction</button>
            {txId && <div>TxId: {txId}</div>}
          </div>
        </>
      )}
    </div>
  );
}

const createAAWalletHelper = async () => {
  const xm = CrossmintAASDK.init({
    apiKey: process.env.NEXT_PUBLIC_API_KEY || "",
  });

  const fireblocksNCWSigner: FireblocksNCWSigner = {
    type: "FIREBLOCKS_NCW",
    passphrase: "1234",
  };

  const walletInitParams = {
    signer: fireblocksNCWSigner,
  };

  return xm.getOrCreateWallet(
    userIdentifier,
    Blockchain.ETHEREUM_SEPOLIA,
    walletInitParams
  );
};

const retrieveAAWalletHelper = async () => {
  const xm = CrossmintAASDK.init({
    apiKey: process.env.NEXT_PUBLIC_API_KEY || "",
  });

  //Create here the Signer - Fireblocks NCW Signer | Ethers Signer | Web3Auth Signer defined in the next steps
  const signer: FireblocksNCWSigner = {
    type: "FIREBLOCKS_NCW",
    passphrase: "1234",
  };

  const walletInitParams = {
    signer,
  };
  const userIdentifier = { email: "rrohitramesh710@gmail.com" };
  /*const userIdentifier = { userId: <uuid> };
const userIdentifier = { phoneNumber: <phoneNumber> };*/

  return xm.getOrCreateWallet(
    userIdentifier,
    Blockchain.ETHEREUM_SEPOLIA,
    walletInitParams
  );
};

const purgeAAWalletHelper = async () => {
  const xm = CrossmintAASDK.init({
    apiKey: process.env.NEXT_PUBLIC_API_KEY || "",
  });

  await xm.purgeAllWalletData();
  console.info("Purged user wallet data");
};
