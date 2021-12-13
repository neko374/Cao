export default {
    props: [
        'deviceName',
        'action',
        'isNet',
    ],
    data: {
        deviceNameValue: '',
        deviceVersionValue: '',
        actionType: '',
        isNetValue: false,
        isNet: false,
        deviceName: '',
        action: ''
    },
    onInit() {
        this.deviceNameValue = this.$t('strings.deviceName');
        this.deviceVersionValue = this.$t('strings.version');
        this.isNetValue = this.isNet;
        if (this.isNetValue) {
            this.deviceNameValue = this.deviceName;
        }
        this.actionType = this.action;
    }
}