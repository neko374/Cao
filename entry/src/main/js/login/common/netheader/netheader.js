export default {
    props: [
        'action',
        'name'
    ],
    data: {
        name: '',
        actionType: '',
        action: ''
    },
    onInit() {
        this.actionType = this.action;
    }
}