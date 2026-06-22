import axios from "axios";

export default class WHEPClient {
    private peerConnection!: RTCPeerConnection;
    private mediaStream!: MediaStream;
    private videoElement!: HTMLVideoElement

    constructor(private url: string) {
        this.init();
    }
    setUrl(url: string) {
        this.url = url;
    }
    init() {
        this.mediaStream = new MediaStream();
        this.peerConnection = new RTCPeerConnection({ iceServers: [] });
        if (!this.videoElement) {
            this.videoElement = document.createElement('video')
            this.videoElement.autoplay = true
            this.videoElement.controls = true
        }
        this.videoElement.srcObject = null
        this.peerConnection.addTransceiver("video", { direction: "recvonly" });
        this.peerConnection.addTransceiver("audio", { direction: "recvonly" });
        this.peerConnection.addEventListener("track", ({ track }) => {
            const currentTracks = this.mediaStream.getTracks();
            const hasVideoTrack = currentTracks.some((track) => track.kind === "video");
            const hasAudioTrack = currentTracks.some((track) => track.kind === "audio");
            switch (track.kind) {
                case "video":
                    if (!hasVideoTrack) {
                        this.mediaStream.addTrack(track);
                    }
                    break;
                case "audio":
                    if (!hasAudioTrack) {
                        this.mediaStream.addTrack(track);
                    }
                    break;
                default:
                    console.log("got unknown track " + track);
            }
        });
        this.peerConnection.addEventListener("connectionstatechange", () => {
            switch (this.peerConnection.connectionState) {
                case "connected":
                    if (!this.videoElement.srcObject) {
                        this.videoElement.srcObject = this.mediaStream;
                        this.videoElement.muted = true;
                        this.videoElement.play();
                    }
                    break;
                case "disconnected":
                case "failed":
                case "closed":
                    this.init();
                    break;
                default:
                    break;
            }
        });
        this.negotiate();
    }
    async negotiate() {
        const offer = await this.peerConnection.createOffer();
        const descr = await this.awaitICEGathering(offer); // offer with ICE description.
        while (this.peerConnection.connectionState !== "closed") {
            try {
                const response = await axios.post(this.url, descr.sdp, { headers: { "content-type": "application/sdp" } });
                if (response.status == 201) {
                    const remoteDescr = new RTCSessionDescription({ type: "answer", sdp: response.data });
                    await this.peerConnection.setRemoteDescription(remoteDescr);
                    break;
                }
            } catch (e: any) {
                console.log("failed to negotiate, retrying......");
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // delay
        }
    }
    awaitICEGathering(offer: RTCLocalSessionDescriptionInit) {
        return new Promise<RTCSessionDescription>(async (resolve) => {
            // [before set local description]
            // event listener for ICE gathering state change
            this.peerConnection.addEventListener('icegatheringstatechange', () => {
                if (this.peerConnection.iceGatheringState === "complete") {
                    console.log('ice gathering complete');
                    resolve(this.peerConnection.localDescription!);
                }
            });
            // set local description
            await this.peerConnection.setLocalDescription(offer);
            // [after set local description]
            // timeout for ICE gathering
            setTimeout(() => resolve(this.peerConnection.localDescription!), 1000);
        });
    }
    dom() {
        return this.videoElement;
    }
}
