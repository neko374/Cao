import dialogManager from '../dialogManager.js';
import observed from '../../observed/observed.js';

const TWO_DIGITS = 2;

export default {
    props: {
        pickerData: {
            default: {}
        }
    },
    parseDialogInfo(dialogInfo, dialog, url) {
        dialog.pickerType = dialogInfo.pickerType;
        if (dialogInfo.pickerType == 'text') {
            dialog = this.parseTextDialog(dialogInfo, dialog);
            observed.addObserver(dialog.path, (key, value) => {
                if ('range' in value && 'value' in value) {
                    dialog.range = value.range;
                    dialog.value = value.value;
                }
            });
        } else if (dialogInfo.pickerType == 'time') {
            dialog = this.parseTimeDialog(dialogInfo, dialog);
        } else if (dialogInfo.pickerType == 'date') {
            dialog = this.parseTimeDialog(dialogInfo, dialog);
        } else if (dialogInfo.pickerType == 'datetime') {
            dialog = this.parseDateTimeDialog(dialogInfo, dialog);
        } else if (dialogInfo.pickerType == 'multi-text') {
            dialog = this.parseMultiTextDialog(dialogInfo, dialog);
            observed.addObserver(dialog.path, (key, value) => {
                if ('range' in value && 'value' in value) {
                    dialog.range = value.range;
                    dialog.value = value.value;
                }
            });
        }
        return dialog;
    },
    parseTextDialog(dialogInfo, dialog) {
        dialog.range = dialogInfo.range;
        dialog.value = dialogInfo.value;
        if ('defaultValue' in dialogInfo) {
            dialog.selected = dialogInfo.defaultValue;
        }
        if ('preField' in dialogInfo) {
            dialog.indicatorprefix = dialogInfo.preField;
        } else {
            dialog.indicatorprefix = '';
        }
        if ('postField' in dialogInfo) {
            dialog.indicatorsuffix = dialogInfo.postField;
        } else {
            dialog.indicatorsuffix = '';
        }
        return dialog;
    },
    parseTimeDialog(dialogInfo, dialog) {
        if ('defalutValue' in dialogInfo) {
            dialog.selected = dialogInfo.defaultValue;
        }
        if ('containSecond' in dialogInfo) {
            dialog.containsecond = dialogInfo.containSecond;
        }
        if ('hours' in dialogInfo) {
            dialog.hours = dialogInfo.hours;
        }
        return dialog;
    },
    parseDateDialog(dialogInfo, dialog) {
        if ('defaultValue' in dialogInfo) {
            dialog.selected = dialogInfo.defaultValue;
        }
        if ('start' in dialogInfo) {
            dialog.start = dialogInfo.start;
        }
        if ('end' in dialogInfo) {
            dialog.end = dialogInfo.end;
        }
        if ('lunar' in dialogInfo) {
            dialog.lunar = dialogInfo.lunar;
        }
        return dialog;
    },
    parseDateTimeDialog(dialogInfo, dialog) {
        if ('defaultValue' in dialogInfo) {
            dialog.selected = dialogInfo.defalutValue;
        }
        if ('hours' in dialogInfo) {
            dialog.hours = dialogInfo.hours;
        }
        if ('lunar' in dialogInfo) {
            dialog.lunar = dialogInfo.lunar;
        }
        return dialog;
    },
    parseMultiTextDialog(dialogInfo, dialog) {
        dialog.columns = dialogInfo.columns;
        dialog.range = dialogInfo.range;
        dialog.value = dialogInfo.value;
        if ('defaultValue' in dialogInfo) {
            dialog.selected = dialogInfo.defaultValue;
        }
        return dialog;
    },
    valueChange(data) {
        let value = '';
        if (this.pickerData.pickerType == 'text') {
            value = this.pickerData.value[data.newSelected];
        } else if (this.pickerData.pickerType == 'time') {
            if ('second' in data) {
                value = ('00' + data.hour).slice(-TWO_DIGITS) + ':' +
                ('00' + data.minute).slice(-TWO_DIGITS) + ':' +
                ('00' + data.second).slice(-TWO_DIGITS);
            } else {
                value = ('00' + data.hour).slice(-TWO_DIGITS) + ':' +
                ('00' + data.minute).slice(-TWO_DIGITS);
            }
        } else if (this.pickerData.pickerType == 'date') {
            value = data.year + '-' + ('00' + (data.month + 1)).slice(-TWO_DIGITS) + '-' +
            ('00' + data.day).slice(-TWO_DIGITS);
        } else if (this.pickerData.pickerType == 'datetime') {
            value = data.year + '-' + ('00' + (data.month + 1)).slice(-TWO_DIGITS) + '-' +
            ('00' + data.day).slice(-TWO_DIGITS) + ' ' +
            ('00' + data.hour).slice(-TWO_DIGITS) + ':' +
            ('00' + data.minute).slice(-TWO_DIGITS) + ':00';
        } else if (this.pickerData.pickerType == 'multi-text') {
            value = [];
            for (let i = 0; i < data.newSelected.length; i++) {
                value.push(this.pickerData.value[i][data.newSelected[i]]);
            }
        }
        let dialogKeyValue = dialogManager.cloneDialogKeyValue(this.pickerData);
        dialogKeyValue[this.pickerData.path] = value;
        dialogKeyValue.dialogList.splice(0, 1);
        dialogManager.setDialogKeyValue(dialogKeyValue);
    },
    getDefaultKeyValue(pickerData) {
        // This function is used to get the default data for the picker.
        // When the picker is of type text and multi-text, the default data is 0.
        // When the picker is of type time, date, datetime, the default data is the current time.
        let value;
        if (pickerData.pickerType == 'text') {
            value = 0;
        } else if (pickerData.pickerType == 'time') {
            let date = new Date();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            if ('containsecond' in pickerData && pickerData.containsecond == true) {
                value = hours + ':' + minutes + ':' + seconds;
            } else {
                value = hours + ':' + minutes;
            }
        } else if (pickerData.pickerType == 'date') {
            let date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            value = year + '-' + month + '-' + day;
        } else if (pickerData.pickerType == 'datetime') {
            let date = new Date();
            let year = date.getFullYear();
            let month = date.getMonth() + 1;
            let day = date.getDate();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            value = year + '-' + month + '-' + day + '-' + hours + '-' + minutes;
        } else if (pickerData.pickerType == 'multi-text') {
            let length = pickerData.range.length;
            let valueList = [];
            for (let i = 0; i < length; i++) {
                valueList.push(0);
            }
            value = valueList;
        }
        let dialogKeyValue = dialogManager.cloneDialogKeyValue(pickerData);
        dialogKeyValue[pickerData.path] = value;
        dialogKeyValue.dialogList.splice(0, 1);
        return dialogKeyValue;
    }
};