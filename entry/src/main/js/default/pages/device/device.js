import app from '@system.app';
import router from '@system.router';
import {getApp} from '../../common.js';

export default {
    data: {
        deviceName: '',
        deviceImg: '',
        productName: 'FAN',
        sessionId: ''
    },
    onInit() {
        this.deviceName = this.$t('strings.device-name');
        this.deviceImg = '/common/img/' + this.productName + ".png";
        getApp(this).Product.productName = this.productName;
        getApp(this).Product.productId = this.productId;
        getApp(this).ConfigParams.sessionId = this.sessionId;
    },
    cancel() {
        app.terminate();
    },
    configNet() {
        router.push({
            uri: 'pages/netconfig/netconfig'
        });
    }
}