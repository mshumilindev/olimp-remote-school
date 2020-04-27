import React, { useContext, useEffect, useState } from 'react';
import siteSettingsContext from "../../../context/siteSettingsContext";
import {Link} from "react-router-dom";
import {deleteModule, fetchLessons, updateLessonsOrder} from "../../../redux/actions/coursesActions";
import {connect} from "react-redux";
import classNames from "classnames";
import AdminCoursesLesson from '../AdminCoursesLesson/AdminCoursesLesson';
import UpdateModule from "../AdminCoursesActions/UpdateModule";
import UpdateLesson from "../AdminCoursesActions/UpdateLesson";
import {sortableContainer, sortableElement, arrayMove } from 'react-sortable-hoc';
import Preloader from "../../UI/preloader";
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

const ContextMenu = React.lazy(() => import('../../UI/ContextMenu/ContextMenu'));
const Confirm = React.lazy(() => import('../../UI/Confirm/Confirm'));

const SortableContainer = sortableContainer(({children}) => children);
const SortableItem = sortableElement(({value}) => value);

function AdminCoursesModule({location, subjectID, courseID, module, params, loading, fetchLessons, deleteModule, updateLessonsOrder, lessonsList}) {
    const { lang, translate } = useContext(siteSettingsContext);
    const [ showUpdateModule, setShowUpdateModule ] = useState(false);
    const [ showConfirm, setShowConfirm ] = useState(false);
    const [ showUpdateLesson, setShowUpdateLesson ] = useState(false);
    const [ editOrder, setEditOrder ] = useState(false);
    const [ newOrder, setNewOrder ] = useState(null);
    const [ orderLoading, setOrderLoading ] = useState(false);
    const contextLinks = [
        {
            name: translate('create_lesson'),
            icon: 'fa fa-plus',
            action: handleCreateLesson,
            id: 0
        },
        {
            type: 'divider',
            id: 1
        },
        {
            name: translate('edit_module'),
            icon: 'fa fa-pencil-alt',
            action: handleEditModule,
            id: 2
        },
        {
            name: translate('delete_module'),
            icon: 'fa fa-trash-alt',
            type: 'error',
            action: handleDeleteModule,
            id: 3
        }
    ];

    useEffect(() => {
        if ( editOrder ) {
            setNewOrder(Object.assign([], sortLessons().map(item => item.index)));
        }
        else {
            if ( newOrder ) {
                const lessonsToUpdate = [];

                newOrder.forEach((newItem, index) => {
                    lessonsToUpdate.push({
                        id: sortLessons()[newItem].id,
                        index: index
                    });
                });

                updateLessonsOrder(subjectID, courseID, module.id, lessonsToUpdate);
                setNewOrder(null);
            }
        }
    }, [editOrder]);

    useEffect(() => {
        if ( checkIfIsOpen() ) {
            fetchLessons(params.subjectID, params.courseID, module.id);
        }
    }, [location]);

    return (
        <div className={classNames('adminCourses__list-item', {someOpen: params && params.moduleID && params.moduleID !== module.id, isOpen: params && params.moduleID === module.id})} style={{marginTop: 10}}>
            <ContextMenu links={contextLinks}>
                <Link to={'/admin-courses/' + params.subjectID + '/' + params.courseID + '/' + module.id} className="adminCourses__list-courses-link">
                    {
                        checkIfIsOpen() ?
                            loading ?
                                <i className="content_title-icon fas fa-spinner" />
                                :
                                <i className="content_title-icon fa fa-book-open" />
                            :
                            <i className="content_title-icon fa fa-book" />
                    }
                    { module.name[lang] ? module.name[lang] : module.name['ua'] }
                </Link>
            </ContextMenu>
            {
                params && params.moduleID === module.id ?
                    editOrder ?
                        <SortableContainer onSortEnd={onSortEnd}>
                            { _renderLessonsList() }
                        </SortableContainer>
                        :
                         _renderLessonsList()
                    :
                    null
            }
            {
                showUpdateModule ?
                    <UpdateModule params={params} subjectID={subjectID} courseID={courseID} module={module} loading={loading} setShowUpdateModule={setShowUpdateModule}/>
                    :
                    null
            }
            {
                showUpdateLesson ?
                    <UpdateLesson params={params} subjectID={subjectID} courseID={courseID} moduleID={module.id} lesson={null} loading={loading} setShowUpdateLesson={setShowUpdateLesson}/>
                    :
                    null
            }
            {
                showConfirm ?
                    <Confirm message={translate('sure_to_delete_module')} cancelAction={() => setShowConfirm(false)} confirmAction={() => deleteModule(subjectID, courseID, module.id)} />
                    :
                    null
            }
        </div>
    );

    function _renderLessonsList() {
        return (
            <div className="adminCourses__list-courses" style={{marginTop: -10}}>
                {
                    lessonsList && lessonsList.length > 1 ?
                        <span className="editSorting" onClick={handleSetEditOrder}>
                            {
                                editOrder ?
                                    <i className="content_title-icon fas fa-save"/>
                                    :
                                    <i className="content_title-icon fa fa-pencil-alt"/>
                            }
                            { translate('edit_lessons_order') }
                        </span>
                        :
                        null
                }
                {
                    lessonsList && lessonsList.length ?
                        sortLessons().map((item, index) => _renderLesson(item, index))
                        :
                        <div className="adminCourses__list-item adminCourses__list-item-nothingFound" style={{marginTop: 10}}>
                            <i className="content_title-icon fa fa-unlink" />
                            { translate('no_lessons') }
                        </div>
                }
                {
                    orderLoading ?
                        <Preloader/>
                        :
                        null
                }
            </div>
        );
    }

    function _renderLesson(item, index) {
        if ( item ) {
            if ( editOrder ) {
                return (
                    <SortableItem key={item.index} index={index} value={<AdminCoursesLesson lesson={item} params={params} subjectID={subjectID} courseID={courseID} moduleID={module.id} editOrder={editOrder} />}/>
                );
            }
            else {
                return (
                    <AdminCoursesLesson lesson={item} params={params} subjectID={subjectID} courseID={courseID} moduleID={module.id} editOrder={editOrder} />
                );
            }
        }
    }

    function handleSetEditOrder() {
        if ( editOrder ) {
            setOrderLoading(true);
            setTimeout(() => {
                setOrderLoading(false);
            }, 1000);
        }
        setEditOrder(!editOrder);
    }

    function onSortEnd({oldIndex, newIndex}) {
        setNewOrder(arrayMove(newOrder, oldIndex, newIndex));
    }

    function handleCreateLesson() {
        setShowUpdateLesson(true);
    }

    function handleEditModule() {
        setShowUpdateModule(true);
    }

    function handleDeleteModule() {
        setShowConfirm(true);
    }

    function checkIfIsOpen() {
        return params && params.moduleID === module.id;
    }

    function sortLessons() {
        if ( newOrder && editOrder ) {
            return newOrder.map(newItem => lessonsList[newItem]);
        }
        else {
            return lessonsList.sort((a, b) => {
                if ( a.index < b.index ) {
                    return -1;
                }
                if ( a.index > b.index ) {
                    return 1;
                }
                return 0;
            });
        }
    }
}
const mapStateToProps = state => {
    return {
        lessonsList: state.coursesReducer.lessonsList
    }
};

const mapDispatchToProps = dispatch => ({
    fetchLessons: (subjectID, courseID, moduleID) => dispatch(fetchLessons(subjectID, courseID, moduleID)),
    deleteModule: (subjectID, courseID, moduleID) => dispatch(deleteModule(subjectID, courseID, moduleID)),
    updateLessonsOrder: (subjectID, courseID, moduleID, orderedLessons) => dispatch(updateLessonsOrder(subjectID, courseID, moduleID, orderedLessons))
});
export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter)(AdminCoursesModule);