const ethers = require("ethers");
const constant = require('./app/utils/constant')

// TODO: verify chain name
module.exports = app => {
    app.validator.addRule('address', (rule, value) => {
        if (!ethers.utils.isAddress(value)) {
            return 'illegal addr';
        }
    })
    app.validator.addRule('chainName', (rule, value) => {
        if (value !== constant.CHAIN_NAME_MUMBAI && value !== constant.CHAIN_NAME_POLYGON &&
            value !== constant.CHAIN_NAME_RINKEBY && value !== constant.CHAIN_NAME_MAINNET) {
            return 'illegal chain name';
        }
    })
};
