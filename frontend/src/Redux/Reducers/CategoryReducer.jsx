import { CREATE_CATEGORY_RED, DELETE_CATEGORY_RED, GET_CATEGORY_RED, UPDATE_CATEGORY_RED } from "../Constants"

export default function CategoryReducer(state = [], action) {
    let index
    switch (action.type) {
        case CREATE_CATEGORY_RED:
            return [...state, action.payload]

        case GET_CATEGORY_RED:
            return action.payload || []

        case UPDATE_CATEGORY_RED:
            index = state.findIndex(x => x._id === action.payload?._id)
            if (index !== -1) {
                let newState = [...state]
                newState[index] = { ...action.payload }
                return newState
            }
            return state

        case DELETE_CATEGORY_RED:
            return state.filter(x => x._id !== action.payload?._id)

        default:
            return state
    }
}
