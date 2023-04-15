module.exports = app => {
    const {router, controller} = app;
    router.get('/', controller.index.index);
    router.get('/api/v1', controller.index.index);

    router.get('/api/v1/m4m-nft/initialization', controller.nft.getInitParams);
    router.get('/api/v1/m4m-nft/attrs', controller.nft.getAttrs);
    router.get('/api/v1/component/status/:chain_name/:component_id', controller.nft.getComponentStatus);
    router.get('/api/tokenuri/:contract/:token_id', controller.nft.getMetadata);
    router.get('/api/v1/nfts', controller.nft.queryNFT);
    router.get('/api/v1/collection/nfts', controller.nft.queryCollectionNFTs);
    router.get('/api/v1/collection/list', controller.nft.queryCollectionList);

    router.post('/api/v1/component/generate', controller.nft.generateComponent);
    router.post('/api/v1/component/claim', controller.nft.getClaimLootParams);
    router.post('/api/v1/m4m-nft/bind-metadata', controller.nft.bindMetadata);
    router.post('/api/v1/component/bind-metadata', controller.nft.bindComponentMetadata);
    router.post('/api/v1/m4m-nft/init', controller.nft.signInitParams);
};
