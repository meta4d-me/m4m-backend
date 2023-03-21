const Controller = require('egg').Controller;
const data = require('./data');
const constant = require('../utils/constant');
const ethers = require('ethers');
const utils = require("../utils/utils");

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
                let result = await ctx.service.nftService.generateComponent(param);
                ctx.body = data.newNormalResp(result);
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

    async bindComponentMetadata() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        try {
            await ctx.service.nftService.bindComponentMetadata(param);
            ctx.body = data.newNormalResp({});
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_NORMAL_ERROR, e.toString());
        }
    }

    async getClaimLootParams() {
        const {ctx} = this;
        let param = ctx.request.body;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        ctx.validate({
            addr: 'address'
        }, param);
        if (param.component_ids.length !== param.component_nums.length) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'ill ids length');
            return
        }
        try {
            ctx.body = data.newNormalResp(await ctx.service.nftService.getClaimLootParams(param));
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
        let originalTokenId;
        try {
            originalTokenId = ethers.BigNumber.from(param.original_token_id);
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: token_id");
            return;
        }
        ctx.body = data.newNormalResp(await ctx.service.nftService.getInitParams(param.chain_name,
            param.original_addr, originalTokenId.toString()));
    }

    async getAttrs() {
        const {ctx} = this;
        let param = ctx.request.query;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        let m4mTokenId;
        try {
            m4mTokenId = ethers.BigNumber.from(param.m4m_token_id);
        } catch (e) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, "illegal param: token_id");
            return;
        }
        ctx.body = data.newNormalResp(await ctx.service.nftService.getAttrs(param.chain_name, m4mTokenId.toString()));
    }

    async getMetadata() {
        const {ctx} = this;
        let contract = ctx.params.contract;
        let tokenId = ctx.params.token_id;
        ctx.body = await ctx.service.nftService.getMetadata(contract, tokenId);
    }

    async queryNFT() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        if (!ethers.utils.isAddress(param.contract)) {
            param.contract = undefined;
        }
        if (!ethers.utils.isAddress(param.addr)) {
            param.addr = undefined;
        }
        if (!param.addr && !param.contract) {
            ctx.body = data.newResp(constant.RESP_CODE_ILLEGAL_PARAM, 'illegal user addr and contract addr', {});
        }
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.nftService.queryNFT(param.chain_name, param.addr,
            param.contract, param.token_id, limit, offset));
    }

    async queryCollectionList() {
        const {ctx} = this;
        let param = ctx.query;
        ctx.validate({
            addr: 'address'
        }, param);
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(await ctx.service.nftService.queryCollectionList(param.chain_name, param.addr,
            limit, offset));
    }

    async queryCollectionNFTs() {
        const {ctx} = this;
        let param = ctx.query;
        if (param.addr) {
            ctx.validate({
                addr: 'address'
            }, param);
        }
        ctx.validate({
            chain_name: 'chainName'
        }, param);
        let collectionId = param.collection_id;
        const [limit, offset] = utils.parsePageParamToDBParam(param.page, param.gap);
        ctx.body = data.newNormalResp(
            await ctx.service.nftService.queryCollectionNFTs(param.chain_name, collectionId, param.addr, limit, offset));
    }
}

module.exports = NFTController;
