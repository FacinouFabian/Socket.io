import React, {
    FunctionComponent,
    useReducer,
    useContext,
    Dispatch,
  } from 'react'
import SocketIo from "socket.io-client"

const io: SocketIOClient.Socket = SocketIo(process.env.REACT_APP_HOSTNAME as string)

type GameType = undefined | 'MagicNumber' | 'QuickWord' | 'WordAndFurious'

  // User type definition
  type State = {
    nickname?: string,
    io: SocketIOClient.Socket,
    gameType: GameType
  }
  
  // All user action
  type Action = { type: 'UPDATE_USERNAME' | 'UPDATE_GAMETYPE'; payload?: Partial<State> }
  
  type ContextProps = [State, Dispatch<Action>]
  
  type ProviderProps = {
    reducer: any
    initialState: any
  }
  
  type Reducer = (prevState: State, action: Action) => State
  
  // React expects the context to be created with default values
  // This object contain Provider and Consumer
  export const UserContext = React.createContext<ContextProps | null>(null)
  
  /**
   * @objectives
   * Storing the user's language preference in localStorage
   * Checking value of the locale URL parameter on every client-side route change
   * Synchronizing the context state with the locale embedded in the URL
   */
  export const UserProvider: FunctionComponent<ProviderProps> = ({
    reducer,
    initialState,
    children,
  }) => {
    // full control over reduce and initial state data inside our app
    const [state, dispatch] = useReducer<Reducer>(reducer, initialState)
  
    return (
      // nice trick to let reducer available in any component
      <UserContext.Provider value={[state, dispatch]}>
        {children}
      </UserContext.Provider>
    )
  }
  
  // A custom hook to access our minimalistic state management in any component with less amount of code
  export const useUser = (): any => useContext(UserContext)
  
  export default {
    initialState: {
      nickname: undefined,
      io: SocketIo(process.env.REACT_APP_HOSTNAME as string),
      gameType: undefined
    },
    /**
     * @description designing the user state shape
     * @param state current data
     * @param action action to handle
     */
    reducer(state: State, action: Action): State {
      switch (action.type) {
        case 'UPDATE_USERNAME':
          return {
            ...state,
            nickname: action?.payload?.nickname,
          }
        case 'UPDATE_GAMETYPE':
          return {
            ...state,
            gameType: action?.payload?.gameType,
          }
        default:
          return state
      }
    },
  }