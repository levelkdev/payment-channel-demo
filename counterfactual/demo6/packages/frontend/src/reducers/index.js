//import { combineReducers } from 'redux'
import {
  SET_LOGIN_SUCCESS,
  SET_USER,
  REFRESH_USER,
  SET_ERROR_MESSAGE,
  SET_SUCCESS_MESSAGE,
} from '../actions'

let initialState = {
  email: null,
  userId: parseInt(localStorage.getItem('userId')),
  loggedIn: !!localStorage.getItem('sessionId'),
  contractAddress: null,
  contractStatus: null,
  balance: 0,
  errorMessage: null,
  successMessage: null
}

const reducer = (state=initialState, action) => {
  switch (action.type) {
    case SET_LOGIN_SUCCESS:
      return Object.assign({}, state, {
        loggedIn: action.success
      })
    case SET_USER:
      return Object.assign({}, state, {
        email: action.user.email,
        userId: action.user.userId,
        contractAddress: action.user.contractAddress,
        contractStatus: action.user.contractStatus,
        balance: action.user.balance,
        sessionId: action.user.sessionId
      })
    case REFRESH_USER:
      return Object.assign({}, state, {
        email: action.user.email,
        userId: action.user.userId,
        contractAddress: action.user.contractAddress,
        contractStatus: action.user.contractStatus,
        balance: action.user.balance,
      })
    case SET_ERROR_MESSAGE:
      return Object.assign({}, state, {
        errorMessage: action.message,
        successMessage: null,
      })
    case SET_SUCCESS_MESSAGE:
      return Object.assign({}, state, {
        errorMessage: null,
        successMessage: action.message,
      })
    default:
      return state
  }
}

export default reducer
