const cron = require('node-cron');
const transaction = require('./action/transaction');

// Schedule the cron job to run at a specific interval
cron.schedule('* * * * *', async () => {
    try {
        // Retrieve pending transactions from the database
        const pendingTransactions = await transaction.getPendingTransactionsFromDatabase();
        console.log
        // Process each pending transaction and execute it on the blockchain
        for (const transactions of pendingTransactions.rows) {
            const { unique_id, patient_id, hash } = transactions;
            // Execute the transaction on the blockchain
            const storePatientHashInBlockchain = await transaction.storePatientHashInBlockchain(patient_id, hash);
            await transaction.insertTransactionHashInDatabase(unique_id, storePatientHashInBlockchain.data.transaction_id)
            // Update the database with the blockchain status
            await transaction.updateBlockchainStatusToSentInDatabase(unique_id);
        }
    } catch (error) {
        console.error('Cron job error:', error);
    }
}, {
    scheduled: true,
    timezone: 'UTC', // Set your desired timezone
});
