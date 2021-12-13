import router from '@system.router';
import {getApp} from '../../common.js';

export default {
    data: {
        wifis: [], //wifi list
        refreshing: false //refresh flag
    },
    onInit() {
        this.getWifiList();
    },
    //get the Wi-Fi list
    getWifiList() {
        getApp(this).NetConfig.getWifiList((result) => {
            if (result.code != -1 && result.data && result.data.length > 0) {
                let wifiList = result.data;
                for (let i = 0; i < wifiList.length; i++) {
                    this.wifis.push(wifiList[i]);
                }
            }
            this.refreshing = false;
        });
    },
    //refresh component drop-down refresh method
    refreshWifi() {
        this.refreshing = true;
        //clear the Wi-Fi list before refreshing the Wi-Fi list
        this.wifis = [];
        //get the Wi-Fi list during the drop-down list
        this.getWifiList();
    },
    //click event of an item in the Wi-Fi list
    wifiListItemClick(params) {
        getApp(this).ConfigParams.wifiInfo = this.wifis[params];
        router.push({
            uri: 'pages/netconfig/netconfig',
            params: {
                wifiFlag: true
            }
        });
    },
    cancelClick() {
        router.back();
    }
};