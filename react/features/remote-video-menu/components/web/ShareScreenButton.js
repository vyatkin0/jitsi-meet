import React, { Component } from 'react';
import {
    createRemoteVideoMenuButtonEvent,
    sendAnalytics
} from '../../../analytics';

import PropTypes from 'prop-types';
import RemoteVideoMenuButton from './RemoteVideoMenuButton';
import { translate } from '../../../base/i18n';

/**
 * Implements a React {@link Component} which displays a button for toggle remote screen sharing
 *
 * @extends Component
 */
class ShareScreenButton extends Component {
    /**
     * {@code ShareScreenButton} component's property types.
     *
     * @static
     */
    static propTypes = {

        /**
         * Callback to invoke when {@code ShareScreenButton} is clicked.
         */
        onClick: PropTypes.func,

        /**
         * The ID of the participant linked to the onClick callback.
         */
        participantID: PropTypes.string,

        /**
         * Screen is already shared
         */
        isShared: PropTypes.bool,
    };

    /**
     * Initializes a new {@code ShareScreenButton} instance.
     *
     * @param {Object} props - The read-only React Component props with which
     * the new instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once for every instance.
        this._onClick = this._onClick.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { participantID,
            isShared } = this.props;

        const classNames = isShared ? 'fa fa-stop' : 'icon-share-desktop';

        //const classNames = `icon-share-desktop ${
        //   _screensharing ? 'toggled' : ''} ${
        //    _desktopSharingEnabled ? '' : 'disabled'}`;

        const text = isShared ? 'Stop screen sharing' : 'Share screen';
        return (
            <RemoteVideoMenuButton
                buttonText = {text}
                iconClass = {classNames}
                id = { `ejectlink_${participantID}` }
                onClick = { this._onClick } />
        );
    }

    /**
     * Remove the participant with associated participantID from the conference.
     *
     * @private
     * @returns {void}
     */
    _onClick() {
        const { onClick, participantID } = this.props;

        sendAnalytics(createRemoteVideoMenuButtonEvent(
            'sharescreen.button',
            {
                'participant_id': participantID
            }));

        if (onClick) {
            onClick();
        }
    }
}

export default translate(ShareScreenButton);
