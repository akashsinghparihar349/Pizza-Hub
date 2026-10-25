import { put, takeEvery } from "redux-saga/effects"
import { CREATE_BRAND, CREATE_BRAND_RED, DELETE_BRAND, DELETE_BRAND_RED, GET_BRAND, GET_BRAND_RED, UPDATE_BRAND, UPDATE_BRAND_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    // let response = yield createRecord("brand", action.payload)
    let response = yield createMultipartRecord("brand", action.payload)
    yield put({ type: CREATE_BRAND_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("brand")
    yield put({ type: GET_BRAND_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    let response = yield updateMultipartRecord("brand", action.payload)
    yield put({ type: UPDATE_BRAND_RED, payload: response })
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("brand", action.payload)
    yield put({ type: DELETE_BRAND_RED, payload: action.payload })
}


export default function* BrandSaga() {
    yield takeEvery(CREATE_BRAND, createSaga)                            //Watcher
    yield takeEvery(GET_BRAND, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_BRAND, updateSaga)                            //Watcher
    yield takeEvery(DELETE_BRAND, deleteSaga)                            //Watcher
}