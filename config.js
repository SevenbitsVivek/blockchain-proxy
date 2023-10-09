module.exports = {
  secret: "22c7a94afbcbe5714280885ebc72a70207f4f202a11130648d11393fa49e93a70f99bc048966bf64a46f71b4f1ec5a1cafd9817e8c262c1ce4890f88e0e4a9756b85ffd64a6c15fdc5a3622fd48836b0f9f35ba81172f6f3b4a89763327e2658637fd9d232e494ab928f6db79a5114244242ae7cdb6a777da7666b5a960383a75e03fcaeb9e3487acbad208baf918f355342aff277c1f40b6d1840e65d2b9f45f65c82bf34b375e1e645c532a489d7b2ecc916579a59e8e01bbce392c11aa1eede6f316d97bf34fecea0f44a0ad98e59ce2dfa881b092dc1671ac9c8b2ab7998d3175ad27dd470a67b98545b8e4d735a1e1dd8a6fecbea6c4f83ccc5ddcb8171",
  audience: "nodejs-jwt-auth",
  issuer: "https://ethprivateblockchain.com",
  HTTP_RPC_PROVIDER: "http://34.173.71.149:8545",
  CONTRACT_ADDRESS: "0x764216006Bf8752322d4a49B205736f280814016",
  CONTRACT_ABI: require('./abis/SavePatientHash.json')["abi"],
  FROM_ADDRESS: "0xF1E90Ea1edc026962b0968691f5D5875ffB80668",
  FROM_ADDRESS_KEY: "1edb4906678cca8ee944cb0bb9760a99b4e244977bc925b680489ff31ad28fdc",
  GAS_PRICE: "0", // in GWEI
  GAS_LIMIT: 1000000,

  HOST: "0.0.0.0",
  USER: "blockchain_proxy",
  PASSWORD: "sevenbits123",
  DATABASE: "blockchain_proxy",
  PORT: 5432,

  ENVIRONMENT: "dev", // The value should be dev or prod
  NETWORK: "private_blockchain", // The value should be kovan or mainnet
  IS_FAIL_TRANSACTION: true, // The value should be false or true 
  LOGGING: true,
  SLACK_CHANNEL: "yuri-poa-blockchain",
  SLACK_USERNAME: "Wallet-watcher",
  SLACK_WEB_HOOK: "https://hooks.slack.com/services/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",
  PROCESS_TRANSACTION_WAIT: 30, // 30 seconds
  TRANSACTION_RECEIPT_WAIT: 60, // 60 seconds   
}