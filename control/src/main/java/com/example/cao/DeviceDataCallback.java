package com.example.cao;

import java.util.Map;

/**
 * DeviceDataCallback used to observer device data change
 */
public interface DeviceDataCallback {
    void onResult(int errorCode, String errorMessage, Map<String, Object> dataMap);
}
