import router from '@system.router';

export default {
    data: {
        mobileNumber: ''
    },
    onInit() {
        this.mobileNumber = this.$t('strings.mobileNumber');
    },
    bindClick() {
        this.bindMobileNumber();
        router.push({
            uri: 'pages/netconfig/netconfig'
        });
    },
    useOtherNumberClick() {
        router.push({
            uri: 'pages/mobile/mobile'
        });
    },
    cancelClick() {
        router.push({
            uri: 'pages/index/index'
        });
    },
    bindMobileNumber() {
        //todo handle the mobile number binding service
    }
};