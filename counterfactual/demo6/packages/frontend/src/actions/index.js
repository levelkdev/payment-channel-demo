import {
  getModels,
} from '../utils';

export const SET_LOGIN_SUCCESS = 'SET_LOGIN_SUCCESS'
export const SET_USER = 'SET_USER'
export const REFRESH_USER = 'REFRESH_USER'
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'
export const SET_SUCCESS_MESSAGE = 'SET_SUCCESS_MESSAGE'

// TODO: clean up, remove redundant code

export const login = (email, password) => {
  return async dispatch => {
    try {
      const {id:sessionId, userId} = await getModels().user.login({
        email, password
      })

      localStorage.setItem('sessionId', sessionId)
      localStorage.setItem('userId', userId)

      const user = await getModels().user.findById(userId)
      dispatch(setLoginSuccess(true))
      dispatch(setUser({
        email,
        userId: userId,
        contractAddress: user.contractAddress,
        contractStatus: user.contractStatus,
        balance: user.balance,
        emailVerified: user.emailVerified,
        sessionId
      }))
      dispatch(setSuccessMessage('login successful'))
    } catch(err) {
      dispatch(setLoginSuccess(false))
      dispatch(setErrorMessage(err.message))
    }
  }
}

export const loginGoogle = (email, googleId) => {
  return async dispatch => {
    try {
      // TODO: not do this
      const password = 'helloworld123'

      // TODO: fix
      try {
        await getModels().user.login({
          email, password
        })
      } catch(err) {
        await getModels().User.create({
          email, password
        })
      }

      const {id:sessionId, userId} = await getModels().user.login({
        email, password
      })

      localStorage.setItem('sessionId', sessionId)
      localStorage.setItem('userId', userId)

      const user = await getModels().user.findById(userId)
      dispatch(setLoginSuccess(true))
      dispatch(setUser({
        email,
        userId: userId,
        contractAddress: user.contractAddress,
        contractStatus: user.contractStatus,
        balance: user.balance,
        emailVerified: user.emailVerified,
        sessionId
      }))
      dispatch(setSuccessMessage('login successful'))
    } catch(err) {
      dispatch(setLoginSuccess(false))
      dispatch(setErrorMessage(err.message))
    }
  }
}

export const signup = (email, password) => {
  return async dispatch => {
    try {
      await getModels().User.create({
        email, password
      })
      const {id:sessionId, userId} = await getModels().user.login({
        email, password
      })
      const user = await getModels().user.findById(userId)

      localStorage.setItem('sessionId', sessionId)
      localStorage.setItem('userId', userId)

      dispatch(setLoginSuccess(true))
      dispatch(setUser({
        email,
        userId: userId,
        contractAddress: user.contractAddress,
        contractStatus: user.contractStatus,
        balance: user.balance,
        emailVerified: user.emailVerified,
        sessionId: sessionId
      }))
      dispatch(setSuccessMessage('account created successfully'))
    } catch(err) {
      dispatch(setLoginSuccess(false))
      dispatch(setErrorMessage(err.message))
    }
  }
}

export const signupGoogle = (email, googleId) => {
  return async dispatch => {
    try {
      // TODO: not do this
      const password = 'helloworld123'

      await getModels().User.create({
        email,
        password,
        googleId,
      })
      const {id:sessionId, userId} = await getModels().user.login({
        email,
        password
      })
      const user = await getModels().user.findById(userId)

      localStorage.setItem('sessionId', sessionId)
      localStorage.setItem('userId', userId)

      dispatch(setLoginSuccess(true))
      dispatch(setUser({
        email,
        userId: userId,
        contractAddress: user.contractAddress,
        contractStatus: user.contractStatus,
        balance: user.balance,
        emailVerified: user.emailVerified,
        sessionId: sessionId
      }))
      dispatch(setSuccessMessage('account created successfully'))
    } catch(err) {
      dispatch(setLoginSuccess(false))
      dispatch(setErrorMessage(err.message))
    }
  }
}


export const logout = () => {
  return async dispatch => {
    try {
      //const sessionId = localStorage.getItem('sessionId')
      //const accessToken = getModels().accessToken(sessionId)
      //const result = await getModels().User.logout({accessToken: accessToken})
      localStorage.removeItem('sessionId')
      localStorage.removeItem('userId')
      dispatch(setUser({
        email: null,
        userId: null,
        contractAddress: null,
        contractStatus: null,
        emailVerified: false,
        sessionId: null
      }))
      dispatch(setSuccessMessage('logout successful'))
    } catch(err) {
      dispatch(setErrorMessage(err.message))
    }
    dispatch(setLoginSuccess(false))
  }
}

export const sendResetPasswordEmail = (email) => {
  return async dispatch => {
    try {
      await getModels().User.resetPassword({
        email,
      })
      dispatch(setSuccessMessage('email sent'))
    } catch(err) {
      dispatch(setErrorMessage(err.message))
    }
  }
}

export const resetPassword = (password, passwordConfirm, token) => {
  return async dispatch => {
    try {
      if (!token) {
        throw Error('access token is required')
      }
      if (password !== passwordConfirm) {
        throw Error('passwords do not match')
      }

      const accessToken = getModels().accessToken(token)
      await getModels().User.updatePasswordFromToken(
        accessToken,
        token,
        password,
      )
      dispatch(setSuccessMessage('password change successful'))
    } catch(err) {
      dispatch(setErrorMessage(err.message))
    }
  }
}

export const refreshUser = (userId) => {
  return async dispatch => {
    try {
      const user = await getModels().user.findById(userId)
      dispatch(refreshUserAction({
        email: user.email,
        userId: user.id,
        contractAddress: user.contractAddress,
        contractStatus: user.contractStatus,
        balance: user.balance,
        emailVerified: user.emailVerified,
      }))
    } catch(err) {
      dispatch(setErrorMessage(err.message))
    }
  }
}

export const sendEther = (recipient, amount) => {
  return async dispatch => {
    try {
      console.log(recipient, amount)
      dispatch(setSuccessMessage('sent'))
    } catch(err) {
      dispatch(setErrorMessage(err.message))
    }
  }
}

export const deployContract = (userId, recipient, amount) => {
  return async dispatch => {
    try {
      const {txHash} = await getModels().User.deployContract({userId, recipient, amount})

      dispatch(setSuccessMessage(`transaction ${txHash}`))
    } catch(err) {
      dispatch(setErrorMessage(err.message))
    }
  }
}

function setLoginSuccess(success) {
  return {
    type: SET_LOGIN_SUCCESS,
    success
  }
}

function setUser(user) {
  return {
    type: SET_USER,
    user
  }
}

function refreshUserAction(user) {
  return {
    type: REFRESH_USER,
    user
  }
}

function setErrorMessage(message) {
  return {
    type: SET_ERROR_MESSAGE,
    message
  }
}

function setSuccessMessage(message) {
  return {
    type: SET_SUCCESS_MESSAGE,
    message
  }
}
