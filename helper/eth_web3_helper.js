'use strict';

var Web3 = require('web3');
const { ethers, providers, Wallet } = require('ethers');
var config = require('../config');
const InputDataDecoder = require('ethereum-input-data-decoder');

/**
 * HttpProvider that helps to communicate to ETH Blockchain. 
*/
var web3 = new Web3(new Web3.providers.HttpProvider(config.HTTP_RPC_PROVIDER));
const provider = new providers.JsonRpcProvider(config.HTTP_RPC_PROVIDER);
const wallet = new Wallet(Buffer.from(config.FROM_ADDRESS_KEY, "hex"));

/**
 * Get the nonce of given address from ETH.
*/
function getBalance(accountAddress) {
  let response = {};
  return web3.eth.getBalance(accountAddress, "latest").then((nonce) => {
    console.info('eth get nonce result:' + nonce);
    response.status = true;
    response.code = 200;
    response.data = {
      "nonce": nonce,
      "address": accountAddress
    };
    return Promise.resolve(response);
  }).catch((err) => {
    console.info('eth get nonce error:' + err);
    response.status = false;
    response.code = 400;
    response.data = {
      "nonce": -1,
      "address": accountAddress
    };
    return Promise.resolve(response);
  });
}

/**
 * Get the nonce of given address from ETH.
*/
function getNonce(accountAddress) {
  let response = {};
  return web3.eth.getTransactionCount(accountAddress).then((nonce) => {
    console.info('eth get nonce result:' + nonce);
    response.status = true;
    response.code = 200;
    response.data = {
      "nonce": nonce,
      "address": accountAddress
    };
    return Promise.resolve(response);
  }).catch((err) => {
    console.info('eth get nonce error:' + err);
    response.status = false;
    response.code = 400;
    response.data = {
      "nonce": -1,
      "address": accountAddress
    };
    return Promise.resolve(response);
  });
}

function storePatientHashInBlockchain(patientId, hash) {
  return new Promise(function (resolve, reject) {
    getNonce(config.FROM_ADDRESS)
      .then(async function (response) {
        console.log('createTransaction nonce:', response);
        if (response === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data.nonce === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        const gasPriceGwei = config.GAS_PRICE; // in GWEI
        const gasPriceWei = ethers.utils.parseUnits(gasPriceGwei, "gwei");
        const signer = wallet.connect(provider);
        const contract = new ethers.Contract(config.CONTRACT_ADDRESS, config.CONTRACT_ABI, signer);
        const storePatientHash = await contract.storePatientHash(patientId, hash,
          { gasLimit: config.GAS_LIMIT, gasPrice: gasPriceWei }
        );
        console.log("storePatientHash:", JSON.stringify(storePatientHash));
        let transaction = {};
        transaction.status = true;
        transaction.code = 200;
        transaction.data = {
          "status": true,
          "transaction_id": storePatientHash.hash,
          "from_account": storePatientHash.from,
          "to_account": storePatientHash.to
        };
        return resolve(transaction);
      });
  });
};

function validatePatientHash(patientId, hash) {
  return new Promise(function (resolve, reject) {
    getNonce(config.FROM_ADDRESS)
      .then(async function (response) {
        console.log('createTransaction nonce:', response);
        if (response === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data.nonce === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        const gasPriceGwei = config.GAS_PRICE; // in GWEI
        const gasPriceWei = ethers.utils.parseUnits(gasPriceGwei, "gwei");
        const signer = wallet.connect(provider);
        const contract = new ethers.Contract(config.CONTRACT_ADDRESS, config.CONTRACT_ABI, signer);
        const validatePatientHash = await contract.validatePatientHash(patientId, hash,
          { gasLimit: config.GAS_LIMIT, gasPrice: gasPriceWei }
        );
        console.log("ValidatePatientHash:", JSON.stringify(validatePatientHash));
        const getTransactionReceipt = await provider.waitForTransaction(validatePatientHash.hash)
        const data = validatePatientHash.data;
        const decoder = new InputDataDecoder(config.CONTRACT_ABI);
        const result = decoder.decodeData(data);
        const decodedDataParameter = ethers.utils.defaultAbiCoder.decode(['bool'], getTransactionReceipt.logs[0].data);
        let transaction = {};
        transaction.status = true;
        transaction.code = 200;
        transaction.data = {
          "status": true,
          "transaction_id": validatePatientHash.hash,
          "from_account": validatePatientHash.from,
          "to_account": validatePatientHash.to,
          "block_num": getTransactionReceipt.blockNumber,
          "inputs1": result.inputs[0],
          "inputs2": result.inputs[1],
          "transactionOutput": decodedDataParameter[0],
          "transactionStatus": Boolean(getTransactionReceipt.status)
        };
        return resolve(transaction);
      });
  });
};

function addToWhitelist(walletAddress) {
  return new Promise(function (resolve, reject) {
    getNonce(config.FROM_ADDRESS)
      .then(async function (response) {
        console.log('createTransaction nonce:', response);
        if (response === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data.nonce === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        const gasPriceGwei = config.GAS_PRICE; // in GWEI
        const gasPriceWei = ethers.utils.parseUnits(gasPriceGwei, "gwei");
        const signer = wallet.connect(provider);
        const contract = new ethers.Contract(config.CONTRACT_ADDRESS, config.CONTRACT_ABI, signer);
        const addToWhitelist = await contract.addToWhitelist(walletAddress,
          { gasLimit: config.GAS_LIMIT, gasPrice: gasPriceWei }
        );
        console.log("AddToWhitelist:", JSON.stringify(addToWhitelist));
        const getTransactionReceipt = await provider.waitForTransaction(addToWhitelist.hash)
        const data = addToWhitelist.data;
        const decoder = new InputDataDecoder(config.CONTRACT_ABI);
        const result = decoder.decodeData(data);
        let transaction = {};
        transaction.status = true;
        transaction.code = 200;
        transaction.data = {
          "status": true,
          "transaction_id": addToWhitelist.hash,
          "from_account": addToWhitelist.from,
          "to_account": addToWhitelist.to,
          "block_num": getTransactionReceipt.blockNumber,
          "transactionInput": result.inputs[0],
          "transactionStatus": Boolean(getTransactionReceipt.status)
        };
        return resolve(transaction);
      });
  });
};

function addManyToWhitelist(walletAddress) {
  return new Promise(function (resolve, reject) {
    getNonce(config.FROM_ADDRESS)
      .then(async function (response) {
        console.log('createTransaction nonce:', response);
        if (response === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data.nonce === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        const gasPriceGwei = config.GAS_PRICE; // in GWEI
        const gasPriceWei = ethers.utils.parseUnits(gasPriceGwei, "gwei");
        const signer = wallet.connect(provider);
        const contract = new ethers.Contract(config.CONTRACT_ADDRESS, config.CONTRACT_ABI, signer);
        const addManyToWhitelist = await contract.addManyToWhitelist(walletAddress,
          { gasLimit: config.GAS_LIMIT, gasPrice: gasPriceWei }
        );
        console.log("AddManyToWhitelist:", JSON.stringify(addManyToWhitelist));
        const getTransactionReceipt = await provider.waitForTransaction(addManyToWhitelist.hash)
        const data = addManyToWhitelist.data;
        const decoder = new InputDataDecoder(config.CONTRACT_ABI);
        const result = decoder.decodeData(data);
        let transaction = {};
        transaction.status = true;
        transaction.code = 200;
        transaction.data = {
          "status": true,
          "transaction_id": addManyToWhitelist.hash,
          "from_account": addManyToWhitelist.from,
          "to_account": addManyToWhitelist.to,
          "block_num": getTransactionReceipt.blockNumber,
          "transactionInput": result.inputs[0],
          "transactionStatus": Boolean(getTransactionReceipt.status)
        };
        return resolve(transaction);
      });
  });
};

function removeFromWhitelist(walletAddress) {
  return new Promise(function (resolve, reject) {
    getNonce(config.FROM_ADDRESS)
      .then(async function (response) {
        console.log('createTransaction nonce:', response);
        if (response === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data.nonce === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        const gasPriceGwei = config.GAS_PRICE; // in GWEI
        const gasPriceWei = ethers.utils.parseUnits(gasPriceGwei, "gwei");
        const signer = wallet.connect(provider);
        const contract = new ethers.Contract(config.CONTRACT_ADDRESS, config.CONTRACT_ABI, signer);
        const removeFromWhitelist = await contract.removeFromWhitelist(walletAddress,
          { gasLimit: config.GAS_LIMIT, gasPrice: gasPriceWei }
        );
        console.log("RemoveFromWhitelist:", JSON.stringify(removeFromWhitelist));
        const getTransactionReceipt = await provider.waitForTransaction(removeFromWhitelist.hash)
        const data = removeFromWhitelist.data;
        const decoder = new InputDataDecoder(config.CONTRACT_ABI);
        const result = decoder.decodeData(data);
        let transaction = {};
        transaction.status = true;
        transaction.code = 200;
        transaction.data = {
          "status": true,
          "transaction_id": removeFromWhitelist.hash,
          "from_account": removeFromWhitelist.from,
          "to_account": removeFromWhitelist.to,
          "block_num": getTransactionReceipt.blockNumber,
          "transactionInput": result.inputs[0],
          "transactionStatus": Boolean(getTransactionReceipt.status)
        };
        return resolve(transaction);
      });
  });
};

function getLatestPatientHash(patientId) {
  return new Promise(function (resolve, reject) {
    getNonce(config.FROM_ADDRESS)
      .then(async function (response) {
        console.log('createTransaction nonce:', response);
        if (response === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data.nonce === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        const gasPriceGwei = config.GAS_PRICE; // in GWEI
        const gasPriceWei = ethers.utils.parseUnits(gasPriceGwei, "gwei");
        const signer = wallet.connect(provider);
        const contract = new ethers.Contract(config.CONTRACT_ADDRESS, config.CONTRACT_ABI, signer);
        const getLatestPatientHash = await contract.getLatestPatientHash(patientId,
          { gasLimit: config.GAS_LIMIT, gasPrice: gasPriceWei }
        );
        console.log("GetLatestPatientHash:", JSON.stringify(getLatestPatientHash));
        const getTransactionReceipt = await provider.waitForTransaction(getLatestPatientHash.hash)
        const data = getLatestPatientHash.data;
        const decoder = new InputDataDecoder(config.CONTRACT_ABI);
        const result = decoder.decodeData(data);
        const decodedIndexedParameter = ethers.utils.defaultAbiCoder.decode(['string'], getTransactionReceipt.logs[0].data);
        let transaction = {};
        transaction.status = true;
        transaction.code = 200;
        transaction.data = {
          "status": true,
          "transaction_id": getLatestPatientHash.hash,
          "from_account": getLatestPatientHash.from,
          "to_account": getLatestPatientHash.to,
          "block_num": getTransactionReceipt.blockNumber,
          "transactionInput": result.inputs[0],
          "transactionOutput": decodedIndexedParameter[0],
          "transactionStatus": Boolean(getTransactionReceipt.status)
        };
        return resolve(transaction);
      });
  });
};

function getTotalPatientHash(patientId) {
  return new Promise(function (resolve, reject) {
    getNonce(config.FROM_ADDRESS)
      .then(async function (response) {
        console.log('createTransaction nonce:', response);
        if (response === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        if (response.data.nonce === undefined) {
          return reject({ message: 'Invalid nonce.', status: 102 });
        }
        const gasPriceGwei = config.GAS_PRICE; // in GWEI
        const gasPriceWei = ethers.utils.parseUnits(gasPriceGwei, "gwei");
        const signer = wallet.connect(provider);
        const contract = new ethers.Contract(config.CONTRACT_ADDRESS, config.CONTRACT_ABI, signer);
        const getTotalPatientHash = await contract.getTotalPatientHash(patientId,
          { gasLimit: config.GAS_LIMIT, gasPrice: gasPriceWei }
        );
        console.log("GetTotalPatientHash:", JSON.stringify(getTotalPatientHash));
        const getTransactionReceipt = await provider.waitForTransaction(getTotalPatientHash.hash)
        const decodedDataParameterForTotalPatientHash = ethers.utils.defaultAbiCoder.decode(['uint'], getTransactionReceipt.logs[0].data);
        const decodedDataParameterForPatientHashes = ethers.utils.defaultAbiCoder.decode(['string[]'], getTransactionReceipt.logs[1].data);
        const data = getTotalPatientHash.data;
        const decoder = new InputDataDecoder(config.CONTRACT_ABI);
        const result = decoder.decodeData(data);
        let transaction = {};
        transaction.status = true;
        transaction.code = 200;
        transaction.data = {
          "status": true,
          "transaction_id": getTotalPatientHash.hash,
          "from_account": getTotalPatientHash.from,
          "to_account": getTotalPatientHash.to,
          "block_num": getTransactionReceipt.blockNumber,
          "transactionInput": result.inputs[0],
          "transactionOutput1": decodedDataParameterForTotalPatientHash[0].toString(),
          "transactionOutput2": decodedDataParameterForPatientHashes[0].toString(),
          "transactionStatus": Boolean(getTransactionReceipt.status)
        };
        return resolve(transaction);
      });
  });
};

async function getTransactionDetailsFromBlockchain(transactionHash) {
  try {
    const transaction = await web3.eth.getTransactionReceipt(transactionHash);
    if (!transaction) {
      // Handle the case where the transaction does not exist
      return null;
    }
    // Extract the relevant information from the transaction object
    const transactionDetails = {
      transaction_id: transaction.transactionHash,
      block_num: transaction.blockNumber,
      from_account: transaction.from,
      to_account: transaction.to,
      transaction_status: transaction.status
    };
    return transactionDetails;
  } catch (error) {
    // Handle any errors that may occur during the transaction retrieval
    console.error("Error fetching transaction details:", error);
    throw error;
  }
}

module.exports = {
  getNonce: getNonce,
  getBalance: getBalance,
  addToWhitelist: addToWhitelist,
  addManyToWhitelist: addManyToWhitelist,
  removeFromWhitelist: removeFromWhitelist,
  getLatestPatientHash: getLatestPatientHash,
  getTotalPatientHash: getTotalPatientHash,
  storePatientHashInBlockchain: storePatientHashInBlockchain,
  validatePatientHash: validatePatientHash,
  getTransactionDetailsFromBlockchain: getTransactionDetailsFromBlockchain
};