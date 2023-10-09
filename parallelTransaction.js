const { ethers } = require('ethers');
const config = require('./config');
const SlackHelper = require('./helper/slackHelper');
const logger = require('./utils/logger');
const transaction = require('./action/transaction');

const provider = new ethers.providers.JsonRpcProvider(config.HTTP_RPC_PROVIDER);
// For production use
init();
setInterval(() => transactionReceipt(), 1000 * config.TRANSACTION_RECEIPT_WAIT); // 60 seconds

async function init() {
    logger.info('Initializing SavePatientHash Transaction Sender Service...');
    await getWallet();
    await processTransactions();
    await transactionReceipt();
}

/**
 * Retrieves the wallet information.
*/
async function getWallet() {
    try {
        logger.info('Getting wallet...');
        const res = await transaction.getWalletsAddressesFromDatabase();
        logger.log(`Got Wallets:${res.rowCount}`);
    } catch (err) {
        logger.error(`getWallet:${err}`);
        new SlackHelper().senderror({ txt: `getWallet: ${err}` });
    }
}

/**
 * Process transactions
*/
async function processTransactions() {
    try {
        logger.info('Processing transactions...');
        const res = await transaction.getPendingTransactionsFromDatabase();
        if (res.rowCount < 1) {
            logger.info('No pending transactions got to process...');
            await new Promise(resolve => setTimeout(resolve, 1000 * config.PROCESS_TRANSACTION_WAIT)); // 30 seconds waiting for transactions
            await processTransactions();
        } else {
            logger.info(`Got ${res.rowCount} pending transactions`);
            await splitTransactions(res.rows);
        }
    } catch (err) {
        logger.error(err);
        new SlackHelper().senderror({ txt: `Your savePatientHash script main function has failed due to: ${err}` });
        await new Promise(resolve => setTimeout(resolve, 1000 * config.PROCESS_TRANSACTION_WAIT)); // 30 seconds waiting for transactions
        await processTransactions();
    }
}

async function splitTransactions(pendingTransactions) {
    try {
        logger.info('Splitting pending transactions...');
        const res = await transaction.getWalletsAddressesFromDatabase();
        if (pendingTransactions.length === 0) {
            await delay(config.PROCESS_TRANSACTION_WAIT);
            await processTransactions();
            return;
        }
        const batchSize = Math.ceil(pendingTransactions.length / res.rowCount);
        logger.info(`Generating transaction batch: ${batchSize}`);
        const batchPromises = [];
        for (let i = 0; i < res.rowCount; i++) {
            const walletAddress = res.rows[i];
            const batch = pendingTransactions.splice(0, batchSize);
            const promise = sendBatchTransactions(batch, walletAddress);
            batchPromises.push(promise);
        }
        logger.info('Executing all promises...');
        const results = await Promise.all(batchPromises);
        await handleTransactionPromises(results);
    } catch (err) {
        handleError(err, 'splitTransactions');
    }
}

async function sendBatchTransactions(totalTransactions, account) {
    return new Promise(async function (resolve, reject) {
        let all_transaction = [];
        logger.info(`Sending batch of ${totalTransactions.length} transactions from ${account.wallet_address}`);
        // let transactionCount = await provider.getTransactionCount(account.wallet_address);
        for (const pendingTransaction of totalTransactions) {
            try {
                let wallets = new ethers.Wallet(account.private_key);
                let signer = wallets.connect(provider);
                let savePatientHashContract = new ethers.Contract(config.CONTRACT_ADDRESS, config.CONTRACT_ABI, signer);
                if (pendingTransaction != undefined) {
                    let gasLimit = 400000
                    let pt = await savePatientHashContract.populateTransaction.storePatientHash(pendingTransaction.patient_id, pendingTransaction.hash, ({ gasLimit: gasLimit }))
                    if (pt) {
                        let sentTransaction = await signer.sendTransaction(pt)
                        console.log(`Transaction signed and sent: ${sentTransaction.hash}`);
                        await transaction.insertTransactionHashInDatabase(pendingTransaction.unique_id, sentTransaction.hash)
                        // Update the database with the blockchain status
                        await transaction.updateBlockchainStatusToSentInDatabase(pendingTransaction.unique_id);
                        if (sentTransaction) {
                            var record = { 'status': true, 'transactionHash': sentTransaction.hash, 'fromAddress': sentTransaction.from, 'toAddress': sentTransaction.to, 'uniqueId': pendingTransaction.unique_id, 'patientId': pendingTransaction.patient_id, 'hash': pendingTransaction.hash }
                            all_transaction.push(record)
                        }
                    }
                }
            } catch (err) {
                logger.error(err);
                await new SlackHelper().senderror({ txt: `Your savePatientHash transaction script is fail due to: ${err}` })
                pendingTransaction.status = false
                all_transaction.push(pendingTransaction)
            }
        }
        resolve(all_transaction)
    })
}

async function transactionReceipt() {
    try {
        logger.info('Getting transaction receipt of sent transaction...');
        // Retrieve pending transactions from the database
        const sentTransactions = await transaction.getSentTransactionsFromDatabase();
        if (sentTransactions.rows.length > 0) {
            // Process each pending transaction and execute it on the blockchain
            for (const transactions of sentTransactions.rows) {
                const { unique_id, hash } = transactions;
                const getTransactionDetailsFromBlockchain = await transaction.getTransactionDetailsFromBlockchain(transactions.transaction_hash)
                // Update the database with the blockchain status
                await transaction.updateBlockchainTransactionsDetailsInDatabase(unique_id, hash, getTransactionDetailsFromBlockchain.block_num, getTransactionDetailsFromBlockchain.from_account, getTransactionDetailsFromBlockchain.to_account);
            }
        } else {
            console.error("No sent transactions found");
        }
    } catch (err) {
        logger.error(err);
        new SlackHelper().senderror({ txt: `Your script transactionReceipt function failed due to ${err}` });
    }
}

async function handleTransactionPromises(batchPromises) {
    logger.info(`Handling ${batchPromises.length} promises results....`);
    let allSuccessTransaction = [];
    let failTransaction = [];
    for (const transactionPromises of batchPromises) {
        for (const transaction of transactionPromises) {
            if (transaction.status === true) {
                allSuccessTransaction.push(transaction);
            } else {
                failTransaction.push(transaction);
            }
        }
    }
    logger.log('All success transactions: ' + allSuccessTransaction.length);
    logger.log('All fail transactions: ' + failTransaction.length);
    await new Promise(resolve => setTimeout(resolve, 1000 * config.PROCESS_TRANSACTION_WAIT)); // 30 seconds waiting for transactions
    await processTransactions();
}

async function handleError(err, context) {
    logger.error(`${context}: ${err}`);
    new SlackHelper().senderror({ txt: `${context}: ${err}` });
    await delay(config.PROCESS_TRANSACTION_WAIT);
    await processTransactions();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}