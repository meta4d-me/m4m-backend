const Controller = require('egg').Controller;
const data = require('./data');
const constant = require('../utils/constant');

class NFTController extends Controller {
    async getInitParams() {
        const {ctx} = this;
        let param = ctx.request.query;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        if (param.token_id) {
            ctx.body = data.newNormalResp(await ctx.service.nftService.getInitParams(param.chain_name, param.token_id));
        } else {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: token_id");
        }
    }

    async getAttrs() {
        const {ctx} = this;
        let param = ctx.request.query;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        if (param.token_id) {
            ctx.body = data.newNormalResp(await ctx.service.nftService.getAttrs(param.chain_name, param.token_id));
        } else {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: token_id");
        }
    }
}

module.exports = NFTController;
