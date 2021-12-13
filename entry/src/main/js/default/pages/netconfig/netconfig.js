import app from '@system.app';
import {getApp} from '../../common.js';

export default {
    data: {
        progress: '',
        desc: '',
        progressStatus: [],
        descStatus: [],
        failDescStatus: [],
        deviceImg: ''
    },
    onInit() {
        this.deviceImg = '/common/img/' + getApp(this).Product.productName + ".png";
        this.progressStatus = [
            this.$t('strings.progress-20'),
            this.$t('strings.progress-40'),
            this.$t('strings.progress-60'),
            this.$t('strings.progress-80'),
            this.$t('strings.progress-100'),
        ];
        this.descStatus = [
            this.$t('strings.desc-20'),
            this.$t('strings.desc-40'),
            this.$t('strings.desc-60'),
            this.$t('strings.desc-80'),
            this.$t('strings.desc-100'),
        ];
        this.failDescStatus = [
            this.$t('strings.fail-desc-0'),
            this.$t('strings.fail-desc-20'),
            this.$t('strings.fail-desc-40'),
            this.$t('strings.fail-desc-60'),
            this.$t('strings.fail-desc-80'),
            this.$t('strings.fail-desc-100'),
        ];
        this.progress = this.$t('strings.progress-0');
        this.desc = this.descStatus[0];
        this.discoverDevice();
    },
    discoverDevice() {
        let scanInfo = {
            duration: 30,
            lockTime: 60,
            sessionId: getApp(this).ConfigParams.sessionId
        };
        // Step1 discover the device through the NaN broadcast service.
        getApp(this).NetConfig.discoveryByNAN(scanInfo, (result) => {
            if (result.code == 0) {
                this.progress = this.progressStatus[1];
                this.desc = this.descStatus[1];
                getApp(this).ConfigParams.deviceInfo = result.data;
                this.registerDisconnectCallback(getApp(this).ConfigParams.deviceInfo.sessionId);
                this.connectDevice();
            } else {
                this.progress = this.progressStatus[4];
                this.desc = this.failDescStatus[1];
                this.disconnectDevice();
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
        // Step2 connect the device.
        getApp(this).NetConfig.connectDevice(connectInfo, (result) => {
            if (result.code === 0) {
                this.progress = this.progressStatus[2];
                this.desc = this.descStatus[2];
                this.getWifiInfo();
            } else {
                this.progress = this.progressStatus[4];
                this.desc = this.failDescStatus[2];
                this.disconnectDevice();
            }
        });
    },
    getWifiInfo() {
        // Step3 get the WiFi information of the current phone connection.
        getApp(this).NetConfig.getWifiList((result) => {
            if (result.code == 0 && result.data && result.data.length > 0) {
                this.progress = this.progressStatus[3];
                this.desc = this.descStatus[3];
                this.configDevice(result.data[0]);
            } else {
                this.progress = this.progressStatus[4];
                this.desc = this.descStatus[3];
                this.disconnectDevice();
            }
        });
    },
    async configDevice(wifiApInfo) {
        let netConfigInfo = {
            ssid: wifiApInfo.ssid,
            ssidPassword: '',
            isDefaultPassword: true,
            channel: wifiApInfo.channel,
            sessionId: getApp(this).ConfigParams.deviceInfo.sessionId,
            type: 0,
            wifiApId: wifiApInfo.wifiApId,
            vendorData: '',
            timeout: 30,
            paramValid: true
        };
        // Step4 config the device net.
        getApp(this).NetConfig.configDeviceNet('deviceInfo', 'accountInfo', netConfigInfo, (result) => {
            if (result.code == 0) {
                this.progress = this.progressStatus[4];
                this.desc = this.descStatus[4];
                this.registerMsgReceive()
                // Step5 config the device net success, go to the control.
                this.goToControl();
            } else {
                this.progress = this.progressStatus[4];
                this.desc = this.failDescStatus[4];
                this.disconnectDevice();
            }
        });
    },
    registerDisconnectCallback(sessionId) {
        let commonInfo = {
            sessionId: sessionId
        }
        getApp(this).NetConfig.registerDisconnectCallback(commonInfo, (result) => {
            if (result.code == 0) {
                this.desc = this.failDescStatus[5];
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
        }
        getApp(this).NetConfig.disconnectDevice(commonInfo, (result) => {
            if (result.code == 0) {
                return;
            }
        });
    },
    goToControl() {
        let target = {
            bundleName: 'com.example.cao',
            abilityName: 'com.example.cao.ControlMainAbility',
            data: {
                session_id: getApp(this).ConfigParams.deviceInfo.sessionId,
                product_id: getApp(this).Product.productId,
                product_name: getApp(this).Product.productName
            }
        }
        FeatureAbility.startAbility(target);
        app.terminate()
    },
    cancel() {
        app.terminate();
    }
}