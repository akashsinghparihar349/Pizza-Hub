import { CREATE_CART_RED, DELETE_CART_RED, GET_CART_RED, UPDATE_CART_RED } from "../Constants"

export default function CartReducer(state = [], action) {
    let index
    switch (action.type) {
        case CREATE_CART_RED:
            return [...state, action.payload]

        case GET_CART_RED:
            return action.payload

        case UPDATE_CART_RED:
            index = state.findIndex(x => x._id === action.payload._id)
            state[index] = { ...action.payload }
            return state

        case DELETE_CART_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}