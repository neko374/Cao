import netConfig from './fa-netconfig';

export default {
    NetConfig: netConfig,
    Product: {
        productId: '',
        productName: ''
    },
    ConfigParams: {
        deviceInfo: {},
        sessionId: ''
    },
    onCreate() {
        console.info('AceApplication onCreate');
    },
    onDestroy() {
        console.info('AceApplication onDestroy');
    }
};