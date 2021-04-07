import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SendbirdService } from 'src/app/services/sendbird.service';

@Component({
    selector: 'app-calls',
    templateUrl: './calls.component.html',
    styleUrls: ['./calls.component.scss']
})
export class CallsComponent implements OnInit {

    /**
     * Flag to show / hide components
     */
    connected: boolean = false;

    /**
     * My video element
     */
    @ViewChild('local_video_element_id') local_video_element_id: ElementRef;

    /**
     * Remove video element
     */
    @ViewChild('remote_video_element_id') remote_video_element_id: ElementRef;

    /**
     * User id you want to call to
     */
    callToUserId: string;


    constructor(
        private sendbirdService: SendbirdService
    ) { }

    ngOnInit(): void {    
    }

    /**
     * Let's connect to SB
     */
    connectToSB() {
        this.sendbirdService.connectToSB(this.local_video_element_id, this.remote_video_element_id);
        this.connected = true;
    }

    /**
     * Make a call
     */
    makeCall() {
        this.sendbirdService.makeCall(this.callToUserId);
    }
    
}
