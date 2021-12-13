import {getApp} from '../../common.js';
import app from '@system.app';
import router from '@system.router';

export default {
    data: {
        productName: 'FAN'
    },
    onInit() {
        getApp(this).Product.productName = this.productName;
        getApp(this).Product.productId = this.productId;
    },
    hwLoginClick() {
        this.goToAuthPage();
    },
    goToAuthPage() {
        router.push({
            uri: 'pages/authorize/authorize'
        });
    },
    cancelLoginClick: async function () {
        app.terminate();
    }
};
