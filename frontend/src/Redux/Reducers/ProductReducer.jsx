import { CREATE_PRODUCT_RED, DELETE_PRODUCT_RED, GET_PRODUCT_RED, UPDATE_PRODUCT_RED } from "../Constants"

export default function ProductReducer(state = [], action) {
    let index
    switch (action.type) {
        case CREATE_PRODUCT_RED:
            return [...state, action.payload]

        case GET_PRODUCT_RED:
            return action.payload

        case UPDATE_PRODUCT_RED:
            index = state.findIndex(x => x._id === action.payload._id)
            state[index] = { ...action.payload }
            return state

        case DELETE_PRODUCT_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}