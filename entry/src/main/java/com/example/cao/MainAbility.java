package com.example.cao;

import com.huawei.ailifeability.NetConfigAbility;

import ohos.aafwk.content.Intent;
import ohos.aafwk.content.IntentParams;
import ohos.ace.ability.AceAbility;
import ohos.utils.zson.ZSONObject;

import java.util.Base64;
import java.util.Objects;

import com.example.cao.widget.controller.FormController;
import com.example.cao.widget.controller.FormControllerManager;
import ohos.aafwk.ability.AbilitySlice;
import ohos.aafwk.ability.ProviderFormInfo;
import ohos.hiviewdfx.HiLog;
import ohos.hiviewdfx.HiLogLabel;

/**
 * This ability is pulled up after OneHop. Session id and device sn are delivered by intent. sessionId is used to
 * config the device network, deviceSn is the device specified in the NFC tag.
 * If you want to config the device network simply, use the default JS module.
 * If you want to use huawei account, use the login JS module. Modify {@link MainAbility#JS_MODULE}
 * The default productId is FAN, we also provider LAMP、TOOTHBRUSH、SOYMILKMACHINE.
 */
public class MainAbility extends AceAbility {
    public static final int DEFAULT_DIMENSION_2X2 = 2;
    private static final String DEFAULT_MODULE = "default";
    private static final String LOGIN_MODULE = "login";
    private static final String JS_MODULE = DEFAULT_MODULE;
    private static final int INVALID_FORM_ID = -1;
    private static final HiLogLabel TAG = new HiLogLabel(HiLog.DEBUG, 0x0, MainAbility.class.getName());
    private static String productId;
    private String productName = "FAN";
    private String topWidgetSlice;

    @Override
    public void onStart(Intent intent) {
        intent.setParam("window_modal", 3);
        setInstanceName(JS_MODULE);

        Object productInfo = Objects.requireNonNull(intent.getParams()).getParam("productInfo");
        if (productInfo != null) {
            productId = (String) productInfo;
            // modify your product name according to your product id in nfc tag.
            productName = "FAN";
        }

        Object businessInfo = Objects.requireNonNull(intent.getParams()).getParam("businessInfo");
        if (businessInfo != null) {
            ZSONObject businessInfoZSON = ZSONObject.classToZSON(businessInfo);
            // data91 is your device sn in nfc tag.
            String data91 = businessInfoZSON.getZSONObject("params").getString("91");
            // device sn is used to check your device validity
            String deviceSn = base64Decoder(data91);
        }
        String sessionId = intent.getStringParam("nanSessionId");
        if ("null".equals(sessionId) || "".equals(sessionId)) {
            NetConfigAbility.register(this, null);
        } else {
            NetConfigAbility.register(this, sessionId);
        }

        IntentParams intentParams = intent.getParams();
        if (intentParams != null) {
            intentParams.setParam("productId", productId);
            intentParams.setParam("productName", productName);
            intentParams.setParam("sessionId", sessionId);
            setPageParams(null, intentParams);
        }
        super.onStart(intent);
    }

    @Override
    public void onStop() {
        super.onStop();
    }

    @Override
    protected ProviderFormInfo onCreateForm(Intent intent) {
        HiLog.info(TAG, "onCreateForm");
        long formId = intent.getLongParam(AbilitySlice.PARAM_FORM_IDENTITY_KEY, INVALID_FORM_ID);
        String formName = intent.getStringParam(AbilitySlice.PARAM_FORM_NAME_KEY);
        int dimension = intent.getIntParam(AbilitySlice.PARAM_FORM_DIMENSION_KEY, DEFAULT_DIMENSION_2X2);
        HiLog.info(TAG, "onCreateForm: formId=" + formId + ",formName=" + formName);
        FormControllerManager formControllerManager = FormControllerManager.getInstance(this);
        FormController formController = formControllerManager.getController(formId);
        formController = (formController == null) ? formControllerManager.createFormController(formId,
                formName, dimension) : formController;
        if (formController == null) {
            HiLog.error(TAG, "Get null controller. formId: " + formId + ", formName: " + formName);
            return null;
        }
        return formController.bindFormData(formId);
    }

    @Override
    protected void onUpdateForm(long formId) {
        HiLog.info(TAG, "onUpdateForm");
        super.onUpdateForm(formId);
        FormControllerManager formControllerManager = FormControllerManager.getInstance(this);
        FormController formController = formControllerManager.getController(formId);
        formController.onUpdateFormData(formId);
    }

    @Override
    protected void onDeleteForm(long formId) {
        HiLog.info(TAG, "onDeleteForm: formId=" + formId);
        super.onDeleteForm(formId);
        FormControllerManager formControllerManager = FormControllerManager.getInstance(this);
        FormController formController = formControllerManager.getController(formId);
        formController.onDeleteForm(formId);
        formControllerManager.deleteFormController(formId);
    }

    @Override
    protected void onTriggerFormEvent(long formId, String message) {
        HiLog.info(TAG, "onTriggerFormEvent: " + message);
        super.onTriggerFormEvent(formId, message);
        FormControllerManager formControllerManager = FormControllerManager.getInstance(this);
        FormController formController = formControllerManager.getController(formId);
        formController.onTriggerFormEvent(formId, message);
    }

    @Override
    public void onNewIntent(Intent intent) {
        // Only response to it when starting from a service widget.
        if (intentFromWidget(intent)) {
            String newWidgetSlice = getRoutePageSlice(intent);
            if (topWidgetSlice == null || !topWidgetSlice.equals(newWidgetSlice)) {
                topWidgetSlice = newWidgetSlice;
                restart();
            }
        } else {
            if (topWidgetSlice != null) {
                topWidgetSlice = null;
                restart();
            }
        }
    }

    private boolean intentFromWidget(Intent intent) {
        long formId = intent.getLongParam(AbilitySlice.PARAM_FORM_IDENTITY_KEY, INVALID_FORM_ID);
        return formId != INVALID_FORM_ID;
    }

    private String getRoutePageSlice(Intent intent) {
        long formId = intent.getLongParam(AbilitySlice.PARAM_FORM_IDENTITY_KEY, INVALID_FORM_ID);
        if (formId == INVALID_FORM_ID) {
            return null;
        }
        FormControllerManager formControllerManager = FormControllerManager.getInstance(this);
        FormController formController = formControllerManager.getController(formId);
        if (formController == null) {
            return null;
        }
        Class<? extends AbilitySlice> clazz = formController.getRoutePageSlice(intent);
        if (clazz == null) {
            return null;
        }
        return clazz.getName();
    }

    private String base64Decoder(String data91) {
        Base64.Decoder decoder = Base64.getDecoder();
        byte[] bytes = decoder.decode(data91);
        StringBuilder stringBuilder = new StringBuilder();
        for (byte byteData : bytes) {
            stringBuilder.append((char) byteData);
        }
        return stringBuilder.toString();
    }
}
