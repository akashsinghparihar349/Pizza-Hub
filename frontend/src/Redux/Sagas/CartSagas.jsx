import { put, takeEvery } from "redux-saga/effects"
import { CREATE_CART, CREATE_CART_RED, DELETE_CART, DELETE_CART_RED, GET_CART, GET_CART_RED, UPDATE_CART, UPDATE_CART_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
// import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    let response = yield createRecord("cart", action.payload)
    // let response = yield createMultipartRecord("cart", action.payload)
    yield put({ type: CREATE_CART_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("cart")
    yield put({ type: GET_CART_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    yield updateRecord("cart", action.payload)
    yield put({ type: UPDATE_CART_RED, payload: action.payload })
    // let response = yield updateMultipartRecord("cart", action.payload)
    // yield  put({ type: CREATE_CART_RED, payload: response })
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("cart", action.payload)
    yield put({ type: DELETE_CART_RED, payload: action.payload })
}


export default function* CartSaga() {
    yield takeEvery(CREATE_CART, createSaga)                            //Watcher
    yield takeEvery(GET_CART, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_CART, updateSaga)                            //Watcher
    yield takeEvery(DELETE_CART, deleteSaga)                            //Watcher
}