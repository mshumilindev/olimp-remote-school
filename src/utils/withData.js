import React, {useContext} from 'react';
import siteSettingsContext from "../context/siteSettingsContext";

const withData = WrappedComponent => {
    return props => {
        const { translate } = useContext(siteSettingsContext);

        return <WrappedComponent {...props} totalItems={props.loading ? null : _renderTotalItems()} />;

        function _renderTotalItems() {
            if ( !props.list ) {
                return null;
            }
            return (
                <div className="totalItems">
                    { translate('total') }:&nbsp;
                    { props.list.length }
                </div>
            );
        }
    };
};

export default withData;
