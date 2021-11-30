module.exports = app => {
    const {router, controller} = app;
    router.get('/', controller.index.index);
    router.get('/api/v1', controller.index.index);

    router.post('/api/v1/m4m-nft/initialization', controller.nft.getInitParams);
    router.post('/api/v1/m4m-nft/attrs', controller.nft.getAttrs);
};
