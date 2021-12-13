export var getApp = function (appInstance) {
    return {
        NetConfig: appInstance.$app.$def.NetConfig,
        Product: appInstance.$app.$def.Product,
        ConfigParams: appInstance.$app.$def.ConfigParams
    }
}
