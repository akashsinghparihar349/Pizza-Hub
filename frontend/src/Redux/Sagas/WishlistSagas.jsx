import { put, takeEvery } from "redux-saga/effects"
import { CREATE_WISHLIST, CREATE_WISHLIST_RED, DELETE_WISHLIST, DELETE_WISHLIST_RED, GET_WISHLIST, GET_WISHLIST_RED, UPDATE_WISHLIST, UPDATE_WISHLIST_RED } from "../Constants"
import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/index"
// import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/index"

function* createSaga(action) {                                                      //Worker
    let response = yield createRecord("wishlist", action.payload)
    // let response = yield createMultipartRecord("wishlist", action.payload)
    yield put({ type: CREATE_WISHLIST_RED, payload: response })
}

function* getSaga() {                                                               //Worker
    let response = yield getRecord("wishlist")
    yield put({ type: GET_WISHLIST_RED, payload: response })
}

function* updateSaga(action) {                                                      //Worker
    yield updateRecord("wishlist", action.payload)
    yield put({ type: UPDATE_WISHLIST_RED, payload: action.payload })
    // let response = yield updateMultipartRecord("wishlist", action.payload)
    //yield  put({ type: CREATE_WISHLIST_RED, payload: response })
}

function* deleteSaga(action) {                                                      //Worker
    yield deleteRecord("wishlist", action.payload)
    yield put({ type: DELETE_WISHLIST_RED, payload: action.payload })
}


export default function* WishlistSaga() {
    yield takeEvery(CREATE_WISHLIST, createSaga)                            //Watcher
    yield takeEvery(GET_WISHLIST, getSaga)                                  //Watcher
    yield takeEvery(UPDATE_WISHLIST, updateSaga)                            //Watcher
    yield takeEvery(DELETE_WISHLIST, deleteSaga)                            //Watcher
}