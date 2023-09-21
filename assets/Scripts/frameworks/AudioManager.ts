import { AudioClip, AudioSource, sys } from "cc";

export default class AudioManager {
    private __localStorageKey_BG: string = 'bgMusicFlag';
    private __localStorageKey_Effect: string = 'effectMusicFlag';

    private __effectOn: boolean = false;
    private __bgOn: boolean = false;
    private __curBg: AudioClip;
    private __bgVolume: number = 0;
    private __effectVolume: number = 0;

    private __bgSource: AudioSource = null;
    private __effectSource: AudioSource = null;

    public constructor() {
        this.__bgVolume = 0.1;
        this.__effectVolume = 0.5;
        this.setBgVolume(this.__bgVolume);
        this.setEffectVolume(this.__effectVolume);
        this.setDefaultSwitchState();
    }

    private setDefaultSwitchState() {
        let bgMusicFlag: string = sys.localStorage.getItem(this.__localStorageKey_BG);
        if(bgMusicFlag === null) {
            this.__bgOn = true;
        } else {
            this.__bgOn = bgMusicFlag === '1';
        }

        let effectMusicFlag: string = sys.localStorage.getItem(this.__localStorageKey_Effect);
        if(effectMusicFlag === null) {
            this.__effectOn = true;
        } else {
            this.__effectOn = effectMusicFlag === '1';
        }
    }
    setEffectVolume(__effectVolume: number) {
        throw new Error("Method not implemented.");
    }
    setBgVolume(__bgVolume: number) {
        throw new Error("Method not implemented.");
    }

    public playEffect(audioClip: AudioClip, loops: boolean = true) {
        if(this.__effectOn === false) {
            return;
        }

        this.__effectSource.loop = loops;
        this.__effectSource.clip = audioClip;
        this.__effectSource.play();
    }

    public stopEffect() {
        this.__effectSource.pause();
    }

    public playBg(audioClip: AudioClip) {
        if(this.__bgOn === false) {
            return; 
        }

        this.__bgSource.loop = true;
        this.__bgSource.clip = audioClip;
        this.__bgSource.play();
    }

    public stopBg() {
        this.__bgSource.pause();
    }
}