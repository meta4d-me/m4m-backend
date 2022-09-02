const Controller = require('egg').Controller;
const data = require('./data');
const constant = require('../utils/constant');

class NFTController extends Controller {

    async generateComponent() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        // check position attrs
        let valid = false;
        for (const attr of param.attrs) {
            if (attr.trait_type === "position") {
                valid = true;
                break
            }
        }
        if (valid) {
            try {
                await ctx.service.nftService.generateComponent(param);
                ctx.body = data.newNormalResp({});
            } catch (e) {
                ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
            }
        } else {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal attrs: missing position");
        }
    }

    async bindMetadata() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        try {
            await ctx.service.nftService.bindMetadata(param);
            ctx.body = data.newNormalResp({});
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }

    async getComponentStatus() {
        const {ctx} = this;
        let param = ctx.params;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        ctx.body = data.newNormalResp(await ctx.service.nftService.getComponentStatus(param.chain_name, param.component_id));
    }

    async getInitParams() {
        const {ctx} = this;
        let param = ctx.request.query;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        ctx.validate({
            original_addr: 'address'
        }, param);
        if (ethers.BigNumber.isBigNumber(param.original_token_id)) {
            ctx.body = data.newNormalResp(await ctx.service.nftService.getInitParams(param.chain_name,
                param.original_addr, param.original_token_id));
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
        if (ethers.BigNumber.isBigNumber(param.m4m_token_id)) {
            ctx.body = data.newNormalResp(await ctx.service.nftService.getAttrs(param.chain_name, param.m4m_token_id));
        } else {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: token_id");
        }
    }

    async getMetadata() {
        const {ctx} = this;
        let contract = ctx.params.contract;
        let tokenId = ctx.params.token_id;
        ctx.body = data.newNormalResp(await ctx.service.nftService.getMetadata(contract, tokenId));
    }
}

module.exports = NFTController;
