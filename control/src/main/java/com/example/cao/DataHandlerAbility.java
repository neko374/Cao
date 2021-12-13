package com.example.cao;

import ohos.aafwk.content.Intent;
import ohos.aafwk.content.Operation;
import ohos.ace.ability.AceInternalAbility;
import ohos.app.AbilityContext;
import ohos.global.configuration.Configuration;
import ohos.global.configuration.LocaleProfile;
import ohos.global.resource.Resource;
import ohos.hiviewdfx.HiLog;
import ohos.hiviewdfx.HiLogLabel;
import ohos.rpc.IRemoteObject;
import ohos.rpc.MessageOption;
import ohos.rpc.MessageParcel;
import ohos.rpc.RemoteException;
import ohos.utils.net.Uri;
import ohos.utils.zson.ZSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * DataHandlerAbility usage:
 * 1.Get deviceId from {@link ControlMainAbility}'s intent called by HiLink service when connect your device by NFC.
 * 2.Modify {@link DataHandlerAbility#getTemplate()} to get the configuration file of the real device, this
 * configuration file can be obtained from the HuaWei HiLink online design platform
 * (https://developer.huawei.com/consumer/cn/doc/development/smarthome-Guides/apponlineguide-0000001050993083)，
 * or you can create json file referring to our local configuration.
 * 3.choose your {@link DataHandlerAbility#DEVICE_DATA_MODE} 0:HiLink 1:third_party 2:example_data.
 * if you choose HiLink, {@link HiLinkDeviceDataHandler} will handle the data, the premise is that your device
 * supports the HiLink protocol.
 * if you choose third_party, you need modify {@link ThirdPartyDeviceDataHandler} to complete the connection
 * with the server.
 * if you choose example_data, a sample of device is provided for demonstration, only UI without real device data.
 */
public class DataHandlerAbility extends AceInternalAbility {
    private static final HiLogLabel LABEL_LOG = new HiLogLabel(HiLog.DEBUG, 0, "DataHandlerAbility");
    private static final String BUNDLE_NAME = "com.example.cao";
    private static final String ABILITY_NAME = "com.example.cao.DataHandlerAbility";
    private static final String CLOUD = "cloud";
    private static final String LOCAL = "local";
    private static final int SUCCESS = 0;
    private static final int DEVICE_DATA_MODE_HILINK = 0;
    private static final int DEVICE_DATA_MODE_THIRD_PARTY = 1;
    private static final int DEVICE_DATA_MODE_SAMPLE = 2;
    private static final int DEVICE_DATA_MODE_NETWORK_DEVICE = 3;
    private static final int DEVICE_DATA_MODE = DEVICE_DATA_MODE_NETWORK_DEVICE;
    private static final int ACTION_MESSAGE_CODE_SUBSCRIBE = 1001;
    private static final int ACTION_MESSAGE_CODE_GET_TEMPLATE = 1002;
    private static final int ACTION_MESSAGE_CODE_UNSUBSCRIBE = 1003;
    private static final int ACTION_MESSAGE_CODE_DATA_CHANGED = 1004;
    private static final int ACTION_MESSAGE_CODE_INIT_DEVICE_DATA = 1005;
    private static final int ACTION_MESSAGE_CODE_JUMP_TO_HILINK = 1008;
    private static final int ACTION_MESSAGE_CODE_IS_FULL_SCREEN = 1009;
    private static final int ACTION_MESSAGE_CODE_GET_DATA = 1010;
    private static boolean isFullScreen = false;
    private static DataHandlerAbility instance;
    private final String language;
    private final String deviceId;
    private final String productName;
    private IRemoteObject remoteObjectHandler;
    private final DeviceDataCallback deviceDataCallback = new DeviceDataCallback() {
        /**
         * onResult
         *
         * @param code errorCode
         * @param msg errorMessage
         * @param map the data to send
         */
        public void onResult(int code, String msg, Map<String, Object> map) {
            HiLog.info(LABEL_LOG, "send device data to js: " + map.toString());
            sendData(map);
        }
    };
    private AbilityContext abilityContext;
    private BaseDeviceDataHandler deviceDataHandler;

    public DataHandlerAbility(String deviceId, String productName) {
        super(BUNDLE_NAME, ABILITY_NAME);
        if (DEVICE_DATA_MODE == DEVICE_DATA_MODE_SAMPLE) {
            this.deviceId = productName;
            this.productName = productName;
        } else {
            this.deviceId = deviceId;
            this.productName = productName;
        }
        Configuration configuration = new Configuration();
        LocaleProfile localeProfile = configuration.getLocaleProfile();
        language = localeProfile.getLocales()[0].getLanguage();
    }

    /**
     * Internal ability registration.
     *
     * @param abilityContext AbilityContext
     * @param deviceId       device id
     * @param productName    product name
     */
    public static synchronized void register(AbilityContext abilityContext, String deviceId, String productName) {
        instance = new DataHandlerAbility(deviceId, productName);
        instance.onRegister(abilityContext);
    }

    public static void setAbilityContext(AbilityContext abilityContext) {
        instance.onRegister(abilityContext);
    }

    public static void setIsFullScreen(boolean isFull) {
        isFullScreen = isFull;
    }

    /**
     * Internal ability deregistration.
     */
    public static void deregister() {
        instance.onDeregister();
    }

    private BaseDeviceDataHandler getDeviceDataHandler() {
        /* you should choose your DEVICE_DATA_MODE in this function */
        if (DEVICE_DATA_MODE == DEVICE_DATA_MODE_HILINK) {
            return new HiLinkDeviceDataHandler(deviceId, deviceDataCallback);
        } else if (DEVICE_DATA_MODE == DEVICE_DATA_MODE_THIRD_PARTY) {
            return new ThirdPartyDeviceDataHandler(deviceId, deviceDataCallback);
        } else if (DEVICE_DATA_MODE == DEVICE_DATA_MODE_SAMPLE) {
            return new SampleDeviceDataHandler(deviceId, deviceDataCallback);
        } else {
            return new NetworkDeviceDataHandler(deviceId, deviceDataCallback);
        }
    }

    private void sendData(Map<String, Object> dataMap) {
        MessageParcel data = MessageParcel.obtain();
        MessageParcel reply = MessageParcel.obtain();
        MessageOption option = new MessageOption();
        data.writeString(ZSONObject.toZSONString(dataMap));
        try {
            remoteObjectHandler.sendRequest(0, data, reply, option);
        } catch (RemoteException e) {
            HiLog.error(LABEL_LOG, "failed to send data to js");
        }
        reply.reclaim();
        data.reclaim();
    }

    private ZSONObject getTemplate() {
        // source indicates whether json config file is from the local file or cloud file.
        final String source = "local";
        // configDir indicates the directory path of json config file.
        final String configDir = SampleDeviceDataHandler.EXAMPLE_TEMPLATE_FILE_DIR + "/" + productName;
        // configPath indicates the url path of json config file. You can change it into different url corresponding
        // to your product name or device id.
        final String configPath = configDir + "/" + productName + "_" + language + ".json";
        ZSONObject result = null;
        if (LOCAL.equals(source)) {
            try {
                Resource resource = abilityContext.getResourceManager().getRawFileEntry(configPath).openRawFile();
                byte[] tmp = new byte[1024 * 1024];
                int reads = resource.read(tmp);
                if (reads != -1) {
                    String jsonString = new String(tmp, 0, reads, StandardCharsets.UTF_8);
                    result = ZSONObject.stringToZSON(jsonString);
                }
            } catch (IOException e) {
                HiLog.error(LABEL_LOG, "failed to open template from local");
            }
        } else {
            try {
                URL url = new URL(configPath);
                URLConnection urlc = url.openConnection();
                urlc.connect();
                try (InputStream is = urlc.getInputStream();
                     InputStreamReader isReader = new InputStreamReader(is, StandardCharsets.UTF_8);
                     BufferedReader reader = new BufferedReader(isReader)) {
                    StringBuilder sb = new StringBuilder();
                    String str;
                    while ((str = reader.readLine()) != null) {
                        sb.append(str);
                    }
                    result = ZSONObject.stringToZSON(sb.toString());
                }
            } catch (IOException e) {
                HiLog.error(LABEL_LOG, "failed to open template from cloud");
            }
        }
        if (result != null) {
            // iconUrl is icon's prefix path. Here we use /common/productName in js module. You can change it into your
            // cloud url. All icons file must be under iconUrl.
            result.put("iconUrl", SampleDeviceDataHandler.EXAMPLE_RESOURCE_DIR + "/" + productName);
            // deviceIcon is the product icon's file name. It must exist under iconUrl.
            result.put("deviceIcon", "/" + productName + ".png");
            // logoIcon is the product logo's file name. It must exist under iconUrl.
            result.put("logoIcon", "/logo.png");
        }
        return result;
    }

    private boolean onRemoteRequest(int code, MessageParcel data, MessageParcel reply) {
        switch (code) {
            case ACTION_MESSAGE_CODE_SUBSCRIBE: {
                HiLog.info(LABEL_LOG, "ACTION_MESSAGE_CODE_SUBSCRIBE");
                remoteObjectHandler = data.readRemoteObject();
                break;
            }
            case ACTION_MESSAGE_CODE_INIT_DEVICE_DATA: {
                if (deviceDataHandler == null) {
                    deviceDataHandler = getDeviceDataHandler();
                }
                break;
            }
            case ACTION_MESSAGE_CODE_UNSUBSCRIBE: {
                remoteObjectHandler = null;
                break;
            }
            case ACTION_MESSAGE_CODE_DATA_CHANGED: {
                String zsonStr = data.readString();
                ZSONObject zsonObj = ZSONObject.stringToZSON(zsonStr);
                for (Map.Entry<String, Object> entry : zsonObj.entrySet()) {
                    deviceDataHandler.modifyDeviceProperty(entry.getKey(), entry.getValue());
                }
                break;
            }
            case ACTION_MESSAGE_CODE_GET_TEMPLATE: {
                reply.writeString(getWriteTemplateString());
                break;
            }
            case ACTION_MESSAGE_CODE_JUMP_TO_HILINK: {
                ZSONObject zsonObj = ZSONObject.stringToZSON(data.readString());
                jumpToHiLink(zsonObj);
                break;
            }
            case ACTION_MESSAGE_CODE_IS_FULL_SCREEN: {
                reply.writeString(getWriteIsFullScreenString());
                break;
            }
            case ACTION_MESSAGE_CODE_GET_DATA: {
                deviceDataHandler.getData();
                break;
            }
            default: {
                reply.writeString("service not defined");
                return false;
            }
        }
        return true;
    }

    private String getWriteTemplateString() {
        ZSONObject template = getTemplate();
        if (template == null) {
            return "no template";
        }
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("template", template);
        Map<String, Object> zsonResult = new HashMap<>();
        zsonResult.put("code", SUCCESS);
        zsonResult.put("data", ZSONObject.toZSONString(dataMap));
        return ZSONObject.toZSONString(zsonResult);
    }

    private String getWriteIsFullScreenString() {
        Map<String, Object> dataMap = new HashMap<>();
        dataMap.put("isFullScreen", isFullScreen);
        Map<String, Object> zsonResult = new HashMap<>();
        zsonResult.put("code", SUCCESS);
        zsonResult.put("data", dataMap);
        return ZSONObject.toZSONString(zsonResult);
    }

    /**
     * Open the system browser and switch to the hiLink details page.
     *
     * @param zsonObj request param
     */
    private void jumpToHiLink(ZSONObject zsonObj) {
        abilityContext.getMainTaskDispatcher().asyncDispatch(() -> {
            Uri uri = Uri.parse((String) zsonObj.get("url"));
            Intent intent = new Intent();
            Operation operation = new Intent.OperationBuilder()
                    .withUri(uri)
                    .build();
            intent.setOperation(operation);
            abilityContext.startAbility(intent, 0);
        });
    }

    private void onRegister(AbilityContext abilityContext) {
        this.abilityContext = abilityContext;
        this.setInternalAbilityHandler((code, data, reply, option) -> this.onRemoteRequest(code, data, reply));
    }

    private void onDeregister() {
        abilityContext = null;
        this.setInternalAbilityHandler(null);
    }
}
