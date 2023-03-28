
export class File {
    private _serverPath: string;
    private _hostName: string;
    private _fileName: string;

    constructor(serverPath: string, fileName: string) {
        this._serverPath = serverPath;
        this._hostName = this.getHostName(serverPath);
        this._fileName = fileName;
    }

    public set serverPath(newPath) {
        if (this.serverPath) throw Error("Cannot set the serverPath property of a file.");
        this._hostName = this.getHostName(newPath);
    }

    public get serverPath(): string {
        return this._serverPath
    }

    public set fileName(newName) {
        if (this._fileName) throw Error("Cannot set the serverPath property of a file.");
        this._fileName = newName;
    }

    public get fileName(): string {
        return this._fileName
    }

    public get hostName(): string {
        return this._hostName
    }

    private getHostName(serverPath: string): string {
        return serverPath.substring(serverPath.lastIndexOf("\\")+1);
    }

}