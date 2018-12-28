// import { combineReducers } from 'redux'
import {
  SET_LOGIN_SUCCESS,
  SET_LOGIN_NONCE,
  SET_USER,
  REFRESH_USER,
  SET_ERROR_MESSAGE,
  SET_SUCCESS_MESSAGE,
  SET_SUBSCRIPTION_STATUS,
} from '../actions'

let initialState = {
  email: null,
  userId: parseInt(localStorage.getItem('userId')),
  loggedIn: !!localStorage.getItem('sessionId'),
  contractAddress: null,
  contractStatus: null,
  balance: 0,
  errorMessage: null,
  successMessage: null,
  loginNonce: null,
  status: null
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOGIN_SUCCESS:
      return Object.assign({}, state, {
        loggedIn: action.success
      })
    case SET_LOGIN_NONCE:
      return Object.assign({}, state, {
        loginNonce: action.nonce
      })
    case SET_USER:
      return Object.assign({}, state, {
        email: action.user.email,
        userId: action.user.userId,
        contractAddress: action.user.contractAddress,
        contractStatus: action.user.contractStatus,
        balance: action.user.balance,
        recoveryAddress: action.user.recoveryAddress,
        sessionId: action.user.sessionId
      })
    case REFRESH_USER:
      return Object.assign({}, state, {
        email: action.user.email,
        userId: action.user.userId,
        contractAddress: action.user.contractAddress,
        contractStatus: action.user.contractStatus,
        recoveryAddress: action.user.recoveryAddress,
        balance: action.user.balance
      })
    case SET_ERROR_MESSAGE:
      return Object.assign({}, state, {
        errorMessage: action.message,
        successMessage: null
      })
    case SET_SUCCESS_MESSAGE:
      return Object.assign({}, state, {
        errorMessage: null,
        successMessage: action.message
      })
    case SET_SUBSCRIPTION_STATUS:
      return Object.assign({}, state, {
        subscriptionStatus: {
          active: action.status.active,
          closeDate: action.status.closeDate,
          closed: action.status.closed,
          completed: action.status.completed,
          frequency: action.status.frequency,
          limit: action.status.limit,
          max: action.status.max,
          startDate: action.status.startDate,
          subscriber: action.status.subscriber,
        }
      })
    default:
      return state
  }
}

export default reducer
