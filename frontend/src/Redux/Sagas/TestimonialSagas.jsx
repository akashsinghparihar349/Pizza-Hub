import { put, takeEvery } from "redux-saga/effects"
import { CREATE_TESTIMONIAL, CREATE_TESTIMONIAL_RED, DELETE_TESTIMONIAL, DELETE_TESTIMONIAL_RED, GET_TESTIMONIAL, GET_TESTIMONIAL_RED, UPDATE_TESTIMONIAL, UPDATE_TESTIMONIAL_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
// import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    let response = yield createRecord("testimonial", action.payload)
    // let response = yield createMultipartRecord("testimonial", action.payload)
    yield put({ type: CREATE_TESTIMONIAL_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("testimonial")
    yield put({ type: GET_TESTIMONIAL_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    yield updateRecord("testimonial", action.payload)
    yield put({ type: UPDATE_TESTIMONIAL_RED, payload: action.payload })
    // let response = yield updateMultipartRecord("testimonial", action.payload)
    //yield  put({ type: CREATE_TESTIMONIAL_RED, payload: response })
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("testimonial", action.payload)
    yield put({ type: DELETE_TESTIMONIAL_RED, payload: action.payload })
}


export default function* TestimonialSaga() {
    yield takeEvery(CREATE_TESTIMONIAL, createSaga)                            //Watcher
    yield takeEvery(GET_TESTIMONIAL, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_TESTIMONIAL, updateSaga)                            //Watcher
    yield takeEvery(DELETE_TESTIMONIAL, deleteSaga)                            //Watcher
}