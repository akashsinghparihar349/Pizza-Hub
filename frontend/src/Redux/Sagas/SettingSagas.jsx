import { put, takeEvery } from "redux-saga/effects"
import { CREATE_SETTING, CREATE_SETTING_RED, DELETE_SETTING, DELETE_SETTING_RED, GET_SETTING, GET_SETTING_RED, UPDATE_SETTING, UPDATE_SETTING_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
// import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    let response = yield createRecord("setting", action.payload)
    // let response = yield createMultipartRecord("setting", action.payload)
    yield put({ type: CREATE_SETTING_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("setting")
    yield put({ type: GET_SETTING_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    yield updateRecord("setting", action.payload)
    yield put({ type: UPDATE_SETTING_RED, payload: action.payload })
    // let response = yield updateMultipartRecord("setting", action.payload)
    //yield  put({ type: CREATE_SETTING_RED, payload: response })
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("setting", action.payload)
    yield put({ type: DELETE_SETTING_RED, payload: action.payload })
}


export default function* SettingSaga() {
    yield takeEvery(CREATE_SETTING, createSaga)                            //Watcher
    yield takeEvery(GET_SETTING, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_SETTING, updateSaga)                            //Watcher
    yield takeEvery(DELETE_SETTING, deleteSaga)                            //Watcher
}