// @flow

import { appNavigate } from '../app';
import {
    CONFERENCE_JOINED,
    KICKED_OUT,
    VIDEO_QUALITY_LEVELS,
    conferenceFailed,
    setPreferredReceiverVideoQuality,
    setAudioOnly
} from '../base/conference';
import { JitsiConferenceEvents } from '../base/lib-jitsi-meet';
import { SET_REDUCED_UI } from '../base/responsive-ui';
import { MiddlewareRegistry } from '../base/redux';
import { setFilmstripEnabled } from '../filmstrip';
import { setToolboxEnabled } from '../toolbox';
import jitsiLocalStorage from '../../../modules/util/JitsiLocalStorage';

MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {
    case CONFERENCE_JOINED:
    case SET_REDUCED_UI: {
        const { dispatch, getState } = store;
        const state = getState();
        const { reducedUI } = state['features/base/responsive-ui'];

        dispatch(setToolboxEnabled(!reducedUI));
        dispatch(setFilmstripEnabled(!reducedUI));

        const { conference } = state['features/base/conference'];

        if (conference.audioOnly) {
            break;
        } else {
            const audioOnly = jitsiLocalStorage.getItem('audioOnly') === 'true';

            dispatch(setAudioOnly(audioOnly));

            if (audioOnly) {
                break;
            }
        }

        if (reducedUI) {
            dispatch(setPreferredReceiverVideoQuality(
                VIDEO_QUALITY_LEVELS.LOW));
            break;
        }

        let preferredReceiverVideoQuality
        = conference.preferredReceiverVideoQuality;

        if (!preferredReceiverVideoQuality) {
            preferredReceiverVideoQuality = Number(jitsiLocalStorage.getItem(
                'preferredReceiverVideoQuality'));

            dispatch(
                setPreferredReceiverVideoQuality(
                        preferredReceiverVideoQuality
                        || VIDEO_QUALITY_LEVELS.HIGH));
        }

        break;
    }

    case KICKED_OUT: {
        const { dispatch } = store;

        dispatch(
            conferenceFailed(action.conference, JitsiConferenceEvents.KICKED));
        dispatch(appNavigate(undefined));
        break;
    }
    }

    return result;
});
