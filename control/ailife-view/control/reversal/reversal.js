import observed from '../../observed/observed.js';
import itemView from '../item/item.js';
import utils from '../../utils/utils.js';

const UI_TYPE_REVERSAL = 'REVERSAL';

const LOCATION_LEFT = 'left';
const LOCATION_CENTER = 'center';

const BACKGROUND_COLOR = '#FFFFFF';

const HIGH_REVERSAL_HEIGHT = 88;
const LOW_REVERSAL_HEIGHT = 64;
const MARGIN = 8;

class ReversalObj {
    constructor(name, url) {
        this.name = name;
        this.url = url;
        this.showCurrentReversal = false;
        this.showNextReversal = false;
        this.command = [];
        this.value = '';
        this.nextValue = '';
        this.leftItem = null;
        this.centerItem = null;
        this.rightIcon = '';
        this.otherDisable = false;
        this.disableStack = [];
        this.disable = false;
        this.alpha = 1;
        this.heightType = '';
        this.backgroundColor = BACKGROUND_COLOR;
    }
}

export default {
    props: {
        reversalData: {
            default: []
        }
    },
    data: {
        reversalDataList: []
    },
    resetReversalDataList() {
        this.data.reverdalDataList = [];
    },
    convertJson(idx, templateUIInfo, url) {
        let index = utils.getCurrentIndex(idx, templateUIInfo, UI_TYPE_REVERSAL);
        if (this.data.reversalDataList.length == 0) {
            this.initReversalDataList(templateUIInfo, url);
        }
        if (this.data.reversalDataList[index].showCurrentReversal &&
        this.data.reversalDataList[index].showNextReversal) {
            return [this.data.reversalDataList[index], this.data.reversalDataList[index + 1]];
        } else if (this.data.reversalDataList[index].showCurrentReversal) {
            return [this.data.reversalDataList[index]];
        } else {
            return [];
        }
    },
    initReversalDataList(templateUIInfo, url) {
        let showCurrentReversal = false;
        let showNextReversal = false;
        for (let i = 0; i < templateUIInfo.length; i++) {
            let reversalData = new ReversalObj(templateUIInfo[i].name, url);
            if (templateUIInfo[i].uiType == UI_TYPE_REVERSAL) {
                if (templateUIInfo[i].heightType == 'default') {
                    reversalData.heightType = 'high';
                } else {
                    reversalData.heightType = 'low';
                }
                reversalData.command = templateUIInfo[i].command;
                if (templateUIInfo[i].span == 1 ||
                i + 1 < templateUIInfo.length && templateUIInfo[i + 1].uiType != UI_TYPE_REVERSAL &&
                !showNextReversal ||
                i + 1 == templateUIInfo.length && templateUIInfo[i].span != 1 && !showNextReversal) {
                    showCurrentReversal = true;
                    showNextReversal = false;
                } else {
                    if (showNextReversal == false) {
                        showCurrentReversal = true;
                        showNextReversal = true;
                    } else {
                        showCurrentReversal = false;
                        showNextReversal = false;
                    }
                }
                reversalData.showCurrentReversal = showCurrentReversal;
                reversalData.showNextReversal = showNextReversal;
                if (templateUIInfo[i].displayItemOne != null) {
                    reversalData.showLeftItem = true;
                    reversalData.leftItem = itemView.convertJson(templateUIInfo[i].displayItemOne, url,
                        templateUIInfo[i].gravity, templateUIInfo[i].heightType, LOCATION_LEFT);
                    reversalData.leftItem.type = UI_TYPE_REVERSAL;
                }
                if (templateUIInfo[i].displayItemTwo != null) {
                    reversalData.showCurrentReversal = true;
                    reversalData.centerItem = itemView.convertJson(templateUIInfo[i].displayItemTwo, url,
                        templateUIInfo[i].gravity, templateUIInfo[i].heightType, LOCATION_CENTER);
                    reversalData.centerItem.type = UI_TYPE_REVERSAL;
                }
                this.addObserver(reversalData);
                this.data.reversalDataList.push(reversalData);
            }
        }
    },
    addObserver(reversalData) {
        observed.addObserver(reversalData.name, (key, value) => {
            utils.setAlphaAndDisable(reversalData, value);
            this.updateIconDisable(reversalData, value);
        });
        let path = reversalData.command[0].sid + '/' + reversalData.command[0].characteristic;
        observed.addObserver(path, (key, value) => {
            if (value !== reversalData.value) {
                this.updateReversalIcon(key, value, reversalData);
                this.setOtherDisable(reversalData);
                reversalData.value = value;
            }
        });
    },
    updateIconDisable(reversalData, isDisable) {
        for (let i = 0; i < reversalData.command[0].reversal.length; i++) {
            let reversalItem = reversalData.command[0].reversal[i];
            if (reversalItem.value == reversalData.value) {
                if (isDisable) {
                    let icon = reversalItem.disableIcon;
                    reversalData.rightIcon = reversalData.url + icon;
                } else if (reversalData.value != 0) {
                    let icon = reversalItem.icon;
                    reversalData.rightIcon = reversalData.url + icon;
                }
            }
        }
    },
    updateReversalIcon(path, data, reversalData) {
        data = data == 0 ? 0 : 1;
        let sid = path.split('/')[0];
        let characteristic = path.split('/')[1];
        for (let j = 0; j < reversalData.command[0].reversal.length; j++) {
            if (sid == reversalData.command[0].sid && characteristic == reversalData.command[0].characteristic) {
                let reversalItem = reversalData.command[0].reversal[j];
                if (reversalItem.value == data) {
                    let icon = reversalItem.icon;
                    reversalData.rightIcon = reversalData.url + icon;
                    if ('disable' in reversalItem) {
                        reversalData.otherDisable = true;
                    } else {
                        reversalData.otherDisable = false;
                    }
                } else {
                    reversalData.nextValue = reversalItem.value;
                }
            } else {
                continue;
            }
        }
    },
    setOtherDisable(reversalData) {
        for (let i = 0; i < reversalData.command[0].reversal.length; i++) {
            if ('disable' in reversalData.command[0].reversal[i]) {
                let nameList = reversalData.command[0].reversal[i].disable.name;
                for (let j = 0; j < nameList.length; j++) {
                    observed.notifyObservers(nameList[j], reversalData.otherDisable);
                }
            }
        }
    },
    async reverseIconClick(index) {
        let reversalData = this.reversalData[index];
        if (reversalData.disable == true) {
            return;
        }
        let value = reversalData.value == 0 ? 0 : 1;
        if ('operable' in reversalData.command[0].reversal[value] &&
        reversalData.command[0].reversal[value].operable == false) {
            return;
        }
        if ('dialogList' in reversalData.command[0].reversal[reversalData.value]) {
            let dialogKeyValue = {};
            let path = reversalData.command[0].sid + '/' + reversalData.command[0].characteristic;
            dialogKeyValue.path = path;
            dialogKeyValue[path] = reversalData.nextValue;
            dialogKeyValue.dialogList = [];
            for (let i = 0; i < reversalData.command[0].reversal[reversalData.value].dialogList.length; i++) {
                dialogKeyValue.dialogList.push(reversalData.command[0].reversal[reversalData.value].dialogList[i]);
            }
            observed.notifyObservers(reversalData.command[0].reversal[reversalData.value].dialogList[0],
                dialogKeyValue);
        } else {
            observed.setKeyValue(reversalData.command[0].sid + '/' + reversalData.command[0].characteristic,
                reversalData.nextValue);
        }
    },
    getReversalHeight(reversalData) {
        let reversalHeight = 0;
        if (reversalData.length == 1 && reversalData[0].showCurrentReversal) {
            if (reversalData[0].heightType == 'low') {
                reversalHeight = LOW_REVERSAL_HEIGHT + MARGIN;
            } else {
                reversalHeight = HIGH_REVERSAL_HEIGHT + MARGIN;
            }
        } else if (reversalData.length == 2) {
            reversalHeight = LOW_REVERSAL_HEIGHT + MARGIN;
        }
        return reversalHeight;
    }
};