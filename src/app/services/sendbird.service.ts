import { ElementRef, Injectable } from '@angular/core';
import * as SendBird from 'sendbird';
import * as SendBirdCall from 'sendbird-calls';
import { DirectCall } from 'sendbird-calls';

@Injectable({
    providedIn: 'root'
})
export class SendbirdService {

    /**
     * My video element
     */
    local_video_element_id: ElementRef;

    /**
     * Remove video element
     */
    remote_video_element_id: ElementRef;

    /**
     * My Sendbird information
     */
    APP_ID = 'YOUR-APP-ID';
    USER_ID = 'YOUR-USER-ID';
    ACCESS_TOKEN = null;

    /**
     * Object to store an active call
     */
    currentCall: DirectCall;

    constructor() {     
    }

    /**
     * Start the process of connecting to Sendbird calls
     */
    connectToSB(local_video_element_id: ElementRef, remote_video_element_id: ElementRef) {
        this.local_video_element_id = local_video_element_id;
        this.remote_video_element_id = remote_video_element_id;
        this.connectCalls();    
    }

    connectCalls() {
        /**
         * Init Sendbird Calls
         */
        SendBirdCall.init(this.APP_ID);
        /**
         * Ask for video and audio permission
         */
        SendBirdCall.useMedia({ audio: true, video: true });
        /**
         * Authorize this user
         */
        const authOption = { 
            userId: this.USER_ID, 
            accessToken: this.ACCESS_TOKEN 
        };
        SendBirdCall.authenticate(authOption, (result: any, err: any) => {
            if (err) {
                alert('Error authorizing this user with Sendbird Calls!')
            } else {
                this.connectToSocket();
            }
        })
    }

    /**
     * Sendbird calls has its own socket to Sendbird
     */
    connectToSocket() {
        SendBirdCall.connectWebSocket()
            .then(() => {
                this.waitForCalls();
            })
            .catch(err => {
                console.dir(err);
                alert('Socket connection failed')
            });
    }

    /**
     * Let's wait for calls
     */
    waitForCalls() {
        SendBirdCall.addListener('UNIQUE_HANDLER_ID-123', {
            onRinging: (call: DirectCall) => {            
                /**
                 * Is ringing... let's accept at once
                 */
                console.log('Ringing...');
                this.currentCall = call;
                this.acceptCall();
                
                call. onEstablished = (call: DirectCall) => {
                    console.log('onEstablished');
                }
                call.onConnected = (call: DirectCall) => {
                    console.log('onConnected');
                }
                call.onEnded = (call: DirectCall) => {
                    console.log('onEnded');
                    this.currentCall = null;
                }            
                call.onRemoteAudioSettingsChanged = (call: DirectCall) => {
                    console.log('Remote audio settings changed');
                }
                call.onRemoteVideoSettingsChanged = (call: DirectCall) => {
                    console.log('Remote video settings changed');
                }  
            }, 
            onAudioInputDeviceChanged: (currentAudioInputDevice: InputDeviceInfo, availableAudioInputDevices: InputDeviceInfo[]) => {
                console.log('Local audio input device changed');
            },
            onAudioOutputDeviceChanged: (currentAudioOutputDevice: MediaDeviceInfo, availableAudioOutputDevices: MediaDeviceInfo[]) => {
                console.log('Local audio output device changed');
            },
            onVideoInputDeviceChanged: (currentVideoInputDevice: InputDeviceInfo, availableVideoInputDevices: InputDeviceInfo[]) => {
                console.log('Local video input device changed');
            }
        });
    }

    /**
     * Acept incoming call
     */
    acceptCall() {
        if (!this.currentCall) {
            return;
        }
        const acceptParams: SendBirdCall.AcceptParams = {
            callOption: {
                localMediaView: this.local_video_element_id.nativeElement,
                remoteMediaView: this.remote_video_element_id.nativeElement,
                videoEnabled: true,
                audioEnabled: true
            }
        };
        this.currentCall.accept(acceptParams);
    }

    /**
     * Let's make a call
     */
    makeCall(callToUserId: string) {
        if (!callToUserId) {
            return;
        }
        const dialParams = {
            userId: callToUserId,
            isVideoCall: true,
            callOption: {
                localMediaView: this.local_video_element_id.nativeElement,
                remoteMediaView: this.remote_video_element_id.nativeElement,
                videoEnabled: true,
                audioEnabled: true
            }
        };
        const call = SendBirdCall.dial(dialParams, (call: DirectCall, error) => {
            if (error) {
                console.dir(error);
                alert('Dial failed. Check logs')
            }    
        });    
        call.onEstablished = (call: DirectCall) => {
            console.log('onEstablished');
            this.currentCall = call;  
        };
        call.onConnected = (call: DirectCall) => {
            this.currentCall = call;
            console.log('onConnected');
        };
        call.onEnded = (call: DirectCall) => {
            console.log('onEnded');
            this.currentCall = null;
        };    
        call.onRemoteAudioSettingsChanged = (call) => {
            console.log('Remote user changed audio settings');
        };    
        call.onRemoteVideoSettingsChanged = (call) => {
            console.log('Remote user changed video settings');
        };
    }

    /**
     * Let's end this call
     */
    endCall() {
        if (!this.currentCall) {
            return;
        }
        this.currentCall.end();
    }

}
