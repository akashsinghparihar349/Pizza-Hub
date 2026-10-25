import { put, takeEvery } from "redux-saga/effects"
import { CREATE_MAINCATEGORY, CREATE_MAINCATEGORY_RED, DELETE_MAINCATEGORY, DELETE_MAINCATEGORY_RED, GET_MAINCATEGORY, GET_MAINCATEGORY_RED, UPDATE_MAINCATEGORY, UPDATE_MAINCATEGORY_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    // let response = yield createRecord("maincategory", action.payload)
    let response = yield createMultipartRecord("maincategory", action.payload)
    yield put({ type: CREATE_MAINCATEGORY_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("maincategory")
    yield put({ type: GET_MAINCATEGORY_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    let response = yield updateMultipartRecord("maincategory", action.payload)
    yield put({ type: UPDATE_MAINCATEGORY_RED, payload: response })
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("maincategory", action.payload)
    yield put({ type: DELETE_MAINCATEGORY_RED, payload: action.payload })
}


export default function* MaincategorySaga() {
    yield takeEvery(CREATE_MAINCATEGORY, createSaga)                            //Watcher
    yield takeEvery(GET_MAINCATEGORY, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_MAINCATEGORY, updateSaga)                            //Watcher
    yield takeEvery(DELETE_MAINCATEGORY, deleteSaga)                            //Watcher
}