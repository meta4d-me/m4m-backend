const env = require('./env.json');
const ethers = require('ethers');

exports.keys = 'my-cookie-secret-key';
exports.security = {
    csrf: {
        enable: false,
    },
};

exports.cors = {
    origin: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
};

exports.mysql = {
    clients: {
        app: {
            host: 'localhost',
            port: '3306',
            user: env.MYSQL_USER,
            password: env.MYSQL_PASSWORD,
            database: 'm4m',
        },
        chainData: {
            host: 'localhost',
            port: '3306',
            user: env.MYSQL_USER,
            password: env.MYSQL_PASSWORD,
            database: 'blockchain_data',
        },
    },
    app: true,
    agent: true,
};

exports.operator = new ethers.utils.SigningKey('0x' + env.OPERATOR_PRIV);

exports.components = {
    mumbai: "0xb6bb4812a8e075cbad0128e318203553c4ca463d",
}

exports.m4mNFT = {
    mumbai: "0xfa860d48571fa0d19324cbde77e0fbdfdffb0a47",
}

exports.assets = './assets/'

exports.logger = {
    dir: './logs',
};

exports.customLogger = {
    scheduleLogger: {
        consoleLevel: 'NONE',
        file: './logs/egg-schedule.log',
    },
};

exports.schedule = {
    directory: [],
};

exports.cluster ={
    listen:{
        hostname: '0.0.0.0'
    }
}
