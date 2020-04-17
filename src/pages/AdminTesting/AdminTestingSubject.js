import React, {useContext} from 'react';
import {orderBy} from "natural-orderby";
import siteSettingsContext from "../../context/siteSettingsContext";
import userContext from "../../context/userContext";
import AdminTestingCourse from "./AdminTestingCourse";

export default function AdminTestingSubject({subjectItem, tests}) {
    const { lang } = useContext(siteSettingsContext);
    const { user } = useContext(userContext);

    return (
        <div className="adminTesting__subject widget">
            <div className="widget__title">
                <i className="content_title-icon fa fa-folder-open" />
                { subjectItem.name[lang] ? subjectItem.name[lang] : subjectItem.name['ua'] }
            </div>
            {
                filterCourses().length ?
                    <div className="adminTesting__coursesList">
                        { orderBy(filterCourses(), v => v.name[lang] ? v.name[lang] : v.name['ua']).filter(courseItem => courseItem.teacher === user.id).map(courseItem => <AdminTestingCourse course={courseItem} tests={tests} subjectID={subjectItem.id} key={courseItem.id}/>) }
                    </div>
                    :
                    null
            }
        </div>
    );

    function filterCourses() {
        return subjectItem.coursesList.filter(courseItem => tests.some(testItem => testItem.lesson.subjectID === subjectItem.id && testItem.lesson.courseID === courseItem.id));
    }
}