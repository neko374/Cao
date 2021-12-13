package com.example.cao;

import com.huawei.ailifeability.netconfig.api.NetConfigApi;
import com.huawei.ailifeability.netconfig.model.CommonInfo;
import ohos.aafwk.content.Intent;
import ohos.ace.ability.AceAbility;
import ohos.utils.zson.ZSONObject;

/**
 * Device control ability.
 * Obtain the productId, productName and sessionId from the intent and determine the control page of the device
 * based on the productName.
 */
public class ControlMainAbility extends AceAbility {
    private static final String START_PARAMS = "__startParams";
    private static final String SESSION_ID = "session_id";
    private static final String FA_DEVICE_ID = "device_id";
    private static final String FA_DEVICE_PRODUCT_ID = "product_id";
    private static final String FA_DEVICE_PRODUCT_NAME = "product_name";
    private boolean goToFullScreen = false;

    @Override
    public void onStart(Intent intent) {
        if (goToFullScreen) {
            DataHandlerAbility.setIsFullScreen(true);
            DataHandlerAbility.setAbilityContext(this);
            super.onStart(intent);
            goToFullScreen = false;
            return;
        }
        String sessionId = null;
        String productName = "FAN";
        if (intent.getParams().keySet().contains(START_PARAMS)) {
            ZSONObject zsonObject = ZSONObject.stringToZSON((String) intent.getParams().getParam(START_PARAMS));
            sessionId = zsonObject.getString(SESSION_ID);
            productName = zsonObject.getString(FA_DEVICE_PRODUCT_NAME);
        }
        intent.setParam("window_modal", 1);

        String deviceId = intent.getStringParam(FA_DEVICE_ID);
        NetworkDeviceDataHandler.setSessionId(sessionId);
        DataHandlerAbility.register(this, deviceId, productName);
        DataHandlerAbility.setIsFullScreen(false);
        super.onStart(intent);
    }

    @Override
    public void onNewIntent(Intent intent) {
        if (intent.getParams().keySet().contains(START_PARAMS)) {
            ZSONObject zsonObject = ZSONObject.stringToZSON((String) intent.getParams().getParam(START_PARAMS));
            goToFullScreen = zsonObject.getBoolean("fullScreen");
            if (goToFullScreen) {
                restart();
            }
        }
        super.onNewIntent(intent);
    }

    @Override
    public void onStop() {
        if (!goToFullScreen) {
            CommonInfo commonInfo = new CommonInfo();
            commonInfo.setSessionId(NetworkDeviceDataHandler.getSessionId());
            NetConfigApi.getInstance().disconnectDevice(commonInfo, (code, controlMessage, str) -> {
            });
            DataHandlerAbility.deregister();
            super.onStop();
        }
    }
}
