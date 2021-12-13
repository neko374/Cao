import app from '@system.app';
import router from '@system.router';
import {getApp} from '../../common.js';

export default {
    data: {
        discoverAp: '',
        discoverPresent: '',
        netStatus: [],
        apExistFlag: false, //check whether AP are detected
        apSsid: ''
    },
    onInit() {
        this.discoverAp = this.$t('strings.page-softap-scanning-devices');
        this.discoverPresent = this.$t('strings.page-softap-present-0');
        this.netStatus = [
            {
                progress: this.$t('strings.page-softap-present-20'),
                desc: this.$t('strings.page-softap-desc-20')
            },
            {
                progress: this.$t('strings.page-softap-present-60'),
                desc: this.$t('strings.page-softap-desc-60')
            },
            {
                progress: this.$t('strings.page-softap-present-100'),
                desc: this.$t('strings.page-softap-desc-100')
            },
            {
                progress: this.$t('strings.page-softap-present-100'),
                desc: this.$t('strings.page-softap-config-fail')
            }
        ];
        this.discoverDevice();
    },
    discoverDevice() {
        // discover the device through the AP.
        getApp(this).NetConfig.discoveryBySoftAp((result) => {
            if (result.code == 0) {
                let softApInfoList = result.data;
                for (let i = 0; i < softApInfoList.length; i++) {
                    let softApInfo = softApInfoList[i];
                    let ssid = softApInfo.ssid;
                    //todo Hi-xxx-Switchs: device name, vendor-defined
                    if (ssid.search('Hi-xxx-Switchs') != -1) { //Hi-xxx-Switchs
                        this.apExistFlag = true;
                        this.updateProgress(this.netStatus[0]);
                        this.connectDevice(ssid);
                        break;
                    }
                }
                if (!this.apExistFlag) {
                    this.updateProgress(this.netStatus[3]);
                    this.disconnectDevice();
                    this.goToFail();
                }
            } else {
                this.updateProgress(this.netStatus[3]);
                this.disconnectDevice();
                this.goToFail();
            }
        });
    },
    connectDevice(targetDeviceId) {
        let connectInfo = {
            targetDeviceId: targetDeviceId,
            type: 1,
            pin: '0123456789012345',
            password: '',
            sessionId: ''
        };
        // connect the device.
        getApp(this).NetConfig.connectDevice(connectInfo, (result) => {
            if (result.code == 0) {
                //todo the returned productId and SN depend on the service requirements of the vendor
                this.updateProgress(this.netStatus[1]);
                this.configDevice();
            } else {
                this.updateProgress(this.netStatus[3]);
                this.disconnectDevice();
                this.goToFail();
            }
        });
    },
    configDevice() {
        let netConfigInfo = {
            ssid: getApp(this).ConfigParams.wifiInfo.ssid,
            ssidPassword: '',
            isDefaultPassword: true,
            channel: getApp(this).ConfigParams.wifiInfo.channel,
            sessionId: '',
            type: 1,
            wifiApId: getApp(this).ConfigParams.wifiInfo.wifiApId,
            vendorData: ''
        };
        getApp(this).NetConfig.configDeviceNet('deviceInfo', 'accountInfo', netConfigInfo, (result) => {
            if (result.code == 0) {
                this.updateProgress(this.netStatus[1]);
                this.goToControl();
            } else {
                this.updateProgress(this.netStatus[3]);
                this.goToFail();
            }
        });
    },
    async disconnectDevice() {
        let commonInfo = {
            sessionId: getApp(this).ConfigParams.deviceInfo.sessionId
        };
        await getApp(this).NetConfig.disconnectDevice(commonInfo, () => {
        });
    },
    goToFail() {
        router.push({
            uri: 'pages/fail/fail'
        });
    },
    goToControl() {
        let target = {
            bundleName: 'com.example.cao',
            abilityName: 'com.example.cao.ControlMainAbility',
            data: {
                session_id: '',
                product_id: getApp(this).Product.productId,
                product_name: getApp(this).Product.productName
            }
        }
        FeatureAbility.startAbility(target);
        app.terminate()
    },
    softCancelClick() {
        app.terminate();
    },
    updateProgress(netStatus) {
        this.discoverPresent = netStatus.progress;
        this.discoverAp = netStatus.desc;
    }
};
