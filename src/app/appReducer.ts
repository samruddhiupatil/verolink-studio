import { MAX_HISTORY_ENTRIES } from '../domain/history.types'
import type { AppAction } from './appActions'
import type { RootState } from './appState.types'

export function appReducer(state: RootState, action: AppAction): RootState {
  switch (action.type) {
    case 'UPDATE_CONNECTOR':
      return { ...state, connector: { ...state.connector, ...action.payload } }

    case 'SET_CONNECTION_HEALTH':
      return { ...state, connector: { ...state.connector, lastHealthCheck: action.payload } }

    case 'SET_AUTH':
      return { ...state, auth: action.payload }

    case 'ADD_ENDPOINT':
      return { ...state, endpoints: [...state.endpoints, action.payload] }

    case 'UPDATE_ENDPOINT':
      return {
        ...state,
        endpoints: state.endpoints.map((endpoint) => (endpoint.id === action.payload.id ? action.payload : endpoint)),
      }

    case 'DELETE_ENDPOINT':
      return { ...state, endpoints: state.endpoints.filter((endpoint) => endpoint.id !== action.payload.id) }

    case 'SET_LAST_TEST_RESPONSE':
      return { ...state, lastTestResponse: action.payload }

    case 'APPEND_HISTORY_ENTRY':
      return { ...state, history: [action.payload, ...state.history].slice(0, MAX_HISTORY_ENTRIES) }

    case 'SET_FIELD_MAPPINGS':
      return { ...state, fieldMappings: action.payload }

    case 'SET_OUTBOUND_FIELDS':
      return { ...state, outbound: { ...state.outbound, fields: action.payload } }

    case 'SET_OUTBOUND_MAPPINGS':
      return { ...state, outbound: { ...state.outbound, mappings: action.payload } }

    case 'SET_OUTBOUND_TARGET_ENDPOINT':
      return { ...state, outbound: { ...state.outbound, targetEndpointId: action.payload } }

    case 'SET_VIEW_MODE':
      return { ...state, ui: { ...state.ui, viewMode: action.payload } }
  }
}
