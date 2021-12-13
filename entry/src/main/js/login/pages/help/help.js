import router from '@system.router';

export default {
    cancelClick() {
        router.back();
    },
    configAgainClick() {
        router.push({
            uri: 'pages/netconfig/netconfig'
        });
    }
};