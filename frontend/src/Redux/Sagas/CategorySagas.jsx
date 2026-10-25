import { put, takeEvery } from "redux-saga/effects"
import { CREATE_CATEGORY, CREATE_CATEGORY_RED, DELETE_CATEGORY, DELETE_CATEGORY_RED, GET_CATEGORY, GET_CATEGORY_RED, UPDATE_CATEGORY, UPDATE_CATEGORY_RED } from "../Constants"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {
    let response = yield createMultipartRecord("category", action.payload)
    yield put({ type: CREATE_CATEGORY_RED, payload: response })
}

function* getSaga() {
    let response = yield getRecord("category")
    yield put({ type: GET_CATEGORY_RED, payload: response })
}

function* updateSaga(action) {
    let response = yield updateMultipartRecord("category", action.payload)
    yield put({ type: UPDATE_CATEGORY_RED, payload: response })
}

function* deleteSaga(action) {
    yield deleteRecord("category", action.payload)
    yield put({ type: DELETE_CATEGORY_RED, payload: action.payload })
}

export default function* CategorySaga() {
    yield takeEvery(CREATE_CATEGORY, createSaga)
    yield takeEvery(GET_CATEGORY, getSaga)
    yield takeEvery(UPDATE_CATEGORY, updateSaga)
    yield takeEvery(DELETE_CATEGORY, deleteSaga)
}
