import router from '@system.router';

export default {
    data: {
        homes: [],
        home: '',
        softApFlag: true
    },
    onInit() {
        this.homes.push(this.$t('strings.page-home-one'));
        this.homes.push(this.$t('strings.page-home-two'));
        this.homes.push(this.$t('strings.page-home-three'));
        this.homes.push(this.$t('strings.page-home-four'));
    },
    homeChange(data) {
        this.home = this.homes[data.value];
    },
    confirmClick() {
        router.push({
            uri: 'pages/location/location',
            params: {
                'homeFlag': true,
                'homeInfo': this.home,
                'softApFlag': this.softApFlag
            }
        });
    },
    cancelClick() {
        router.back();
    }
};