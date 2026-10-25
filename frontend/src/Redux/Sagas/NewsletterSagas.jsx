import { put, takeEvery } from "redux-saga/effects"
import { CREATE_NEWSLETTER, CREATE_NEWSLETTER_RED, DELETE_NEWSLETTER, DELETE_NEWSLETTER_RED, GET_NEWSLETTER, GET_NEWSLETTER_RED, UPDATE_NEWSLETTER, UPDATE_NEWSLETTER_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
// import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    let response = yield createRecord("newsletter", action.payload)
    // let response = yield createMultipartRecord("newsletter", action.payload)
    yield put({ type: CREATE_NEWSLETTER_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("newsletter")
    yield put({ type: GET_NEWSLETTER_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    yield updateRecord("newsletter", action.payload)
    yield put({ type: UPDATE_NEWSLETTER_RED, payload: action.payload })
    // let response = yield updateMultipartRecord("newsletter", action.payload)
    //yield  put({ type: CREATE_NEWSLETTER_RED, payload: response })
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("newsletter", action.payload)
    yield put({ type: DELETE_NEWSLETTER_RED, payload: action.payload })
}


export default function* NewsletterSaga() {
    yield takeEvery(CREATE_NEWSLETTER, createSaga)                            //Watcher
    yield takeEvery(GET_NEWSLETTER, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_NEWSLETTER, updateSaga)                            //Watcher
    yield takeEvery(DELETE_NEWSLETTER, deleteSaga)                            //Watcher
}