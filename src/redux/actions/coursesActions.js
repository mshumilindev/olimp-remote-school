import firebase from "../../db/firestore";

const db = firebase.firestore();
const coursesCollection = db.collection('courses');
const subjectsList = [];
let lesson = null;

export function fetchSubjects() {
    if ( !subjectsList.length ) {
        return dispatch => {
            dispatch(coursesBegin());

            return coursesCollection.get().then((snapshot) => {
                snapshot.docs.forEach(doc => {
                    subjectsList.push({
                        ...doc.data(),
                        id: doc.id
                    });
                });
                dispatch(coursesSuccess(subjectsList));
            });
        }
    }
    else {
        return dispatch => {
            dispatch(coursesSuccess(subjectsList))
        }
    }
}

export function fetchCoursesList(subjectID) {
    const courseListRef = db.collection('courses').doc(subjectID).collection('coursesList');

    return dispatch => {
        dispatch(coursesBegin());
        return courseListRef.get().then((snapshot) => {
            subjectsList.find(item => item.id === subjectID).coursesList = [];
            snapshot.docs.forEach(doc => {
                subjectsList.find(item => item.id === subjectID).coursesList.push({
                    ...doc.data(),
                    id: doc.id
                });
            });
            dispatch(coursesSuccess(subjectsList));
        });
    };
}

export function fetchModules(subjectID, courseID) {
    const modulesRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules');

    return dispatch => {
        dispatch(coursesBegin());
        return modulesRef.get().then((snapshot) => {
            subjectsList.find(item => item.id === subjectID).coursesList.find(item => item.id === courseID).modules = [];
            snapshot.docs.forEach(doc => {
                subjectsList.find(item => item.id === subjectID).coursesList.find(item => item.id === courseID).modules.push({
                    ...doc.data(),
                    id: doc.id
                });
            });
            dispatch(coursesSuccess(subjectsList));
        });
    };
}

export function fetchLessons(subjectID, courseID, moduleID) {
    const lessonsRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons');

    return dispatch => {
        dispatch(coursesBegin());
        return lessonsRef.get().then((snapshot) => {
            subjectsList
                .find(item => item.id === subjectID).coursesList
                .find(item => item.id === courseID).modules
                .find(item => item.id === moduleID).lessons = [];
            snapshot.docs.forEach(doc => {
                subjectsList
                    .find(item => item.id === subjectID).coursesList
                    .find(item => item.id === courseID).modules
                    .find(item => item.id === moduleID).lessons
                    .push({
                        ...doc.data(),
                        id: doc.id
                    });
            });
            dispatch(coursesSuccess(subjectsList));
        });
    };
}

export function updateSubject(subject) {
    const subjectRef = db.collection('courses').doc(subject.id);
    const subjectID = subject.id;

    delete subject.id;

    return dispatch => {
        dispatch(coursesBegin());
        return subjectRef.set({
            ...subject
        }).then(() => {
            if ( subjectsList.indexOf(subjectsList.find(item => item.id === subjectID)) !== -1 ) {
                subjectsList.splice(subjectsList.indexOf(subjectsList.find(item => item.id === subjectID)), 1);
            }
            subjectsList.push({
                ...subject,
                id: subjectID
            });
            dispatch(coursesSuccess(subjectsList.sort((a, b) => {
                if ( a.id < b.id ) {
                    return -1;
                }
                else if ( a.id > b.id ) {
                    return 1;
                }
                return 0;
            })));
        });
    };
}

export function deleteSubject(subjectID) {
    const subjectRef = db.collection('courses').doc(subjectID);

    return dispatch => {
        dispatch(coursesBegin());
        return subjectRef.delete().then(() => {
            subjectsList.splice(subjectsList.indexOf(subjectsList.find(item => item.id === subjectID)), 1);
            dispatch(coursesSuccess(subjectsList.sort((a, b) => {
                if ( a.id < b.id ) {
                    return -1;
                }
                else if ( a.id > b.id ) {
                    return 1;
                }
                return 0;
            })));
        });
    };
}

export function updateCourse(subjectID, course) {
    const courseRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(course.id);
    const courseID = course.id;

    delete course.id;

    return dispatch => {
        dispatch(coursesBegin());
        return courseRef.set({
            ...course
        }).then(() => {
            const foundSubject = subjectsList.find(item => item.id === subjectID);
            let foundCourse = null;

            if ( foundSubject.coursesList ) {
                foundCourse = foundSubject.coursesList.find(item => item.id === courseID);
            }

            if ( foundCourse ) {
                foundSubject.coursesList.splice(foundSubject.coursesList.indexOf(foundCourse), 1);
            }

            if ( foundSubject.coursesList ) {
                foundSubject.coursesList.push({
                    ...course,
                    id: courseID
                });
            }

            dispatch(coursesSuccess(subjectsList.sort((a, b) => {
                if ( a.id < b.id ) {
                    return -1;
                }
                else if ( a.id > b.id ) {
                    return 1;
                }
                return 0;
            })));
        });
    };
}

export function deleteCourse(subjectID, courseID) {
    const courseRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID);

    return dispatch => {
        dispatch(coursesBegin());
        return courseRef.delete().then(() => {
            const foundSubject = subjectsList.find(item => item.id === subjectID);
            foundSubject.coursesList.splice(foundSubject.coursesList.indexOf(foundSubject.coursesList.find(item => item.id === courseID)), 1);
            dispatch(coursesSuccess(subjectsList));
        });
    };
}

export function updateModule(subjectID, courseID, module) {
    const moduleRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(module.id);
    const moduleID = module.id;

    delete module.id;

    return dispatch => {
        dispatch(coursesBegin());
        return moduleRef.set({
            ...module
        }).then(() => {
            const foundSubject = subjectsList.find(item => item.id === subjectID);
            const foundCourse = foundSubject.coursesList.find(item => item.id === courseID);
            let foundModule = null;

            if ( foundCourse.modules ) {
                foundModule = foundCourse.modules.find(item => item.id === moduleID);
            }

            if ( foundModule ) {
                foundCourse.modules.splice(foundCourse.modules.indexOf(foundModule), 1);
            }

            if ( foundCourse.modules ) {
                foundCourse.modules.push({
                    ...module,
                    id: moduleID
                });
            }

            dispatch(coursesSuccess(subjectsList));
        });
    };
}

export function deleteModule(subjectID, courseID, moduleID) {
    const moduleRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID);

    return dispatch => {
        dispatch(coursesBegin());
        return moduleRef.delete().then(() => {
            const foundSubject = subjectsList.find(item => item.id === subjectID);
            const foundCourse = foundSubject.coursesList.find(item => item.id === courseID);

            foundCourse.modules.splice(foundCourse.modules.indexOf(foundCourse.modules.find(item => item.id === moduleID)), 1);
            dispatch(coursesSuccess(subjectsList));
        });
    };
}

export function updateLesson(subjectID, courseID, moduleID, newLesson, updateTree) {
    const lessonRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(newLesson.id);
    const contentRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(newLesson.id).collection('content');
    const questionsRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(newLesson.id).collection('questions');
    const lessonID = newLesson.id;
    const content = newLesson.content;
    const questions = newLesson.questions;
    let toDeleteI = 0;
    let toCreateI = 0;
    let toDeleteX = 0;
    let toCreateX = 0;

    delete newLesson.id;
    delete newLesson.content;
    delete newLesson.questions;

    return dispatch => {
        const handleContent = () => {
            contentRef.get().then(snapshot => {
                if ( snapshot.docs.length ) {
                    deleteDoc(snapshot);
                }
                else {
                    if ( content && content.length ) {
                        createDoc();
                    }
                    else {
                        handleQuestions();
                    }
                }
            });
        };

        const deleteDoc = snapshot => {
            const docRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(lessonID).collection('content').doc(snapshot.docs[toDeleteI].id);
            docRef.delete().then(() => {
                toDeleteI ++;
                if ( toDeleteI < snapshot.docs.length ) {
                    deleteDoc(snapshot);
                }
                else {
                    if ( content && content.length ) {
                        createDoc();
                    }
                    else {
                        handleQuestions();
                    }
                }
            });
        };

        const createDoc = () => {
            const block = content[toCreateI];
            const docRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(lessonID).collection('content').doc(block.id);

            delete block.id;

            docRef.set({
                ...block,
                order: toCreateI
            }).then(() => {
                toCreateI ++;
                if ( toCreateI < content.length ) {
                    createDoc();
                }
                else {
                    handleQuestions();
                }
            });
        };


        const handleQuestions = () => {
            questionsRef.get().then(snapshot => {
                if ( snapshot.docs.length ) {
                    deleteQuestion(snapshot);
                }
                else {
                    if ( questions && questions.length ) {
                        createQuestion();
                    }
                    else {
                        lesson = {
                            ...newLesson,
                            id: lessonID
                        };
                        dispatch(lessonSuccess(lesson));
                    }
                }
            });
        };

        const deleteQuestion = snapshot => {
            const docRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(lessonID).collection('questions').doc(snapshot.docs[toDeleteX].id);
            docRef.delete().then(() => {
                toDeleteX ++;
                if ( toDeleteX < snapshot.docs.length ) {
                    deleteQuestion(snapshot);
                }
                else {
                    if ( questions && questions.length ) {
                        createQuestion();
                    }
                    else {
                        lesson = {
                            ...newLesson,
                            id: lessonID
                        };
                        dispatch(lessonSuccess(lesson));
                    }
                }
            });
        };

        const createQuestion = () => {
            const block = questions[toCreateX];
            const docRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(lessonID).collection('questions').doc(block.id);

            delete block.id;

            docRef.set({
                ...block,
                order: toCreateX
            }).then(() => {
                toCreateX ++;
                if ( toCreateX < questions.length ) {
                    createQuestion();
                }
                else {
                    lesson = {
                        ...newLesson,
                        id: lessonID
                    };
                    dispatch(lessonSuccess(lesson));
                }
            });
        };

        dispatch(coursesBegin());

        return lessonRef.set({
            ...newLesson
        }).then(() => {
            handleContent();
            if ( updateTree ) {
                const lessonsRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons');

                dispatch(coursesBegin());
                return lessonsRef.get().then((snapshot) => {
                    subjectsList
                        .find(item => item.id === subjectID).coursesList
                        .find(item => item.id === courseID).modules
                        .find(item => item.id === moduleID).lessons = [];
                    snapshot.docs.forEach(doc => {
                        subjectsList
                            .find(item => item.id === subjectID).coursesList
                            .find(item => item.id === courseID).modules
                            .find(item => item.id === moduleID).lessons
                            .push({
                                ...doc.data(),
                                id: doc.id
                            });
                    });
                    dispatch(coursesSuccess(subjectsList));
                });
            }
        });
    };
}

export function deleteLesson(subjectID, courseID, moduleID, lessonID) {
    const lessonRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(lessonID);

    return dispatch => {
        dispatch(coursesBegin());
        return lessonRef.delete().then(() => {
            const foundSubject = subjectsList.find(item => item.id === subjectID);
            const foundCourse = foundSubject.coursesList.find(item => item.id === courseID);
            const foundModule = foundCourse.modules.find(item => item.id === moduleID);

            foundModule.lessons.splice(foundModule.lessons.indexOf(foundModule.lessons.find(item => item.id === lessonID)), 1);
            dispatch(coursesSuccess(subjectsList));
        });
    };
}

export function fetchLesson(subjectID, courseID, moduleID, lessonID) {
    const lessonRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(lessonID);
    const contentRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(lessonID).collection('content');
    const questionsRef = db.collection('courses').doc(subjectID).collection('coursesList').doc(courseID).collection('modules').doc(moduleID).collection('lessons').doc(lessonID).collection('questions');

    return dispatch => {
        dispatch(lessonBegin());
        return lessonRef.get().then(snapshot => {
            lesson = {
                ...snapshot.data(),
                id: snapshot.id
            };
            return contentRef.get().then(contentSnapshot => {
                const content = [];
                if ( contentSnapshot.docs.length ) {
                    contentSnapshot.docs.forEach(doc => {
                        content.push({
                            ...doc.data(),
                            id: doc.id
                        });
                    });
                }
                return questionsRef.get().then(questionsSnapshot => {
                    const questions = [];
                    if ( questionsSnapshot.docs.length ) {
                        questionsSnapshot.docs.forEach(doc => {
                            questions.push({
                                ...doc.data(),
                                id: doc.id
                            });
                        });
                    }
                    lesson.content = content.sort((a, b) => a.order - b.order);
                    lesson.questions = questions.sort((a, b) => a.order - b.order);
                    dispatch(lessonSuccess(lesson));
                });
            });
        });
    };
}

export const coursesBegin = () => {
    return {
        type: COURSES_BEGIN
    }
};
export const coursesSuccess = subjectsList => {
    return {
        type: COURSES_SUCCESS,
        payload: { subjectsList }
    }
};

export const lessonBegin = () => {
    return {
        type: LESSON_BEGIN
    }
};
export const lessonSuccess = lesson => {
    return {
        type: LESSON_SUCCESS,
        payload: { lesson }
    }
};

export const COURSES_BEGIN = 'COURSES_BEGIN';
export const COURSES_SUCCESS = 'COURSES_SUCCESS';
export const LESSON_BEGIN = 'LESSON_BEGIN';
export const LESSON_SUCCESS = 'LESSON_SUCCESS';