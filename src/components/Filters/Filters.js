import React, { useContext } from 'react';
import './filters.scss';
import siteSettingsContext from "../../context/siteSettingsContext";
import classNames from 'classnames';

const FiltersSearchQuery = React.lazy(() => import('./FiltersSearchQuery'));
const FiltersSortBy = React.lazy(() => import('./FiltersSortBy'));
const FiltersFilterBy = React.lazy(() => import('./FiltersFilterBy'));
const FiltersShowPerPage = React.lazy(() => import('./FiltersShowPerPage'));

export default function Filters({searchQuery, sortBy, filterBy, showPerPage, filterChanged}) {
    const { translate } = useContext(siteSettingsContext);

    return (
        <div className="filters">
            <div className={classNames('filters__body', { filters__single: getFiltersSingle() })}>
                <h2 className="filters__heading">{ translate('filters') }:</h2>
                <div className="filters__inner">
                    {
                        typeof searchQuery !== 'undefined' ?
                            <div className="filters__item filters__searchQuery">
                                <FiltersSearchQuery searchQuery={searchQuery} filterChanged={filterChanged}/>
                            </div>
                            :
                            null
                    }
                    {
                        typeof filterBy !== 'undefined' ?
                            <div className="filters__item filters__filterBy">
                                <FiltersFilterBy filterBy={filterBy} filterChanged={filterChanged}/>
                            </div>
                            :
                            null
                    }
                    {
                        typeof showPerPage !== 'undefined' ?
                            <div className="filters__item filters__showPerPage">
                                <FiltersShowPerPage showPerPage={showPerPage} filterChanged={filterChanged}/>
                            </div>
                            :
                            null
                    }
                    {
                        typeof sortBy !== 'undefined' ?
                            <div className="filters__item filters__sortBy">
                                <FiltersSortBy sortBy={sortBy} filterChanged={filterChanged}/>
                            </div>
                            :
                            null
                    }
                </div>
            </div>
        </div>
    );

    function getFiltersSingle() {
        return [searchQuery, sortBy, filterBy].filter(item => typeof item !== 'undefined').length === 1;
    }
}