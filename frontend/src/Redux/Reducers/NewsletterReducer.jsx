import { CREATE_NEWSLETTER_RED, DELETE_NEWSLETTER_RED, GET_NEWSLETTER_RED, UPDATE_NEWSLETTER_RED } from "../Constants"

export default function NewsletterReducer(state = [], action) {
    let index
    switch (action.type) {
        case CREATE_NEWSLETTER_RED:
            return [...state, action.payload]

        case GET_NEWSLETTER_RED:
            return action.payload

        case UPDATE_NEWSLETTER_RED:
            index = state.findIndex(x => x._id === action.payload._id)
            state[index] = { ...action.payload }
            return state

        case DELETE_NEWSLETTER_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}