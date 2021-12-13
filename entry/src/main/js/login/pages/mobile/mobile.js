import app from '@system.app';
import router from '@system.router';

const ONE_SECOND = 1000;

export default {
    data: {
        mobileNumber: '',
        inputVerificationCode: '',
        prompt: ''
    },
    onInit() {
        this.prompt = this.$t('strings.page-mobile-getVerificationCode');
    },
    //todo the vendor needs to write the logic for obtaining the SMS verification code
    getVerificationCode() {
        let seconds = 60;
        let interval = setInterval(() => {
            if (seconds > 0) {
                seconds--;
                this.prompt = seconds;
            } else {
                this.prompt = this.$t('strings.page-mobile-getVerificationCode');
                clearInterval(interval);
            }
        }, ONE_SECOND);
    },
    getVerificationCodeInfo(e) {
        let verificationCode = e.text;
        if (verificationCode != '') {
            this.inputVerificationCode = verificationCode;
        }
    },
    getPhoneNumber(e) {
        let mobileNumber = e.text;
        if (mobileNumber != '') {
            this.mobileNumber = mobileNumber;
        }
    },
    //todo button is to authorize and bind，vendors write service logic based on your own cloud protocols
    authorClick() {
        router.push({
            uri: 'pages/netconfig/netconfig'
        });
    },
    cancelClick() {
        app.terminate();
    }
};
