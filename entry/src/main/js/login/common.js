export var getApp = function (appInstance) {
    return {
        NetConfig: appInstance.$app.$def.NetConfig,
        Product: appInstance.$app.$def.Product,
        NfcInfo: appInstance.$app.$def.NfcInfo,
        ConfigParams: appInstance.$app.$def.ConfigParams
    }
}