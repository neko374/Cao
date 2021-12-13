import netConfig from './fa-netconfig';

export default {
    NetConfig: netConfig,
    Product: {
        productId: '',
        productName: ''
    },
    NfcInfo: { //nfc Information
        sessionId: "",
        tagUid: "",
        sn: ""
    },
    ConfigParams: { //Wi-Fi and device information
        wifiInfo: {},
        wifiPwd: "",
        deviceInfo: {},
        vendorData: "",
        pin: "11111111"
    },
    onCreate() {
        console.info('AceApplication onCreate');
    },
    onDestroy() {
        console.info('AceApplication onDestroy');
    }
};
