import firebase from "../../db/firestore";

const db = firebase.firestore();

const storage = firebase.storage();
const storageRef = storage.ref();

export const FETCH_LIBRARY_BEGIN = 'FETCH_LIBRARY_BEGIN';
export const FETCH_LIBRARY_SUCCESS = 'FETCH_LIBRARY_SUCCESS';

export function fetchLibrary(userID) {
    let libraryCollection = db.collection('library');
    let unsubscribe = null;

    return dispatch => {
        dispatch(fetchLibraryBegin());

        if ( unsubscribe ) {
            unsubscribe();
        }

        unsubscribe = libraryCollection.onSnapshot(snapshot => {
            const libraryList = [];

            snapshot.docs.forEach(doc => {
                libraryList.push({
                    ...doc.data(),
                    id: doc.id
                });
            });
            dispatch(fetchLibrarySuccess(libraryList));
        });
    }
}

export function fetchLibraryBooks() {
    const listRef = storageRef.child('library');

    return dispatch => {
      dispatch(fetchLibraryBooksBegin());
      let libraryList = [];

      listRef.listAll().then((data) => {
        let arr = [];
        let arrMetadata = [];
        data.items.forEach((item) => {
          arr.push(item.getDownloadURL());
          arrMetadata.push(item.getMetadata())
        });
        Promise.all(arr).then((data) => {
          Promise.all(arrMetadata).then((metadata) => {
            console.log(metadata)
            libraryList = data.map((item, index) => {
              return {
                url: item,
                metadata: {
                  name: metadata[index].name,
                  customMetadata: metadata[index].customMetadata,
                }
              }
            });
            dispatch(fetchLibraryBooksSuccess(libraryList));
          })
        })
        // updateMetadata()
      })
    }
}

export const FETCH_TEXTBOOK_BEGIN = 'FETCH_TEXTBOOK_BEGIN';
export const FETCH_TEXTBOOK_SUCCESS = 'FETCH_TEXTBOOK_SUCCESS';

export function fetchTextbook(textbookID) {
    const textbookRef = db.collection('library').doc((typeof textbookID === 'object' ? textbookID[0] : textbookID));

    return dispatch => {
        dispatch(fetchTextbookBegin());

        return textbookRef.get().then(snapshot => {
            dispatch(fetchTextbookSuccess({
                ...snapshot.data(),
                id: snapshot.id
            }));
        });
    }
}

export const fetchTextbookBegin = () => {
    return {
        type: FETCH_TEXTBOOK_BEGIN
    }
};
export const fetchTextbookSuccess = textbook => {
    return {
        type: FETCH_TEXTBOOK_SUCCESS,
        payload: { textbook }
    }
};

export const fetchLibraryBegin = () => {
    return {
        type: FETCH_LIBRARY_BEGIN
    }
};
export const fetchLibrarySuccess = libraryList => {
    return {
        type: FETCH_LIBRARY_SUCCESS,
        payload: { libraryList }
    }
};

export const fetchLibraryBooksBegin = () => {
    return {
        type: FETCH_LIBRARY_BOOKS_BEGIN
    }
};
export const fetchLibraryBooksSuccess = booksList => {
    return {
        type: FETCH_LIBRARY_BOOKS_SUCCESS,
        payload: { booksList }
    }
};

export const FETCH_LIBRARY_BOOKS_BEGIN = 'FETCH_LIBRARY_BOOKS_BEGIN';
export const FETCH_LIBRARY_BOOKS_SUCCESS = 'FETCH_LIBRARY_BOOKS_SUCCESS';

export const DELETE_DOC_BEGIN = 'DELETE_DOC_BEGIN';

export function deleteDoc(docID, docRef) {
    const documentRef = storageRef.child('library/' + docRef);
    const documentDoc = db.collection('library').doc(docID);

    return dispatch => {
        dispatch(deleteDocBegin());
        documentRef.delete().then(() => {
            return documentDoc.delete();
        }).catch(err => {
            return documentDoc.delete();
        });
    };
}

export const deleteDocBegin = () => {
    return {
        type: DELETE_DOC_BEGIN
    }
};

export const UPLOAD_DOC_BEGIN = 'UPLOAD_DOC_BEGIN';

export function uploadDoc(newFile, file, id) {
    const documentRef = storageRef.child('library/' + file.name);
    const documentDoc = db.collection('library').doc(id);

    return dispatch => {
        dispatch(uploadDocBegin());
        return documentRef.put(file).then((snapshot) => {
            return documentDoc.set({...newFile, ref: file.name});
        });
    };
}

export const uploadDocBegin = () => {
    return {
        type: UPLOAD_DOC_BEGIN
    }
};

export const UPDATE_DOC_BEGIN = 'UPDATE_DOC_BEGIN';

export function updateDoc(newFile, id) {
    const documentDoc = db.collection('library').doc(id);
    const teacherArray = Array.isArray(newFile.teacher) ? newFile.teacher : [newFile.teacher];

    return dispatch => {
        dispatch(updateDocBegin());
        return documentDoc.update({...newFile, teacher: teacherArray});
    };
}

export const updateDocBegin = () => {
    return {
        type: UPDATE_DOC_BEGIN
    }
};

export const DOWNLOAD_DOC_BEGIN = 'DOWNLOAD_DOC_BEGIN';
export const DOWNLOAD_DOC_SUCCESS = 'DOWNLOAD_DOC_SUCCESS';

export function downloadDoc(ref, isNew) {
    return dispatch => {
        dispatch(downloadDocBegin());
        storageRef.child('library/' + ref).getDownloadURL().then((url) => {
            if ( ref.includes('.pdf') && !isNew ) {
                dispatch(downloadDocSuccess(url));
            }
            else {
                const a = window.document.createElement("a");
                a.target = '_blank';
                a.href = url;

                const e = window.document.createEvent("MouseEvents");
                e.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(e);
                dispatch(downloadDocSuccess());
            }
        });
    }
}

export function discardDoc() {
    return dispatch => {
        dispatch(discardDocSuccess())
    }
}

export const downloadDocBegin = () => {
    return {
        type: DOWNLOAD_DOC_BEGIN
    }
};

export const downloadDocSuccess = downloadedTextbook => {
    return {
        type: DOWNLOAD_DOC_SUCCESS,
        payload: { downloadedTextbook }
    }
};

export const discardDocSuccess = () => {
    return {
        type: DISCARD_DOC_SUCCESS
    }
};

export const DISCARD_DOC_SUCCESS = 'DISCARD_DOC_SUCCESS';
