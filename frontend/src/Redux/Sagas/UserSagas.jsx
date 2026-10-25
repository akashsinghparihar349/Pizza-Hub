import { put, takeEvery } from "redux-saga/effects"
import { CREATE_USER, CREATE_USER_RED, DELETE_USER, DELETE_USER_RED, GET_USER, GET_USER_RED, UPDATE_USER, UPDATE_USER_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
// import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    let response = yield createRecord("user", action.payload)
    // let response = yield createMultipartRecord("user", action.payload)
    yield put({ type: CREATE_USER_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("user")
    yield put({ type: GET_USER_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    yield updateRecord("user", action.payload)
    yield put({ type: UPDATE_USER_RED, payload: action.payload })
    // let response = yield updateMultipartRecord("user", action.payload)
    //yield  put({ type: CREATE_USER_RED, payload: response })
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("user", action.payload)
    yield put({ type: DELETE_USER_RED, payload: action.payload })
}


export default function* UserSaga() {
    yield takeEvery(CREATE_USER, createSaga)                            //Watcher
    yield takeEvery(GET_USER, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_USER, updateSaga)                            //Watcher
    yield takeEvery(DELETE_USER, deleteSaga)                            //Watcher
}