package com.example.cao;

import com.huawei.ailifeability.netconfig.api.NetConfigApi;
import com.huawei.ailifeability.netconfig.model.CommonInfo;

import ohos.eventhandler.EventHandler;
import ohos.eventhandler.EventRunner;
import ohos.hiviewdfx.HiLog;
import ohos.hiviewdfx.HiLogLabel;
import ohos.utils.zson.ZSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * NetworkDeviceDataHandler is used to control Harmony devices. An example of a fan is provided as a reference.
 * Implement two methods, recoverData is used to initialize data, modifyProperty is used to respond to interface
 * operations. {@link NetworkDeviceDataHandler#sendMessage} is used to send messages to the device, After
 * sending successfully, {@link NetworkDeviceDataHandler#onDeviceDataChange(Map)} is called to refresh the UI interface
 */
public class NetworkDeviceDataHandler extends BaseDeviceDataHandler {
    private static final HiLogLabel LABEL_LOG = new HiLogLabel(HiLog.DEBUG, 0, "MessageDataHandler");
    private static String sessionId = null;
    private final DeviceDataModel dataModel;
    private final EventHandler mainHandler;
    private final Map<String, Object> dataMap = new HashMap<>();
    private final DeviceDataModel fanDataModel = new DeviceDataModel() {
        @Override
        public Map<String, Object> recoverData() {
            dataMap.put("switch/on", 0);
            dataMap.put("windMode/mode", 0);
            dataMap.put("windGear/gear", 0);
            dataMap.put("shutdown/mode", 0);
            return dataMap;
        }

        @Override
        public Map<String, Object> modifyProperty(String key, Object value) {
            HashMap<String, Object> tmpMap = new HashMap<>();
            tmpMap.put(key, value);
            switch (key) {
                case "switch/on":
                    if ((Integer) value == 0) {
                        sendMessage("010000", tmpMap);
                        tmpMap.put("shutdown/mode", 0);
                    } else {
                        sendMessage("010100", tmpMap);
                    }
                    break;
                case "windMode/mode":
                    if ((Integer) value == 2) {
                        sendMessage("030300", tmpMap);
                    } else {
                        sendMessage("030100", tmpMap);
                    }
                    break;
                case "windGear/gear":
                    if ((Integer) value == 2) {
                        sendMessage("020100", tmpMap);
                    } else if ((Integer) value == 3) {
                        sendMessage("020200", tmpMap);
                    } else if ((Integer) value == 4) {
                        sendMessage("020300", tmpMap);
                    } else {
                        sendMessage("020400", tmpMap);
                    }
                    break;
                case "shutdown/mode":
                    if (value.toString().contains("shutdownTime")) {
                        ZSONObject zsonObject = ZSONObject.stringToZSON(value.toString());
                        int shutdownTime = zsonObject.getInteger("shutdownTime");
                        int shutdownMode = zsonObject.getInteger("shutdown/mode");
                        tmpMap.put("shutdown/mode", shutdownMode);
                        sendMessage("050" + shutdownTime + "00", tmpMap);
                    } else {
                        tmpMap.put("shutdown/mode", 0);
                        sendMessage("050000", tmpMap);
                    }
                    break;
                default:
                    break;
            }
            return dataMap;
        }
    };

    NetworkDeviceDataHandler(String deviceId, DeviceDataCallback deviceDataCallback) {
        super(deviceId, deviceDataCallback);
        dataModel = fanDataModel;
        mainHandler = new EventHandler(EventRunner.getMainEventRunner());
        mainHandler.postTask(() -> initProfileData(0, "", dataModel.recoverData()));
    }

    public static String getSessionId() {
        return sessionId;
    }

    public static void setSessionId(String id) {
        sessionId = id;
    }

    private void sendMessage(String message, HashMap<String, Object> tmpMap) {
        CommonInfo commonInfo = new CommonInfo();
        commonInfo.setSessionId(sessionId);
        HiLog.error(LABEL_LOG, "sessionId " + sessionId);
        NetConfigApi.getInstance().sendMessage(commonInfo, message, (code, controlMessage, str) -> {
            if (code == 0) {
                HiLog.info(LABEL_LOG, "send message success " + message);
                dataMap.putAll(tmpMap);
                mainHandler.postTask(() -> onDeviceDataChange(dataMap));
            } else {
                HiLog.error(LABEL_LOG, "send message fail code = " +
                        code + " control message = " + controlMessage);
            }
        });
    }

    @Override
    public void modifyDeviceProperty(String key, Object value) {
        dataModel.modifyProperty(key, value);
    }

    @Override
    void getData() {
        onDeviceDataChange(dataMap);
    }

    private interface DeviceDataModel {
        Map<String, Object> recoverData();

        Map<String, Object> modifyProperty(String key, Object value);
    }
}
