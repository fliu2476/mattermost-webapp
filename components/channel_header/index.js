// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';

import {
    favoriteChannel,
    unfavoriteChannel,
    updateChannelNotifyProps,
} from 'mattermost-redux/actions/channels';
import {getCustomEmojisInText} from 'mattermost-redux/actions/emojis';
import {General} from 'mattermost-redux/constants';
import {
    getCurrentChannel,
    getMyCurrentChannelMembership,
    isCurrentChannelFavorite,
    isCurrentChannelMuted,
    getCurrentChannelStats,
} from 'mattermost-redux/selectors/entities/channels';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentRelativeTeamUrl, getCurrentTeamId, getMyTeams} from 'mattermost-redux/selectors/entities/teams';
import {
    getCurrentUser,
    getUser,
    makeGetProfilesInChannel,
} from 'mattermost-redux/selectors/entities/users';
import {getUserIdFromChannelName} from 'mattermost-redux/utils/channel_utils';

import {goToLastViewedChannel} from 'actions/views/channel';
import {openModal, closeModal} from 'actions/views/modals';
import {
    showFlaggedPosts,
    showPinnedPosts,
    showChannelFiles,
    showMentions,
    closeRightHandSide,
} from 'actions/views/rhs';
import {makeGetCustomStatus, isCustomStatusEnabled, isCustomStatusExpired} from 'selectors/views/custom_status';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {isModalOpen} from 'selectors/views/modals';
import {getAnnouncementBarCount} from 'selectors/views/announcement_bar';
import {ModalIdentifiers} from 'utils/constants';
import {isFileAttachmentsEnabled} from 'utils/file_utils';

import ChannelHeader from './channel_header';

const EMPTY_CHANNEL = {};
const EMPTY_CHANNEL_STATS = {member_count: 0, guest_count: 0, pinnedpost_count: 0, files_count: 0};

function makeMapStateToProps() {
    const doGetProfilesInChannel = makeGetProfilesInChannel();
    const getCustomStatus = makeGetCustomStatus();

    return function mapStateToProps(state) {
        const channel = getCurrentChannel(state) || EMPTY_CHANNEL;
        const user = getCurrentUser(state);
        const teams = getMyTeams(state);
        const hasMoreThanOneTeam = teams.length > 1;
        const config = getConfig(state);

        let dmUser;
        let gmMembers;
        let customStatus;
        if (channel && channel.type === General.DM_CHANNEL) {
            const dmUserId = getUserIdFromChannelName(user.id, channel.name);
            dmUser = getUser(state, dmUserId);
            customStatus = dmUser && getCustomStatus(state, dmUser.id);
        } else if (channel && channel.type === General.GM_CHANNEL) {
            gmMembers = doGetProfilesInChannel(state, channel.id);
        }
        const stats = getCurrentChannelStats(state) || EMPTY_CHANNEL_STATS;

        return {
            teamId: getCurrentTeamId(state),
            channel,
            channelMember: getMyCurrentChannelMembership(state),
            currentUser: user,
            dmUser,
            gmMembers,
            rhsState: getRhsState(state),
            rhsOpen: getIsRhsOpen(state),
            isFavorite: isCurrentChannelFavorite(state),
            isReadOnly: false,
            isMuted: isCurrentChannelMuted(state),
            isQuickSwitcherOpen: isModalOpen(state, ModalIdentifiers.QUICK_SWITCH),
            hasGuests: stats.guest_count > 0,
            pinnedPostsCount: stats.pinnedpost_count,
            hasMoreThanOneTeam,
            teammateNameDisplaySetting: getTeammateNameDisplaySetting(state),
            currentRelativeTeamUrl: getCurrentRelativeTeamUrl(state),
            announcementBarCount: getAnnouncementBarCount(state),
            customStatus,
            isCustomStatusEnabled: isCustomStatusEnabled(state),
            isCustomStatusExpired: isCustomStatusExpired(state, customStatus),
            isFileAttachmentsEnabled: isFileAttachmentsEnabled(config),
        };
    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({
        favoriteChannel,
        unfavoriteChannel,
        showFlaggedPosts,
        showPinnedPosts,
        showChannelFiles,
        showMentions,
        closeRightHandSide,
        getCustomEmojisInText,
        updateChannelNotifyProps,
        goToLastViewedChannel,
        openModal,
        closeModal,
    }, dispatch),
});

export default withRouter(connect(makeMapStateToProps, mapDispatchToProps)(ChannelHeader));
