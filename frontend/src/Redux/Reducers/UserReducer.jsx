import { CREATE_USER_RED, DELETE_USER_RED, GET_USER_RED, UPDATE_USER_RED } from "../Constants"

export default function UserReducer(state = [], action) {
    switch (action.type) {
        case CREATE_USER_RED:
            return [...state, action.payload]

        case GET_USER_RED:
            return Array.isArray(action.payload) ? action.payload : []

        case UPDATE_USER_RED:
            return state.map(x => x._id === action.payload?._id ? { ...x, ...action.payload } : x)

        case DELETE_USER_RED:
            return state.filter(x => x._id !== action.payload?._id)

        default:
            return state
    }
}