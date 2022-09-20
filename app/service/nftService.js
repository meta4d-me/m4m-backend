const Service = require('egg').Service;
const ethers = require('ethers');
const {getNodeUrl, METADATA_EXTERNAL, AUTH_CODE_1} = require("../utils/constant");
const ComponentABI = require("../../contract-abi/M4mComponent.json")

class NFTService extends Service {

    async generateComponent(params) {
        if (!(await this.checkSig(params.component_id, params.sig, AUTH_CODE_1))) {
            throw new Error("ill sig")
        }
        let provider = new ethers.providers.JsonRpcProvider(getNodeUrl(params.chain_name))
        let wallet = new ethers.Wallet(this.config.operator.privateKey, provider);
        let componentContract = new ethers.Contract(this.config.components[params.chain_name], ComponentABI, wallet);
        let tx = await componentContract.prepareNewToken(ethers.BigNumber.from(params.component_id),
            params.name, params.symbol);
        // if tx send success, update metadata
        const appDB = this.app.mysql.get('app');
        const tableName = `metadata_${params.chain_name}`;
        await appDB.query('replace into ' + tableName + ' VALUES ( ?, ?, ?, ?, ?, ?, ? )',
            [params.chain_name, this.config.components[params.chain_name], params.component_id,
                params.description, params.name, params.uri, JSON.stringify(params.attrs)]);
        return {tx_hash: tx.hash};
    }

    async bindMetadata(params) {
        if (!(await this.checkSig(params.m4m_token_id, params.sig, AUTH_CODE_1))) {
            throw new Error("ill sig")
        }
        const attrs = await this.formatAttrs(params.chain_name, params.m4m_token_id);
        const appDB = this.app.mysql.get('app');
        const tableName = `metadata_${params.chain_name}`;
        await appDB.query('replace into ' + tableName + ' VALUES ( ?, ?, ?, ?, ?, ?, ? )',
            [params.chain_name, this.config.m4mNFT[params.chain_name], params.m4m_token_id,
                params.description, params.name, params.uri, JSON.stringify(attrs)]);
    }

    async getComponentStatus(chainName, componentId) {
        let result = await this.app.mysql.get('chainData').get(`m4m_components_${chainName}`, {component_id: componentId});
        let status = !result || result.length ? 0 : 1;
        return {status: status}
    }

    async getInitParams(chain_name, original_addr, original_token_id) {
        const appDB = this.app.mysql.get('app');
        let hash = ethers.utils.solidityKeccak256(['bytes'],
            [ethers.utils.solidityPack(['address', 'uint'],
                [original_addr, ethers.BigNumber.from(original_token_id)])]);
        let m4m_token_id = ethers.BigNumber.from(hash);
        let result = await appDB.get(`initialization_${chain_name}`, {token_id: m4m_token_id.toString()});
        if (!result || result.length === 0) { // TODO: adjust initialize algorithm
            /* generate initial attrs, assign 1 to every component */
            const dataDB = this.app.mysql.get('chainData');
            let _componentIds = await dataDB.select(`m4m_components_${chain_name}`, {});
            const componentIds = [];
            for (const cID of _componentIds) {
                let id = ethers.BigNumber.from(cID.component_id);
                if (id.gt(30)) {
                    componentIds.push(id);
                }
            }
            const componentNums = componentIds.map(r => ethers.BigNumber.from(1));
            const hash = ethers.utils.solidityKeccak256(['bytes'],
                [ethers.utils.solidityPack(['uint', `uint[${componentIds.length}]`, `uint[${componentNums.length}]`],
                    [m4m_token_id, componentIds, componentNums])]);
            const sig = ethers.utils.joinSignature(await this.config.operator.signDigest(hash));
            // save to db
            const data = {
                chain_name: chain_name,
                token_id: m4m_token_id.toString(),
                component_ids: componentIds.join(','),
                component_nums: componentNums.join(','),
                sig: sig
            };
            await appDB.insert(`initialization_${chain_name}`, data);
            return data;
        }
        return result;
    }

    async getClaimLootParams(params) {
        if (!(await this.checkSig(params.uuid, params.sig, AUTH_CODE_1))) {
            throw new Error("ill sig")
        }
        const hash = ethers.utils.solidityKeccak256(['bytes'],
            [ethers.utils.solidityPack(
                ['address', 'string', `uint[${params.component_ids.length}]`, `uint[${params.component_nums.length}]`],
                [params.addr, params.uuid, params.component_ids, params.component_nums])]);
        const sig = ethers.utils.joinSignature(await this.config.operator.signDigest(hash));
        return {sig: sig};
    }

    async getAttrs(chain_name, m4m_token_id) {
        const dataDB = this.app.mysql.get('chainData');
        const result = await dataDB.select(`m4m_attrs_${chain_name}`, {
            where: {token_id: m4m_token_id},
        })
        return {
            chain_name: chain_name,
            token_id: m4m_token_id,
            component_ids: result[0].component_ids,
            component_nums: result[0].component_nums,
        }
    }

    async getMetadata(contract, tokenId) {
        for (const chain_name in this.config.components) {
            if (this.config.components[chain_name] === contract) {
                const metadata = await this.app.mysql.get('app').get(`metadata_${chain_name}`, {
                    contract: contract,
                    token_id: tokenId
                });
                if (!metadata) {
                    return {};
                }
                return {
                    description: metadata.description,
                    external_url: METADATA_EXTERNAL,
                    image: metadata.uri,
                    name: metadata.name,
                    attributes: JSON.parse(metadata.attributes),
                }
            }
        }
        for (const chain_name in this.config.m4mNFT) {
            if (this.config.m4mNFT[chain_name] === contract) {
                const metadata = await this.app.mysql.get('app').get(`metadata_${chain_name}`, {
                    contract: contract,
                    token_id: tokenId
                });
                if (!metadata) {
                    return {};
                }
                return {
                    description: metadata.description,
                    external_url: METADATA_EXTERNAL,
                    image: metadata.uri,
                    name: metadata.name,
                    attributes: await this.formatAttrs(chain_name, tokenId),
                }
            }
        }
        // there is no contract in config
        return {};
    }

    async checkSig(msg, sig, authCode) {
        const digest = ethers.utils.hashMessage(msg);
        const signer = ethers.utils.recoverAddress(digest, sig)
        const auth = await this.app.mysql.get('app').get('authentication', {addr: signer});
        if (!auth) {
            return false;
        }
        return auth.auth_code === authCode;
    }

    async formatAttrs(chain_name, token_id) {
        const components = await this.app.mysql.get('chainData').get(`m4m_attrs_${chain_name}`, {token_id: token_id});
        const componentIds = components.component_ids.split(",");
        const componentNums = components.component_nums.split(",");
        const appDB = this.app.mysql.get('app');
        const componentMetadata = await appDB.select(`metadata_${chain_name}`, {
            columns: ['token_id', 'name', 'attributes'], where: {
                token_id: componentIds,
            }
        });
        const attrs = [];
        for (const metadata of componentMetadata) {
            for (let i = 0; i < componentIds.length; i++) {
                if (metadata.token_id === componentIds[i]) {
                    const componentAttrs = JSON.parse(metadata.attributes);
                    attrs.push({
                        trait_type: componentAttrs.find(r => r.trait_type === "position").value,
                        value: componentNums[i] > 1 ? `${componentNums[i]} ${metadata.name}` : metadata.name,
                    })
                }
            }
        }
        return attrs;
    }
}

module.exports = NFTService;
