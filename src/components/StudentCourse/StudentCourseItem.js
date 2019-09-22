import React, { useContext, useState, useEffect } from 'react';
import {connect} from "react-redux";
import {Preloader} from "../../components/UI/preloader";
import siteSettingsContext from "../../context/siteSettingsContext";
import { Link } from 'react-router-dom';
import {downloadDoc} from "../../redux/actions/libraryActions";
import {fetchModulesLessons} from "../../redux/actions/coursesActions";

function StudentCourseItem({allCoursesList, modulesLessons, modulesLessonsLoading, usersList, params, fetchTextbook, textbook, downloadDoc, libraryLoading, fetchModulesLessons}) {
    const { translate, lang } = useContext(siteSettingsContext);
    const [ currentCourse, setCurrentCourse ] = useState(null);
    let currentTeacher = null;

    useEffect(() => {
        if ( allCoursesList ) {
            const selectedSubject = allCoursesList.find(subject => subject.id === params.subjectID);
            const selectedCourse = selectedSubject.coursesList.find(course => course.id === params.courseID);

            setCurrentCourse({
                subject: selectedSubject,
                course: selectedCourse
            });

        }
    }, [allCoursesList, params.courseID, params.subjectID]);

    useEffect(() => {
        if ( currentCourse ) {
            if ( currentCourse.course.textbook ) {
                fetchTextbook(currentCourse.course.textbook);
            }

            fetchModulesLessons(currentCourse.subject.id, currentCourse.course.id);
        }
    }, [currentCourse]);

    return (
        <div className="studentCourse">
            <div className="content__title-holder">
                <h2 className="content__title">
                    <i className="content_title-icon fa fa-book" />
                    {
                        currentCourse ?
                            <>
                                <div className="content__title-subtitle">
                                    {
                                        currentCourse.subject.name[lang] ?
                                            currentCourse.subject.name[lang]
                                            :
                                            currentCourse.subject.name['ua']
                                    }
                                </div>
                                {
                                    currentCourse.course.name[lang] ?
                                        currentCourse.course.name[lang]
                                        :
                                        currentCourse.course.name['ua']
                                }
                            </>
                            :
                            translate('course')
                    }
                </h2>
            </div>
            {
                !currentCourse || !usersList ?
                    <Preloader/>
                    :
                    <div className="grid">
                        <div className="grid_col col-6 block">
                            { _renderTeacher() }
                        </div>
                        <div className="grid_col col-6 block">
                            { _renderTextbook() }
                        </div>
                        <div className="grid_col col-12 block">
                            { _renderModules() }
                        </div>
                    </div>
            }
        </div>
    );

    function _renderModules() {
        return (
            <div className="studentCourse__modules">
                <h2 className="block__heading">{ translate('lessons') }</h2>
                {
                    !modulesLessons || modulesLessonsLoading ?
                        <Preloader/>
                        :
                        modulesLessons.length ?
                            modulesLessons.sort((a, b) => a.index - b.index).map(module => _renderModule(module))
                            :
                            <div className="studentCourse__modules-notFound">
                                { translate('no_lessons') }
                            </div>
                }
            </div>
        )
    }

    function _renderModule(module) {
        return (
            <div className="studentCourse__modules-item" key={module.id}>
                <div className="studentCourse__module-name">
                    {
                        module.name[lang] ?
                            module.name[lang]
                            :
                            module.name['ua']
                    }
                </div>
                <div className="studentCourse__module-lessons">
                    {
                        module.lessons.length ?
                            module.lessons.sort((a, b) => a.id - b.id).map(lesson  => _renderLesson(module.id, lesson))
                            :
                            <div className="studentCourse__module-lessons-notFound">
                                { translate('no_lessons') }
                            </div>
                    }
                </div>
            </div>
        )
    }

    function _renderLesson(moduleID, lesson) {
        return (
            <div className="studentCourse__module-lessons-item" key={lesson.id}>
                <div className="studentCourse__module-lessons-icon">
                    <i className="fa fa-paragraph" />
                </div>
                <Link to={'/courses/' + params.subjectID + '/' + params.courseID + '/' + moduleID + '/' + lesson.id}>
                    <span className="studentCourse__module-lesson-name">
                        {
                            lesson.name[lang] ?
                                lesson.name[lang]
                                :
                                lesson.name['ua']
                        }
                    </span>
                </Link>
            </div>
        )
    }

    function _renderTeacher() {
        return (
            <>
                <h2 className="block__heading">{ translate('teacher') }</h2>
                <div className="studentCourse__teacher">
                    <div className="studentCourse__teacher-avatar" style={{backgroundImage: 'url(' + getTeacher().avatar + ')'}}>
                        {
                            !getTeacher().avatar ?
                                <i className="fa fa-user"/>
                                :
                                null
                        }
                    </div>
                    <div className="studentCourse__teacher-name">
                        <Link to={'/user/' + getTeacher().login}>
                            {
                                getTeacher().name
                            }
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    function _renderTextbook() {
        return (
            <>
                <h2 className="block__heading">{ translate('textbook') }</h2>
                <div className="studentCourse__textbook">
                    {
                        textbook ?
                            <div className="studentCourse__textbook-item">
                                <div className="studentCourse__textbook-icon">
                                    <i className="fa fa-book" />
                                </div>
                                <a href="/" onClick={e => downloadTextbook(e)}>
                                    { textbook.name }
                                </a>
                                {
                                    libraryLoading ?
                                        <Preloader size={30}/>
                                        :
                                        null
                                }
                            </div>
                            :
                            <div className="studentCourse__textbook-notFound">
                                <div className="studentCourse__textbook-icon">
                                    <i className="fa fa-unlink" />
                                </div>
                                { translate('no_textbook') }
                            </div>
                    }
                </div>
            </>
        )
    }

    function downloadTextbook(e) {
        e.preventDefault();

        downloadDoc(textbook.ref);
    }

    function getTeacher() {
        currentTeacher = currentTeacher || usersList.find(teacher => teacher.status === 'active' && teacher.role === 'teacher' && teacher.id === currentCourse.course.teacher);

        return currentTeacher;
    }
}

const mapStateToProps = state => ({
    modulesLessons: state.coursesReducer.modulesLessons,
    modulesLessonsLoading: state.coursesReducer.loading,
    libraryLoading: state.libraryReducer.loading
});

const mapDispatchToProps = dispatch => ({
    downloadDoc: ref => dispatch(downloadDoc(ref)),
    fetchModulesLessons: (subjectID, courseID) => dispatch(fetchModulesLessons(subjectID, courseID))
});
export default connect(mapStateToProps, mapDispatchToProps)(StudentCourseItem);
