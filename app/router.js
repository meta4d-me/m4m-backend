module.exports = app => {
    const {router, controller} = app;
    router.get('/', controller.index.index);
    router.get('/api/v1', controller.index.index);

    router.get('/api/v1/m4m-nft/initialization', controller.nft.getInitParams);
    router.get('/api/v1/m4m-nft/attrs', controller.nft.getAttrs);
    router.get('/api/v1/component/status/:chain_name/:component_id', controller.nft.getComponentStatus);
    router.get('/api/tokenuri/:contract/:token_id', controller.nft.getMetadata);

    router.post('/api/v1/component/generate', controller.nft.generateComponent);
    router.post('/api/v1/component/claim', controller.nft.getClaimLootParams);
    router.post('/api/v1/m4m-nft/bind-metadata', controller.nft.bindMetadata);
};
