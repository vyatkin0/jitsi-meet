import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FieldTextStateless as TextField } from '@atlaskit/field-text';
import { Dialog } from '../../base/dialog';

import { translate } from '../../base/i18n';

import {
    EVENTS,
    REMOTE_CONTROL_MESSAGE_NAME
} from '../../../../service/remotecontrol/Constants';

const logger = require('jitsi-meet-logger').getLogger(__filename);

/**
 * Implements a React {@code Component} for displaying a dialog with an field
 * for setting the local participant's display name.
 *
 * @extends Component
 */
class ScreenPrompt extends Component {
    /**
     * {@code DisplayNamePrompt} component's property types.
     *
     * @static
     */

    /**
     * Initializes a new {@code DisplayNamePrompt} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        this.state = {
            /**
             * The screen id to show in the screen text field.
             *
             * @type {string}
             */
            screenId: ''
        };

        // Bind event handlers so they are only bound once per instance.
        this._onScreenChange = this._onScreenChange.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._onCancel = this._onCancel.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        return (
            <Dialog
                isModal = { false }
                onCancel = { this._onCancel }
                onSubmit = { this._onSubmit }
                titleKey = 'Screen id '
                width = 'small'>
                <TextField
                    autoFocus = { true }
                    compact = { true }
                    label = 'Enter screen id'
                    name = 'screenId'
                    onChange = { this._onScreenChange }
                    shouldFitContainer = { true }
                    type = 'text'
                    value = { this.state.screenId } />
            </Dialog>);
    }

    /**
     * Updates the entered display name.
     *
     * @param {Object} event - The DOM event triggered from the entered display
     * name value having changed.
     * @private
     * @returns {void}
     */
    _onScreenChange(event) {
        this.setState({
            screenId: event.target.value
        });
    }

    /**
     * Dispatches an action notifying feedback was not submitted. The submitted
     * score will have one added as the rest of the app does not expect 0
     * indexing.
     *
     * @private
     * @returns {boolean} Returns true to close the dialog.
     */
    _onCancel() {
        return true;
    }


    /**
     * Dispatches an action to update the local participant's display name. A
     * name must be entered for the action to dispatch.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        const { screenId } = this.state;

        //if (!screenId.trim()) {
        //    return false;
        //}

        try {
            APP.conference.sendEndpointMessage(this.props.remoteId, {
                name: REMOTE_CONTROL_MESSAGE_NAME,
                type: EVENTS.startScreenSharing,
                screen_id: screenId
            });
        } catch (e) {
            logger.error(
                'Failed to send EndpointMessage via the datachannels',
                e);
        }

        return true;
    }
}

export default translate(connect()(ScreenPrompt));