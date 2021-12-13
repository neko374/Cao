import router from '@system.router';
import app from '@system.app';
import prompt from '@system.prompt';
import {getApp} from '../../common.js';

export default {
    data: {
        ssid: '',
        wifiPwd: '',
        wifiFlag: false
    },
    onInit() {
        if (this.wifiFlag == true) {
            this.ssid = getApp(this).ConfigParams.wifiInfo.ssid;
            if (getApp(this).ConfigParams.wifiInfo.hasDefaultPassword) {
                this.wifiPwd = '******';
            }
        } else {
            this.getWifiInfo();
        }
    },
    getWifiInfo() {
        // get the WiFi information of the current phone connection.
        getApp(this).NetConfig.getWifiList((result) => {
            if (result.code != -1 && result.data && result.data.length > 0) {
                getApp(this).ConfigParams.wifiInfo = result.data[0];
                this.ssid = getApp(this).ConfigParams.wifiInfo.ssid;
                if (getApp(this).ConfigParams.wifiInfo.hasDefaultPassword) {
                    this.wifiPwd = '******';
                }
            }
        });
    },
    otherWifiClick() {
        router.push({
            uri: 'pages/wifi/wifi'
        });
    },
    cancelClick() {
        app.terminate();
    },
    connectClick() {
        if (this.wifiPwd == '') {
            prompt.showToast({
                message: this.$t('strings.page-netconfig-pwdPlaceHolder'),
                duration: 3500
            });
            return;
        }
        this.discoverDevice();
    },
    discoverDevice() {
        let scanInfo = {
            duration: 30,
            lockTime: 60,
            sessionId: ''
        };
        // discover the device through the NaN broadcast service.
        getApp(this).NetConfig.discoveryByNAN(scanInfo, (result) => {
            if (result.code == 0) {
                getApp(this).ConfigParams.deviceInfo = result.data;
                this.connectDevice();
            } else {
                this.goToLocation(true);
            }
        });
    },
    connectDevice() {
        let connectInfo = {
            targetDeviceId: getApp(this).ConfigParams.deviceInfo.productId,
            type: 0,
            pin: '0123456789012345',
            password: getApp(this).ConfigParams.deviceInfo.sn,
            sessionId: getApp(this).ConfigParams.deviceInfo.sessionId
        };
        // connect the device.
        getApp(this).NetConfig.connectDevice(connectInfo, (result) => {
            if (result.code === 0) {
                this.configDevice();
            } else {
                this.disconnectDevice();
                this.goToLocation(true);
            }
        });
    },
    configDevice() {
        let netConfigInfo = {
            ssid: getApp(this).ConfigParams.wifiInfo.ssid,
            ssidPassword: '',
            isDefaultPassword: true,
            channel: getApp(this).ConfigParams.wifiInfo.channel,
            sessionId: getApp(this).ConfigParams.deviceInfo.sessionId,
            type: 0,
            wifiApId: getApp(this).ConfigParams.wifiInfo.wifiApId,
            vendorData: '',
            timeout: 30
        };
        // config the device net.
        getApp(this).NetConfig.configDeviceNet('deviceInfo', 'accountInfo', netConfigInfo, (result) => {
            console.error("xushubo  " + JSON.stringify(result))
            if (result.code == 0) {
                this.registerMsgReceive();
                this.goToLocation(false);
            } else {
                this.disconnectDevice();
                this.goToLocation(true);
            }
        });
    },
    goToLocation(softApFlag) {
        router.push({
            uri: 'pages/location/location',
            params: {
                'softApFlag': softApFlag
            }
        });
    },
    registerMsgReceive() {
        let commonInfo = {
            sessionId: getApp(this).ConfigParams.deviceInfo.sessionId
        }
        getApp(this).NetConfig.registerMsgReceive(commonInfo, () => {
        });
    },
    disconnectDevice() {
        let commonInfo = {
            sessionId: getApp(this).ConfigParams.deviceInfo.sessionId
        };
        getApp(this).disconnectDevice(commonInfo, () => {
        });
    }
};
