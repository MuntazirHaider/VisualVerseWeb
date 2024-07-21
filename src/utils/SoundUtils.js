import { Howl } from "howler";

const incomingRingtoneSound = process.env.REACT_APP_DEFAULT_INCOMING_RINGTONE;
const outgoingRingtoneSound = process.env.REACT_APP_DEFAULT_OUTGOING_RINGTONE;
const callEndedSound = process.env.REACT_APP_DEFAULT_CALLENDED_SOUND;
const notificationSound = process.env.REACT_APP_DEFAULT_NOTIFICATION_SOUND;

const incomingRingtone = new Howl({
    src: [incomingRingtoneSound],
    loop: true
});

const outgoingRingtone = new Howl({
    src: [outgoingRingtoneSound],
    loop: true
});

const callEnded = new Howl({
    src: [callEndedSound]
})

const notification = new Howl({
    src: [notificationSound]
});

export const playIncomingRingtone = () => {
    incomingRingtone.play();
}

export const pauseIncomingRingtone = () => {
    incomingRingtone.stop();
}

export const playOutgoingRingtone = () => {
    outgoingRingtone.play();
}

export const pauseOutgoingRingtone = () => {
    outgoingRingtone.stop();
}

export const playCallEnded = () => {
    callEnded.play();
}

export const pauseCallEnded = () => {
    callEnded.stop();
}

export const playNotification = () => {
    notification.play();
}

export const pauseNotification = () => {
    notification.stop();
}