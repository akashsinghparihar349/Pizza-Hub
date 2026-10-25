import { put, takeEvery } from "redux-saga/effects"
import { CREATE_PRODUCT, CREATE_PRODUCT_RED, DELETE_PRODUCT, DELETE_PRODUCT_RED, GET_PRODUCT, GET_PRODUCT_RED, UPDATE_PRODUCT, UPDATE_PRODUCT_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord, updateRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    // let response = yield createRecord("product", action.payload)
    let response = yield createMultipartRecord("product", action.payload)
    yield put({ type: CREATE_PRODUCT_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("product")
    yield put({ type: GET_PRODUCT_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    if (localStorage.getItem("role") === "Buyer") {
        yield updateRecord("product", action.payload)
        yield put({ type: UPDATE_PRODUCT_RED, payload: action.payload })
    }
    else {
        let response = yield updateMultipartRecord("product", action.payload)
        yield put({ type: UPDATE_PRODUCT_RED, payload: response })
    }
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("product", action.payload)
    yield put({ type: DELETE_PRODUCT_RED, payload: action.payload })
}


export default function* ProductSaga() {
    yield takeEvery(CREATE_PRODUCT, createSaga)                            //Watcher
    yield takeEvery(GET_PRODUCT, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_PRODUCT, updateSaga)                            //Watcher
    yield takeEvery(DELETE_PRODUCT, deleteSaga)                            //Watcher
}