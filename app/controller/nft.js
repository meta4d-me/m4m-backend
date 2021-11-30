const Controller = require('egg').Controller;
const data = require('./data');
const Web3 = require('web3');
const web3 = new Web3();
const constant = require('../utils/constant');

class NFTController extends Controller {
    async getInitParams(){
        // TODO:
    }

    async getAttrs(){
        // TODO:
    }
}

module.exports = NFTController;
