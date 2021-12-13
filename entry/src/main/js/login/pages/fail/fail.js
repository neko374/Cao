import router from '@system.router';

export default {
    cancelClick() {
        router.back();
    },
    viewHelpClick() {
        router.push({
            uri: 'pages/help/help'
        });
    }
};