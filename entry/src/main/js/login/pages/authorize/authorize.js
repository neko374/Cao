import router from '@system.router';

export default {
    data: {
        mobileNumber: '',
        isGetMobileNumber: true
    },
    onInit() {
        this.mobileNumber = this.$t('strings.mobileNumber');
    },
    changeGetMobileNumber(e) {
        this.isGetMobileNumber = e.checked;
    },
    cancelClick() {
        router.push({
            uri: 'pages/index/index'
        });
    },
    authorClick() {
        if (this.isGetMobileNumber) {
            router.push({
                uri: 'pages/binding/binding'
            });
        } else {
            router.push({
                uri: 'pages/mobile/mobile'
            });
        }
    }
};