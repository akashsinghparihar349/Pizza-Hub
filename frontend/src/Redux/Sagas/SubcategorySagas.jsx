import { put, takeEvery } from "redux-saga/effects"
import { CREATE_SUBCATEGORY, CREATE_SUBCATEGORY_RED, DELETE_SUBCATEGORY, DELETE_SUBCATEGORY_RED, GET_SUBCATEGORY, GET_SUBCATEGORY_RED, UPDATE_SUBCATEGORY, UPDATE_SUBCATEGORY_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    // let response = yield createRecord("subcategory", action.payload)
    let response = yield createMultipartRecord("subcategory", action.payload)
    yield put({ type: CREATE_SUBCATEGORY_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("subcategory")
    yield put({ type: GET_SUBCATEGORY_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    let response = yield updateMultipartRecord("subcategory", action.payload)
    yield put({ type: UPDATE_SUBCATEGORY_RED, payload: response })
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("subcategory", action.payload)
    yield put({ type: DELETE_SUBCATEGORY_RED, payload: action.payload })
}


export default function* SubcategorySaga() {
    yield takeEvery(CREATE_SUBCATEGORY, createSaga)                            //Watcher
    yield takeEvery(GET_SUBCATEGORY, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_SUBCATEGORY, updateSaga)                            //Watcher
    yield takeEvery(DELETE_SUBCATEGORY, deleteSaga)                            //Watcher
}