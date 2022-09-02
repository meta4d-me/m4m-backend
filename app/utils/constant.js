const zeroAddr = '0x0000000000000000000000000000000000000000';
const env = require("../../config/env.json");
const RESP_CODE_NORMAL_ERROR = 50000;

const RESP_CODE_ILLEGAL_PARAM = 40000;
const RESP_CODE_ILLEGAL_SIG = 40001;

const CHAIN_NAME_MAINNET = "mainnet";
const CHAIN_NAME_POLYGON = "polygon";
const CHAIN_NAME_RINKEBY = "rinkeby";
const CHAIN_NAME_MUMBAI = "mumbai";

const ERC721 = '721';
const ERC1155 = '1155';

const METADATA_EXTERNAL = "https://www.meta4d.me/"

const AUTH_CODE_1 = 1;

function getExplorer(chainName) {
    if (chainName === CHAIN_NAME_MAINNET) {
        return "https://api.etherscan.io/api";
    } else if (chainName === CHAIN_NAME_POLYGON) {
        return 'https://api-testnet.polygonscan.com/api';
    } else if (chainName === CHAIN_NAME_RINKEBY) {
        return 'https://api-rinkeby.etherscan.io/api';
    } else if (chainName === CHAIN_NAME_MUMBAI) {
        return 'https://api-testnet.polygonscan.com/api';
    } else {
        return "";
    }
}

function getNodeUrl(chainName) {
    if (chainName === CHAIN_NAME_MAINNET) {
        return "https://eth-mainnet.g.alchemy.com/v2/" + env.ALCHEMY_MAINNET;
    } else if (chainName === CHAIN_NAME_POLYGON) {
        return 'https://polygon-mainnet.g.alchemy.com/v2/' + env.ALCHEMY_POLYGON;
    } else if (chainName === CHAIN_NAME_RINKEBY) {
        return 'https://eth-rinkeby.g.alchemy.com/v2/' + env.ALCHEMY_RINKEBY;
    } else if (chainName === CHAIN_NAME_MUMBAI) {
        return 'https://polygon-mumbai.g.alchemy.com/v2/' + env.ALCHEMY_MUMBAI;
    } else {
        return "";
    }
}

module.exports = {
    zeroAddr,
    RESP_CODE_NORMAL_ERROR, RESP_CODE_ILLEGAL_PARAM, RESP_CODE_ILLEGAL_SIG,

    CHAIN_NAME_MAINNET, CHAIN_NAME_POLYGON, CHAIN_NAME_RINKEBY, CHAIN_NAME_MUMBAI,
    getExplorer, getNodeUrl, METADATA_EXTERNAL,

    ERC721, ERC1155,

    AUTH_CODE_1
}
