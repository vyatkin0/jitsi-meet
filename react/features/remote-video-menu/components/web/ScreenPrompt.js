import React, { Component } from 'react';

import { Dialog } from '../../../base/dialog';
import PropTypes from 'prop-types';
import { FieldTextStateless as TextField } from '@atlaskit/field-text';
import { connect } from 'react-redux';
import { toggleRemoteScreenSharing }
    from '../../../../../modules/remotescreensharing/RemoteScreenSharing';
import { translate } from '../../../base/i18n';

/**
 * Implements a React {@code Component} for displaying a dialog with an field
 * for setting shared display id.
 *
 * @extends Component
 */
class ScreenPrompt extends Component {
    /**
     * {@code ScreenPrompt} component's property types.
     *
     * @static
     */
    static propTypes = {
        /**
         * The ID of the remote participant.
         */
        remoteId: PropTypes.string
    };

    /**
     * Initializes a new {@code ScreenPrompt} instance.
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
                onCancel = { this._onCancel }
                onSubmit = { this._onSubmit }
                titleString = 'Screen id '
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
     * Updates the entered display id.
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
     * Closes the dialog.
     *
     * @private
     * @returns {boolean} Returns true to close the dialog.
     */
    _onCancel() {
        return true;
    }

    /**
     * Sends 'start screen sharing' to remote participant.
     *
     * @private
     * @returns {void}
     */
    _onSubmit() {
        const { screenId } = this.state;

        toggleRemoteScreenSharing(this.props.remoteId, screenId);

        return true;
    }
}

export default translate(connect()(ScreenPrompt));
