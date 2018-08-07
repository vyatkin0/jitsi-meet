/* @flow */

import EventEmitter from 'events';
import { getLogger } from 'jitsi-meet-logger';

import {
    JitsiConferenceEvents
} from '../../react/features/base/lib-jitsi-meet';

/**
 * The value for the "var" attribute of feature tag in disco-info packets.
 */
const DISCO_REMOTE_SCREEN_SHARING_FEATURE
    = 'http://jitsi.org/meet/remotescreensharing';

export const DISCO_REMOTE_SCREEN_SHARED_FEATURE
    = 'http://jitsi.org/meet/remotescreenshared';

export const EVENTS = {
    startScreenSharing: 'startScreenSharing'
};


/**
 * The type of remote screen sharing messages.
 */
const REMOTE_SCREEN_SHARING_MESSAGE_NAME = 'remote-screen-sharing';

const logger = getLogger(__filename);

declare var APP: Object;

/**
 * Send a message to remote participant to toggle screen sharing.
 * 
 * @param {string} remoteId - Id of a remote participant.
 * @param {string} screenId - Id of screen to share. If false user will be prompted to select a screen
 * @returns {void}
 */
export function toggleRemoteScreenSharing(remoteId, screenId) {
    try {
        APP.conference.sendEndpointMessage(remoteId, {
            name: REMOTE_SCREEN_SHARING_MESSAGE_NAME,
            type: EVENTS.startScreenSharing,
            screen_id: screenId
        });
    } catch (e) {
        logger.error(
            'Failed to send EndpointMessage via the datachannels',
            e);
    }
}

/**
 * Implements the remote screen sharing functionality.
 */
class RemoteScreenSharing extends EventEmitter {
    _initialized: boolean;

    /**
     * Constructs new instance.
     */
    constructor() {
        super();
        this._initialized = false;
        this._remoteScreenSharingEventsListener = this._onScreenSharingMessage.bind(this);
    }

    /**
     * Returns the remote screen sharing session initialized status.
     *
     * @returns {boolean} - True - if initialized and false otherwise.
     */
    get initialized(): boolean {
        return this._initialized;
    }

    /**
     * Initializes the remote screen sharing
     *
     * @returns {void}
     */
    init() {
        if (this._initialized
                || !APP.conference.isDesktopSharingEnabled) {
            return;
        }

        logger.log('Initializing remote screen sharing.');
        this._initialized = true;

        // Announce remote screen sharing support.
        APP.connection.addFeature(DISCO_REMOTE_SCREEN_SHARING_FEATURE, false);

        APP.conference.addConferenceListener(
            JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED,
            this._remoteScreenSharingEventsListener);
    }

    /**
     * Closes the remote screensharing.
     *
     * @returns {void}
     */
    close() {
        logger.log('Remote screen sharing closed.');

        APP.connection.removeFeature(DISCO_REMOTE_SCREEN_SHARING_FEATURE);

        APP.conference.removeConferenceListener(
            JitsiConferenceEvents.ENDPOINT_MESSAGE_RECEIVED,
            this._remoteScreenSharingEventsListener);
    }

    /**
     * Checks whether the passed user supports remote screen sharing or not.
     *
     * @param {JitsiParticipant} user - The user to be tested.
     * @returns {Promise<boolean>} The promise will be resolved with true if
     * the user supports remote control and with false if not.
     */
    checkUserRemoteScreenSharingSupport(user: Object) {
        return user.getFeatures().then(
            features => ({sharing:features.has(DISCO_REMOTE_SCREEN_SHARING_FEATURE), shared: features.has(DISCO_REMOTE_SCREEN_SHARED_FEATURE)}),
            () => false);
    }

    /**
     * Listens for data channel EndpointMessage. Handles only
     * remote screen sharing messages.
     *
     * @param {JitsiParticipant} participant - The controller participant.
     * @param {Object} message - EndpointMessage from the data channels.
     * @param {string} message.name - The function processes only messages with
     * name REMOTE_SCREEN_SHARING_MESSAGE_NAME.
     * @returns {void}
     */
    _onScreenSharingMessage(participant: Object, message: Object) {
        if (message.name !== REMOTE_SCREEN_SHARING_MESSAGE_NAME) {
            return;
        }

        if (message.type === EVENTS.startScreenSharing) {
            APP.conference.toggleScreenSharing(message.screen_id);

            return;
        }
    }
}

export default new RemoteScreenSharing();
