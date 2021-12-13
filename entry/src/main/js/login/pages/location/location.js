import app from '@system.app';
import router from '@system.router';
import {getApp} from '../../common.js';

export default {
    data: {
        home: '',
        roomList: [],
        configSuccess: false,
        homeFlag: false,
        homeInfo: '',
        softApFlag: true
    },
    onInit() {
        this.home = this.$t('strings.page-home-one');
        if (this.homeFlag == true) {
            this.home = this.homeInfo;
        }
        this.configSuccess = !this.softApFlag;
        this.roomList.push({
            name: this.$t('strings.page-location-room-one'),
            color: '#DDDDDD'
        });
        this.roomList.push({
            name: this.$t('strings.page-location-room-two'),
            color: '#DDDDDD'
        });
        this.roomList.push({
            name: this.$t('strings.page-location-room-three'),
            color: '#DDDDDD'
        });
        this.roomList.push({
            name: this.$t('strings.page-location-room-four'),
            color: '#DDDDDD'
        });
    },
    otherHomeClick() {
        router.push({
            uri: 'pages/home/home',
            params: {
                'softApFlag': this.softApFlag
            }
        });
    },
    roomClick(idx) {
        for (let i = 0; i < this.roomList.length; i++) {
            this.roomList[i].color = '#DDDDDD';
        }
        this.roomList[idx].color = '#750a59f7';
    },
    completeClick() {
        if (this.configSuccess) {
            this.goToControl();
        } else {
            router.push({
                uri: 'pages/softap/softap'
            });
        }
    },
    cancelClick() {
        router.back();
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
    }
};