import { _decorator, Component, error, JsonAsset, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ConfigManager')
export class ConfigManager extends Component {
    @property([JsonAsset])
    configFiles: JsonAsset[] = [];

    private __configData: { [key: string]: any} = {};

    protected onLoad(): void {
        this.loadConfigData();
    }

    private loadConfigData() {
        for(const config of this.configFiles) {
            const key = config.name;
            this.__configData[key] = config.json;
            log(`Config data loaded for key "${key}":`, this.__configData[key]);

        }
    }

    public getConfig(key: string) {
        if(this.__configData[key]) {
            return this.__configData[key];
        } else {
            error(`Config key not found: ${key}`);
            return null;
        }
    }
}