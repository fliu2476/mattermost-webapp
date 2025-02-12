// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';

import {getDisplayNameByUser} from 'utils/utils.jsx';

import {GlobalState} from 'types/store';

import PopoverListMembersItem, {Props} from './popover_list_members_item';

function mapStateToProps(state: GlobalState, ownProps: Props) {
    return {
        displayName: getDisplayNameByUser(state, ownProps.user),
    };
}

export default connect(mapStateToProps)(PopoverListMembersItem);
