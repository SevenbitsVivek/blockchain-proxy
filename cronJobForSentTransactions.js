const cron = require('node-cron');
const transaction = require('./action/transaction');

// Schedule the cron job to run at a specific interval
cron.schedule('* * * * *', async () => {
    try {
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
    } catch (error) {
        console.error('Cron job error:', error);
    }
}, {
    scheduled: true,
    timezone: 'UTC', // Set your desired timezone
});