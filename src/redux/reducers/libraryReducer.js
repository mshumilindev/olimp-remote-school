import { FETCH_LIBRARY_BEGIN, FETCH_LIBRARY_SUCCESS, DELETE_DOC_BEGIN, DELETE_DOC_SUCCESS, UPLOAD_DOC_BEGIN, UPLOAD_DOC_SUCCESS, UPDATE_DOC_BEGIN, UPDATE_DOC_SUCCESS, DOWNLOAD_DOC_BEGIN, DOWNLOAD_DOC_SUCCESS } from '../actions/libraryActions';

const initialState = {
    libraryList: [],
    loading: false
};

export default function usersReducer(state = initialState, action) {
    switch ( action.type ) {
        case FETCH_LIBRARY_BEGIN:
            return {
                ...state,
                loading: true
            };

        case FETCH_LIBRARY_SUCCESS:
            return {
                ...state,
                loading: false,
                libraryList: action.payload.libraryList
            };

        case DELETE_DOC_BEGIN:
            return {
                ...state,
                loading: true
            };

        case DELETE_DOC_SUCCESS:
            return {
                ...state,
                loading: false,
                libraryList: action.payload.libraryList
            };

        case UPLOAD_DOC_BEGIN:
            return {
                ...state,
                loading: true
            };

        case UPLOAD_DOC_SUCCESS:
            return {
                ...state,
                loading: false,
                libraryList: action.payload.libraryList
            };

        case UPDATE_DOC_BEGIN:
            return {
                ...state,
                loading: true
            };

        case UPDATE_DOC_SUCCESS:
            return {
                ...state,
                loading: false,
                libraryList: action.payload.libraryList
            };

        case DOWNLOAD_DOC_BEGIN:
            return {
                ...state,
                loading: true
            };

        case DOWNLOAD_DOC_SUCCESS:
            return {
                ...state,
                loading: false
            };

        default:
            return state;
    }
}