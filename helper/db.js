'use strict';
var config = require('../config');
const { Client } = require('pg');

var pool = null;

function db() {
  if (pool == null) {
    pool = new Client({
      host: config.HOST,
      user: config.USER,
      password: config.PASSWORD,
      database: config.DATABASE,
      port: config.PORT
    });
  }
  pool.connect();
}

db.prototype.storePatientHash = function (patientId, hash, uniqueId) {
  return new Promise(function (resolve, reject) {
    const sqlQuery1 = "INSERT INTO patients (patient_id, hash, unique_id) VALUES ";
    const sqlQuery = sqlQuery1 + `('${patientId}', '${hash}', '${uniqueId}')`
    pool.query(sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] error while saving patient data insert.');
          return reject(error);
        } else {
          console.debug('[DB] Patient data saved successfully into table, affectedRows:', result.rowCount);
          return resolve(result.rowCount);
        }
      });
  });
}

db.prototype.checkUniqueIdInDatabase = function (uniqueId) {
  return new Promise(function (resolve, reject) {
    const sqlQuery = `SELECT COUNT(*) AS count FROM patients WHERE unique_id = '${uniqueId}'`
    pool.query(sqlQuery,
      function (error, result) {
        if (error) {
          console.error('[DB] Error while checking uniqueId:', error);
          let transaction = {};
          transaction.status = false;
          transaction.code = 400;
          transaction.error = "Error getting uniqueId";
          return resolve(transaction);
        } else if (!result.rows[0] || result.rows[0].length === 0) {
          console.debug('[DB] UniqueId not found.');
          let transaction = {};
          transaction.status = true;
          transaction.code = 200;
          transaction.data = [];
          return resolve(transaction);
        } else {
          console.debug('[DB] UniqueId found:', result.rows[0]);
          let transaction = {};
          transaction.status = true;
          transaction.code = 200;
          transaction.data = result.rows[0];
          return resolve(transaction);
        }
      });
  });
};

db.prototype.updateBlockchainStatusToSentInDatabase = function (uniqueId) {
  return new Promise(function (resolve, reject) {
    const sqlQuery = `UPDATE patients SET blockchain_status = 'sent' WHERE unique_id = '${uniqueId}'`
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while updating blockchainStatus:', error);
          return reject(error);
        } else {
          console.debug('[DB] BlockchainStatus updated successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.updateBlockchainTransactionsDetailsInDatabase = function (uniqueId, hash, block_num, from_account, to_account) {
  return new Promise(function (resolve, reject) {
    const sqlQuery = `UPDATE patients SET block_num = '${block_num}', from_account = '${from_account}', to_account = '${to_account}', blockchain_status = 'success' WHERE unique_id = '${uniqueId}' AND hash = '${hash}' AND blockchain_status = 'sent'`
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while updating blockchain transaction details:', error);
          return reject(error);
        } else {
          console.debug('[DB] Blockchain transaction details updated successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.insertTransactionHashInDatabase = function (uniqueId, transactionHash) {
  return new Promise(function (resolve, reject) {
    const sqlQuery = `UPDATE patients SET transaction_hash = '${transactionHash}' WHERE unique_id = '${uniqueId}' AND blockchain_status = 'pending'`
    // console.log('SQL Query:', sqlQuery); // Log the SQL query for debugging
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while inserting transaction hash into database:', error);
          return reject(error);
        } else {
          console.debug('[DB] Transaction hash inserted into database successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.insertValidatePatientHashTransactionDetailInDatabase = function (patient_id, hash, transaction_hash, block_num, from_address, to_address) {
  return new Promise(function (resolve, reject) {
    const sqlQuery1 = "INSERT INTO validatePatientHash (patient_id, hash, transaction_hash, block_num, from_address, to_address) VALUES ";
    const sqlQuery = sqlQuery1 + `('${patient_id}', '${hash}', '${transaction_hash}', '${block_num}', '${from_address}', '${to_address}')`
    // console.log('SQL Query:', sqlQuery); // Log the SQL query for debugging
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while inserting validatePatientHash into database:', error);
          return reject(error);
        } else {
          console.debug('[DB] validatePatientHash inserted into database successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.insertWalletInDatabase = function (wallet_address, private_key) {
  return new Promise(function (resolve, reject) {
    const sqlQuery1 = "INSERT INTO walletaddresses (wallet_address, private_key) VALUES ";
    const sqlQuery = sqlQuery1 + `('${wallet_address}', '${private_key}')`
    // console.log('SQL Query:', sqlQuery); // Log the SQL query for debugging
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while inserting walletaddresses into database:', error);
          return reject(error);
        } else {
          console.debug('[DB] walletaddresses inserted into database successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.insertAddToWhitelistDetailInDatabase = function (whitelist_address, transaction_hash, block_num, from_address, to_address) {
  return new Promise(function (resolve, reject) {
    const sqlQuery1 = "INSERT INTO addToWhitelist (whitelist_address, transaction_hash, block_num, from_address, to_address) VALUES ";
    const sqlQuery = sqlQuery1 + `('${whitelist_address}', '${transaction_hash}', '${block_num}', '${from_address}', '${to_address}')`
    // console.log('SQL Query:', sqlQuery); // Log the SQL query for debugging
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while inserting addToWhitelist into database:', error);
          return reject(error);
        } else {
          console.debug('[DB] addToWhitelist inserted into database successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.insertAddManyToWhitelistDetailInDatabase = function (whitelist_address, transaction_hash, block_num, from_address, to_address) {
  return new Promise(function (resolve, reject) {
    const sqlQuery1 = "INSERT INTO addManyToWhitelist (whitelist_address, transaction_hash, block_num, from_address, to_address) VALUES ";
    const sqlQuery = sqlQuery1 + `('${whitelist_address}', '${transaction_hash}', '${block_num}', '${from_address}', '${to_address}')`
    // console.log('SQL Query:', sqlQuery); // Log the SQL query for debugging
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while inserting addManyToWhitelist into database:', error);
          return reject(error);
        } else {
          console.debug('[DB] addManyToWhitelist inserted into database successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.insertRemoveFromWhitelistDetailInDatabase = function (whitelist_address, transaction_hash, block_num, from_address, to_address) {
  return new Promise(function (resolve, reject) {
    const sqlQuery1 = "INSERT INTO removeFromWhitelist (whitelist_address, transaction_hash, block_num, from_address, to_address) VALUES ";
    const sqlQuery = sqlQuery1 + `('${whitelist_address}', '${transaction_hash}', '${block_num}', '${from_address}', '${to_address}')`
    // console.log('SQL Query:', sqlQuery); // Log the SQL query for debugging
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while inserting removeFromWhitelist into database:', error);
          return reject(error);
        } else {
          console.debug('[DB] removeFromWhitelist inserted into database successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.insertGetLatestPatientHashDetailInDatabase = function (patient_id, transaction_hash, block_num, from_address, to_address) {
  return new Promise(function (resolve, reject) {
    const sqlQuery1 = "INSERT INTO latestPatientHash (patient_id, transaction_hash, block_num, from_address, to_address) VALUES ";
    const sqlQuery = sqlQuery1 + `('${patient_id}', '${transaction_hash}', '${block_num}', '${from_address}', '${to_address}')`
    // console.log('SQL Query:', sqlQuery); // Log the SQL query for debugging
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while inserting latestPatientHash into database:', error);
          return reject(error);
        } else {
          console.debug('[DB] latestPatientHash inserted into database successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.insertGetTotalPatientHashDetailInDatabase = function (patient_id, transaction_hash, block_num, from_address, to_address) {
  return new Promise(function (resolve, reject) {
    const sqlQuery1 = "INSERT INTO totalPatientHash (patient_id, transaction_hash, block_num, from_address, to_address) VALUES ";
    const sqlQuery = sqlQuery1 + `('${patient_id}', '${transaction_hash}', '${block_num}', '${from_address}', '${to_address}')`
    // console.log('SQL Query:', sqlQuery); // Log the SQL query for debugging
    pool.query(
      sqlQuery,
      function (error, result) {
        // console.debug(error, result);
        if (error || !result) {
          console.error('[DB] Error while inserting totalPatientHash into database:', error);
          return reject(error);
        } else {
          console.debug('[DB] totalPatientHash inserted into database successfully.', result.rowCount);
          // Only return a status message in the resolution
          return resolve(result.rowCount);
        }
      }
    );
  });
};

db.prototype.getSentTransactionsFromDatabase = function () {
  return new Promise(function (resolve, reject) {
    pool.query(
      `SELECT patient_id, hash, unique_id, transaction_hash FROM patients WHERE blockchain_status = 'sent'`,
      function (error, results) {
        if (error) {
          console.error('[DB] Error while fetching sent transactions:', error);
          // Return the error object as part of the rejection
          return reject(error);
        } else {
          console.debug('[DB] Fetched sent transactions successfully.');
          // Return the results as part of the resolution
          return resolve(results);
        }
      }
    );
  });
};

db.prototype.getWalletsAddressesFromDatabase = function () {
  return new Promise(function (resolve, reject) {
    pool.query(
      `SELECT wallet_address, private_key FROM walletAddresses`,
      function (error, results) {
        if (error) {
          console.error('[DB] Error while fetching sent transactions:', error);
          // Return the error object as part of the rejection
          return reject(error);
        } else {
          console.debug('[DB] Fetched sent transactions successfully.');
          // Return the results as part of the resolution
          return resolve(results);
        }
      }
    );
  });
};

db.prototype.checkIfWalletExistsOrNot = function (wallet_address, private_key) {
  return new Promise(function (resolve, reject) {
    const sqlQuery = `SELECT * FROM walletAddresses WHERE wallet_address = '${wallet_address}' AND private_key = '${private_key}'`
    // console.log('SQL Query:', sqlQuery); // Log the SQL query for debugging
    pool.query(
      sqlQuery,
      function (error, results) {
        if (error) {
          console.error('[DB] Error while checking if the wallet address exists or not:', error);
          // Return the error object as part of the rejection
          return reject(error);
        } else {
          console.debug('[DB] Fetched wallet address successfully which exists in the database.');
          // Return the results as part of the resolution
          return resolve(results);
        }
      }
    );
  });
};

db.prototype.getSuccessTransactionsFromDatabase = function (uniqueId) {
  return new Promise(function (resolve, reject) {
    const sqlQuery = `SELECT transaction_hash, block_num, from_account, to_account FROM patients WHERE unique_id = '${uniqueId}' AND blockchain_status = 'success'`
    pool.query(
      sqlQuery,
      function (error, results) {
        if (error) {
          console.error('[DB] Error while fetching success transactions:', error);
          // Return the error object as part of the rejection
          return reject(error);
        } else {
          console.debug('[DB] Fetched success transactions successfully.');
          // Return the results as part of the resolution
          return resolve(results);
        }
      }
    );
  });
};

db.prototype.getTransactionStatusFromDatabase = function (uniqueId) {
  return new Promise(function (resolve, reject) {
    const sqlQuery = `SELECT blockchain_status FROM patients WHERE unique_id = '${uniqueId}'`
    pool.query(
      sqlQuery,
      function (error, results) {
        if (error) {
          console.error('[DB] Error while fetching transacton hash:', error);
          // Return the error object as part of the rejection
          return reject(error);
        } else {
          console.debug('[DB] Fetched transaction status successfully.');
          // Return the results as part of the resolution
          return resolve(results);
        }
      }
    );
  });
};

db.prototype.getPendingTransactionsFromDatabase = function () {
  return new Promise(function (resolve, reject) {
    pool.query(
      `SELECT unique_id, patient_id, hash FROM patients WHERE blockchain_status = 'pending'`,
      function (error, results) {
        if (error) {
          console.error('[DB] Error while fetching pending transactions:', error);
          // Return the error object as part of the rejection
          return reject(error);
        } else {
          console.debug('[DB] Fetched pending transactions successfully.');
          // Return the results as part of the resolution
          return resolve(results);
        }
      }
    );
  });
};

db.prototype.getTransactionHashFromDatabase = function (uniqueId) {
  return new Promise(function (resolve, reject) {
    pool.query(
      `SELECT transaction_hash FROM patients WHERE unique_id = '${uniqueId}' AND blockchain_status = 'sent'`,
      function (error, results) {
        if (error) {
          console.error('[DB] Error while fetching sent transaction:', error);
          // Return the error object as part of the rejection
          return reject(error);
        } else {
          console.debug('[DB] Fetched transaction hash transaction successfully.');
          // Return the results as part of the resolution
          return resolve(results);
        }
      }
    );
  });
};
module.exports = db;