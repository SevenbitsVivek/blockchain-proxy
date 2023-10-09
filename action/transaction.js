const eth = require('../helper/eth_web3_helper');
const db = require('../helper/db');
const mysql = new db();

async function addToWhitelist(walletAddress) {
    return await eth.addToWhitelist(walletAddress);
}

async function addManyToWhitelist(walletAddresses) {
    return await eth.addManyToWhitelist(walletAddresses);
}

async function removeFromWhitelist(walletAddress) {
    return await eth.removeFromWhitelist(walletAddress);
}

async function getLatestPatientHash(patientId) {
    return await eth.getLatestPatientHash(patientId);
}

async function getTotalPatientHash(patientId) {
    return await eth.getTotalPatientHash(patientId);
}

async function validatePatientHash(patientId, hash) {
    return await eth.validatePatientHash(patientId, hash);
}

async function checkUniqueIdInDatabase(uniqueId) {
    return await mysql.checkUniqueIdInDatabase(uniqueId);
}

async function getWalletsAddressesFromDatabase() {
    return await mysql.getWalletsAddressesFromDatabase();
}

async function getSentTransactionsFromDatabase() {
    return await mysql.getSentTransactionsFromDatabase();
}

async function getPendingTransactionsFromDatabase() {
    return await mysql.getPendingTransactionsFromDatabase();
}

async function getTransactionHashFromDatabase(uniqueId) {
    return await mysql.getTransactionHashFromDatabase(uniqueId);
}

async function getTransactionStatusFromDatabase(uniqueId) {
    return await mysql.getTransactionStatusFromDatabase(uniqueId);
}

async function getSuccessTransactionsFromDatabase(uniqueId) {
    return await mysql.getSuccessTransactionsFromDatabase(uniqueId);
}

async function storePatientHash(patientId, hash, uniqueId) {
    return await mysql.storePatientHash(patientId, hash, uniqueId);
}

async function insertWalletInDatabase(wallet_address, private_key) {
    return await mysql.insertWalletInDatabase(wallet_address, private_key);
}

async function storePatientHashInBlockchain(patientId, hash) {
    return await eth.storePatientHashInBlockchain(patientId, hash);
}

async function updateBlockchainStatusToSentInDatabase(uniqueId) {
    return await mysql.updateBlockchainStatusToSentInDatabase(uniqueId);
}

async function getTransactionDetailsFromBlockchain(transaction_hash) {
    return await eth.getTransactionDetailsFromBlockchain(transaction_hash);
}

async function insertTransactionHashInDatabase(uniqueId, transactionHash) {
    return await mysql.insertTransactionHashInDatabase(uniqueId, transactionHash);
}

async function insertValidatePatientHashTransactionDetailInDatabase(patient_id, hash, transaction_hash, block_num, from_address, to_address) {
    return await mysql.insertValidatePatientHashTransactionDetailInDatabase(patient_id, hash, transaction_hash, block_num, from_address, to_address);
}

async function insertAddToWhitelistDetailInDatabase(whitelist_address, transaction_hash, block_num, from_address, to_address) {
    return await mysql.insertAddToWhitelistDetailInDatabase(whitelist_address, transaction_hash, block_num, from_address, to_address);
}

async function insertAddManyToWhitelistDetailInDatabase(whitelist_address, transaction_hash, block_num, from_address, to_address) {
    return await mysql.insertAddManyToWhitelistDetailInDatabase(whitelist_address, transaction_hash, block_num, from_address, to_address);
}

async function insertRemoveFromWhitelistDetailInDatabase(whitelist_address, transaction_hash, block_num, from_address, to_address) {
    return await mysql.insertRemoveFromWhitelistDetailInDatabase(whitelist_address, transaction_hash, block_num, from_address, to_address);
}

async function insertGetLatestPatientHashDetailInDatabase(patient_id, transaction_hash, block_num, from_address, to_address) {
    return await mysql.insertGetLatestPatientHashDetailInDatabase(patient_id, transaction_hash, block_num, from_address, to_address);
}

async function insertGetTotalPatientHashDetailInDatabase(patient_id, transaction_hash, block_num, from_address, to_address) {
    return await mysql.insertGetTotalPatientHashDetailInDatabase(patient_id, transaction_hash, block_num, from_address, to_address);
}

async function updateBlockchainTransactionsDetailsInDatabase(uniqueId, hash, block_num, from_account, to_account) {
    return await mysql.updateBlockchainTransactionsDetailsInDatabase(uniqueId, hash, block_num, from_account, to_account);
}

async function checkIfWalletExistsOrNot(wallet_address, private_key) {
    return await mysql.checkIfWalletExistsOrNot(wallet_address, private_key);
}

module.exports = {
    addToWhitelist,
    storePatientHash,
    addManyToWhitelist,
    removeFromWhitelist,
    getTotalPatientHash,
    validatePatientHash,
    getLatestPatientHash,
    insertWalletInDatabase,
    checkUniqueIdInDatabase,
    checkIfWalletExistsOrNot,
    storePatientHashInBlockchain,
    getTransactionHashFromDatabase,
    getWalletsAddressesFromDatabase,
    getSentTransactionsFromDatabase,
    insertTransactionHashInDatabase,
    getTransactionStatusFromDatabase,
    getPendingTransactionsFromDatabase,
    getSuccessTransactionsFromDatabase,
    getTransactionDetailsFromBlockchain,
    insertAddToWhitelistDetailInDatabase,
    updateBlockchainStatusToSentInDatabase,
    insertAddManyToWhitelistDetailInDatabase,
    insertGetTotalPatientHashDetailInDatabase,
    insertRemoveFromWhitelistDetailInDatabase,
    insertGetLatestPatientHashDetailInDatabase,
    updateBlockchainTransactionsDetailsInDatabase,
    insertValidatePatientHashTransactionDetailInDatabase
};