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
        await appDB.query('replace into ' + tableName + ' VALUES ( ?, ?, ?, ?, ?, ?, ?, ? )',
            [params.chain_name, this.config.m4mNFT[params.chain_name], params.m4m_token_id,
                params.description, params.name, params.uri, JSON.stringify(attrs), params.prev]);
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
            let componentIds = [];
            for (const cID of _componentIds) {
                let id = ethers.BigNumber.from(cID.component_id);
                if (id.gt(30)) {
                    componentIds.push(id);
                }
            }
            let selectedResults = await this.selectComponents(chain_name, componentIds);
            let componentNums = selectedResults.componentNums;
            componentIds = selectedResults.componentIds;
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

    async selectComponents(chainName, componentIds) {
        let components = await this.app.mysql.get('app').select(`metadata_${chainName}`, {
            where: {
                token_id: componentIds,
                contract: this.config.components[chainName]
            }
        });
        let totals = new Map();
        for (const c of components) {
            let attrs = JSON.parse(c.attributes);
            let positionTrait = attrs.find(r => r.trait_type === "position");
            if (!positionTrait) {
                continue
            }
            let key = positionTrait.value;
            let values = totals.get(key);
            if (!values) {
                values = [c.token_id];
            } else {
                values.push(c.token_id);
            }
            totals.set(key, values);
        }
        let selectedIds = [];
        for (const key of totals.keys()) {
            let components = totals.get(key);
            let random = Math.floor(Math.random() * components.length);
            selectedIds.push(components[random]);
        }
        return {
            componentIds: selectedIds.map(item => ethers.BigNumber.from(item)),
            componentNums: selectedIds.map(item => ethers.BigNumber.from(1))
        }
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
                    prev: metadata.prev,
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
                    prev: metadata.prev,
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
        const signer = ethers.utils.recoverAddress(digest, sig);
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

    async queryNFT(chainName, addr, contract, tokenId, limit, offset) {
        const mysql = this.app.mysql.get('chainData');
        let where = [];
        let param = [];
        if (addr) {
            where.push('owner=?');
            param.push(addr);
        }
        if (contract) {
            where.push('contract=?');
            param.push(contract);
            if (tokenId) {
                where.push('token_id=?');
                param.push(tokenId);
            }
        }
        let whereClause = where.join(' and ');
        let total = await mysql.query(`select count(*)
                                       from nft_${chainName}
                                       where ` + whereClause, param);
        total = total[0]['count(*)'];
        let sql = `select *
                   from nft_${chainName}
                   where ` + whereClause + ' order by contract, token_id';
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        return {"total": total, data: await mysql.query(sql, param)};
    }

    async queryCollectionList(chainName, addr, limit, offset) {
        const mysql = this.app.mysql.get('chainData');
        let total, result;
        total = await mysql.query(
            `select count(*)
             from collection
             where collection.collection_id in (select collection_id
                                                from collection_map
                                                where contract in
                                                      (select distinct contract from nft_${chainName} where owner = ?))`,
            addr);
        total = total[0]['count(*)'];
        //
        let sql = `select *
                   from collection
                   where collection.collection_id in (select collection_id
                                                      from collection_map
                                                      where contract in
                                                            (select distinct contract from nft_${chainName} where owner = ?))`
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        result = await mysql.query(sql, addr);

        const data = result.map(item => {
            return {
                chain_name: this.split(item.chain_name, ","),
                id: item.collection_id,
                name: item.collection_name,
                img: item.collection_img
            };
        });
        return {"total": total, data: data};
    }

    async queryCollectionNFTs(chain_name, collectionId, addr, limit, offset) {
        const mysql = this.app.mysql.get('chainData');
        const collectionInfo = await mysql.get('collection', {collection_id: collectionId});
        const items = await mysql.select('collection_map', {where: {collection_id: collectionId}});
        if (items.length === 0) {
            return {
                total: 0,
                collection_id: collectionInfo.collection_id,
                collection_name: collectionInfo.collection_name,
                collection_img: collectionInfo.collection_img,
                data: null,
            }
        }
        const contracts = items.map((item) => item.contract);
        let sql = `select *
                   from nft_${chain_name}
                   where `;
        let queryTotalSql = `select count(*)
                             from nft_${chain_name}
                             where `;
        const whereClause = ['contract in (?)'];
        const param = [contracts];
        if (addr) {
            whereClause.push('owner=?');
            param.push(addr);
        }
        sql += whereClause.join(' and ') + ' order by contract, token_id';
        queryTotalSql += whereClause.join(' and ');
        if (offset && limit) {
            sql += ' limit ' + offset + ', ' + limit
        } else if (limit) {
            sql += ' limit ' + limit;
        }
        let total = await mysql.query(queryTotalSql, param);
        total = total[0]['count(*)'];
        const results = await mysql.query(sql, param);
        return {
            total: total,
            collection_id: collectionInfo.collection_id,
            collection_name: collectionInfo.collection_name,
            collection_img: collectionInfo.collection_img,
            data: results
        };
    }

    split(str, split) {
        const splited = str.split(split);
        const res = [];
        for (const s of splited) {
            if (s) {
                res.push(s);
            }
        }
        return res;
    }
}

module.exports = NFTService;
