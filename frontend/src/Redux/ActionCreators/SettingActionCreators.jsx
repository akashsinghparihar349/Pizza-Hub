import { CREATE_SETTING, DELETE_SETTING, GET_SETTING, UPDATE_SETTING } from "../Constants"

export function createSetting(data) {
    return {
        type: CREATE_SETTING,
        payload: data
    }
}

export function getSetting() {
    return {
        type: GET_SETTING
    }
}

export function updateSetting(data) {
    return {
        type: UPDATE_SETTING,
        payload: data
    }
}

export function deleteSetting(data) {
    return {
        type: DELETE_SETTING,
        payload: data
    }
}