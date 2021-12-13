package com.example.cao;

import com.huawei.ailifeability.NetConfigAbility;

import ohos.aafwk.ability.AbilityPackage;

public class MyApplication extends AbilityPackage {
    @Override
    public void onInitialize() {
        super.onInitialize();
    }

    @Override
    public void onEnd() {
        super.onEnd();
        NetConfigAbility.deregister();
    }
}
