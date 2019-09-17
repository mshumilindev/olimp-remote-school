import React, { useContext, useEffect, useState } from 'react';
import siteSettingsContext from "../../../context/siteSettingsContext";
import {Link} from "react-router-dom";
import {deleteCourse, fetchModules} from "../../../redux/actions/coursesActions";
import {connect} from "react-redux";
import AdminCoursesModule from '../AdminCoursesModule/AdminCoursesModule';
import classNames from "classnames";
import UpdateCourse from "../AdminCoursesActions/UpdateCourse";
import UpdateModule from "../AdminCoursesActions/UpdateModule";

const ContextMenu = React.lazy(() => import('../../UI/ContextMenu/ContextMenu'));
const Confirm = React.lazy(() => import('../../UI/Confirm/Confirm'));

function AdminCoursesCourse({subjectID, course, params, loading, fetchModules, deleteCourse}) {
    const { lang, translate } = useContext(siteSettingsContext);
    const [ showUpdateCourse, setShowUpdateCourse ] = useState(false);
    const [ showUpdateModule, setShowUpdateModule ] = useState(false);
    const [ showConfirm, setShowConfirm ] = useState(false);
    const contextLinks = [
        {
            name: translate('create_module'),
            icon: 'fa fa-plus',
            action: handleCreateModule,
            id: 0
        },
        {
            type: 'divider',
            id: 1
        },
        {
            name: translate('edit_course'),
            icon: 'fa fa-pencil-alt',
            action: handleEditCourse,
            id: 2
        },
        {
            name: translate('delete_course'),
            icon: 'fa fa-trash-alt',
            type: 'error',
            action: handleDeleteCourse,
            id: 3
        }
    ];

    useEffect(() => {
        if ( checkIfIsOpen() && !course.modules ) {
            fetchModules(params.subjectID, course.id);
        }
    });

    return (
        <div className={classNames('adminCourses__list-item', {someOpen: params && params.courseID && params.courseID !== course.id, isOpen: params && !params.moduleID && params.courseID === course.id})} style={{marginTop: 10}}>
            <ContextMenu links={contextLinks}>
                <Link to={'/admin-courses/' + params.subjectID + '/' + course.id} className="adminCourses__list-courses-link">
                    {
                        checkIfIsOpen() ?
                            loading ?
                                <i className="content_title-icon fas fa-spinner" />
                                :
                                <i className="content_title-icon fa fa-graduation-cap isOpen" />
                            :
                            <i className="content_title-icon fa fa-graduation-cap" />
                    }
                    { course.name[lang] ? course.name[lang] : course.name['ua'] }
                </Link>
            </ContextMenu>
            {
                params && params.courseID === course.id ?
                    <div className="adminCourses__list-courses" style={{marginTop: -10}}>
                        {
                            course.modules && course.modules.length ?
                                sortModules().map(item => <AdminCoursesModule subjectID={subjectID} courseID={course.id} module={item} key={item.index} params={params} loading={loading} />)
                                :
                                <div className="adminCourses__list-item adminCourses__list-item-nothingFound" style={{marginTop: 10}}>
                                    <i className="content_title-icon fa fa-unlink" />
                                    { translate('nothing_found') }
                                </div>
                        }
                    </div>
                    :
                    null
            }
            {
                showUpdateCourse ?
                    <UpdateCourse params={params} subjectID={subjectID} course={course} loading={loading} setShowUpdateCourse={setShowUpdateCourse}/>
                    :
                    null
            }
            {
                showUpdateModule ?
                    <UpdateModule params={params} subjectID={subjectID} courseID={course.id} module={null} loading={loading} setShowUpdateModule={setShowUpdateModule}/>
                    :
                    null
            }
            {
                showConfirm ?
                    <Confirm message={translate('sure_to_delete_course')} cancelAction={() => setShowConfirm(false)} confirmAction={() => deleteCourse(subjectID, course.id)} />
                    :
                    null
            }
        </div>
    );

    function checkIfIsOpen() {
        return params && params.courseID === course.id;
    }

    function handleCreateModule() {
        setShowUpdateModule(true);
    }

    function handleEditCourse() {
        setShowUpdateCourse(true);
    }

    function handleDeleteCourse() {
        setShowConfirm(true);
    }

    function sortModules() {
        return course.modules.sort((a, b) => {
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
const mapDispatchToProps = dispatch => ({
    fetchModules: (subjectID, courseID) => dispatch(fetchModules(subjectID, courseID)),
    deleteCourse: (subjectID, courseID) => dispatch(deleteCourse(subjectID, courseID))
});
export default connect(null, mapDispatchToProps)(AdminCoursesCourse);