/* @flow */

import EventEmitter from 'events';
import { getLogger } from 'jitsi-meet-logger';

import {
    JitsiConferenceEvents
} from '../../react/features/base/lib-jitsi-meet';

/**
 * The value for the "var" attribute of feature tag in disco-info packets.
 */
export const DISCO_REMOTE_SCREEN_SHARING_FEATURE
    = 'http://jitsi.org/meet/remotescreensharing';
export const EVENTS = {
    startScreenSharing: 'startScreenSharing'
};


/**
 * The type of remote control messages.
 */
const REMOTE_SCREEN_SHARING_MESSAGE_NAME = 'remote-screen-sharing';

const logger = getLogger(__filename);

declare var APP: Object;

/**
 * Listens for data channel EndpointMessage. Handles only remote screen sharing
 * messages.
 * 
 * @param {JitsiParticipant} participant - The controller participant.
 * @param {Object} message - EndpointMessage from the data channels.
 * @param {string} message.name - The function processes only messages with
 * name REMOTE_SCREEN_SHARING_MESSAGE_NAME.
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
 * Checks whether the passed user supports remote control or not.
 *
 * @param {JitsiParticipant} user - The user to be tested.
 * @returns {Promise<boolean>} The promise will be resolved with true if
 * the user supports remote control and with false if not.
 */
export function checkUserRemoteScreenSharingSupport(user: Object) {
    return user.getFeatures().then(
        features => features.has(DISCO_REMOTE_SCREEN_SHARING_FEATURE),
        () => false);
}

/**
 * Implements the remote control functionality.
 */
class RemoteScreenSharing extends EventEmitter {
    _initialized: boolean;

    /**
     * Constructs new instance. Creates controller and receiver properties.
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
     * Initializes the remote control - checks if the remote control should be
     * enabled or not.
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
        APP.connection.addFeature(DISCO_REMOTE_SCREEN_SHARING_FEATURE, true);

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
