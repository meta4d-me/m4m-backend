const Service = require('egg').Service;
const ethers = require('ethers');

class NFTService extends Service {
    async getInitParams(chain_name, token_id) {
        const appDB = this.app.mysql.get('app');
        let result = await appDB.get(`initialization_${chain_name}`, {token_id: token_id});
        if (!result || result.length === 0) { // TODO: adjust initialize algorithm
            /* generate initial attrs, assign 1 to every component */
            const dataDB = this.app.mysql.get('chainData');
            let componentIds = await dataDB.select(`m4m_components_${chain_name}`, {});
            componentIds = componentIds.map(r => ethers.BigNumber.from(r.component_id));
            const componentNums = componentIds.map(r => ethers.BigNumber.from(1));
            const hash = ethers.utils.solidityKeccak256(['bytes'],
                [ethers.utils.solidityPack(['uint', `uint[${componentIds.length}]`, `uint[${componentNums.length}]`],
                    [token_id, componentIds, componentNums])]);
            const sig = ethers.utils.joinSignature(await this.config.operator.signDigest(hash));
            // save to db
            const data = {
                chain_name: chain_name,
                token_id: token_id,
                component_ids: componentIds.join(','),
                component_nums: componentNums.join(','),
                sig: sig
            };
            await appDB.insert(`initialization_${chain_name}`, data);
            return data;
        }
        return result;
    }

    async getAttrs(chain_name, token_id) {
        const dataDB = this.app.mysql.get('chainData');
        const result = await dataDB.select(`m4m_attrs_${chain_name}`, {
            where: {token_id: token_id},
        })
        return {
            chain_name: chain_name,
            token_id: token_id,
            component_ids: result.component_ids,
            component_nums: result.component_nums,
        }
    }
}

module.exports = NFTService;
