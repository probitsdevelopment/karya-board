import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import rootReducer from './reducers/rootReducer';

//Don't use this in production
const enhancer = composeWithDevTools(applyMiddleware(thunk));

export const store = createStore(rootReducer, enhancer as any);

export type AppDispatch = typeof store.dispatch;
export type { RootState } from './reducers/rootReducer';
