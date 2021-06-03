import SparkMD5 from 'spark-md5'
import Mime from 'mime/Mime';
import mimelite from "mime/lite";

export enum State {
    READY = 'ready',
    INITIALIZED = 'initialized',
    INVALID = 'invalid',
    EXISTS = 'exists',
    UPLOAD_SUCCESS = 'upload_success',
    UPLOAD_FAIL = 'upload_fail',
    UPLOADING = 'uploading',
    QUEUED = 'queued',
    INTERRUPT = 'upload_interrupt',
    CANCELLED = 'cancelled'
}

class UploaderFile {
    private static index: number;
    // @ts-ignore
    public chunkBlob: Blob[];
    // @ts-ignore
    public id: string
    public name: string;
    public size: number;
    public type: string;
    public data: Date;
    public file: File;
    // @ts-ignore
    public ext: string;
    public chunkSize: number;
    public md5?: string;
    // @ts-ignore
    private chunks: number;
    private _state: string = State.READY;

    constructor(file: File, ext: string = "*", chunkSize: number = 2097152, checked: boolean = true, custom = {}) {
        this.chunkSize = chunkSize;
        this.name = file.name;
        this.size = file.size;
        this.type = file.type;
        this.data = new Date(file.lastModified);
        this.file = file;

        this.getExtra();
        if (!checked||this.validate(ext, custom)) {
            this.getMd5();
        } else {
            this.setState(State.INVALID);
        }

    }

    getExtra() {
        this.id = "FILE_" + (UploaderFile.index++);
        this.chunks = Math.ceil(this.file.size / this.chunkSize);
        this.chunkBlob = new Array<Blob>(this.chunks);

        this.ext = this.file.name.substring(this.file.name.lastIndexOf('.') + 1);

    }

    public split(index: number, chunkSize: number = this.chunkSize): Blob {
        if (typeof this.chunkBlob === 'undefined') {
            //@ts-ignore;
            const blobSlice: ((file: File, start: number, end: number) => Blob) = File['mozSlice'] || File['webkitSlice'] || File['slice'],
                start: number = index * chunkSize,
                end: number = start + chunkSize >= this.file.size ? this.file.size : start + chunkSize;
            (this.chunkBlob as Array<Blob>)[index] = blobSlice(this.file, start, end) as Blob;
        }
        return this.chunkBlob[index];
    }

    public allChunks(chunkSize: number = this.chunkSize): Array<Blob> {
        const blobs: Array<Blob> = [];
        for (let currentChunk = 0; currentChunk < this.chunks; currentChunk++) {
            blobs.push(this.split(currentChunk, chunkSize));
        }
        return blobs;
    }

    setState(value: State): UploaderFile {
        this._state = value;
        return this;
    }

    get state(): string {
        return this._state;
    }

    validate(ext: string, customMIME: Record<string, Array<string>>): boolean {
        if (ext === '*') {
            return true
        }
        const extList: Array<string> = ext.split(',');
        const custommime = new Mime(customMIME);
        const mimes: Array<string> = [];
        const exts: Array<string> = [];

        extList.forEach(res => {
            if (res.includes('/')) {
                mimes.push(res);
            } else {
                if (res.indexOf('.') === 0) {
                    res = res.substring(1);
                }
                let m = custommime.getType(res) || mimelite.getType(res);
                if (m !== null) {
                    mimes.push(m);
                }
            }
        });
        mimes.forEach(v => {
            const m = custommime.getType(v) || custommime.getType(v);
            if (m !== null) {
                exts.push(m);
            }
        });
        // 检查MIME
        if(!this.checkMime(mimes)){
            return false;
        }
        // 检查后缀
        if(!this.checkExt(mimes)){
            return false;
        }

        // 检查MIME与后缀是否一致
        let m=custommime.getExtension(this.type)||mimelite.getExtension(this.type)
        if(m==null){
            return false
        }
        return m===this.ext;

    }

    private getMd5(): string {
        if (typeof this.md5 === 'undefined') {
            const fileReader: FileReader = new FileReader(), spark: SparkMD5 = new SparkMD5(), arr = this.allChunks();
            let i = 0;
            fileReader.onload = () => {
                spark.appendBinary(fileReader.result as string);
                if (arr.length === i) {
                    this.md5 = spark.end().toUpperCase();
                    this.setState(State.INITIALIZED);
                }
            };
            arr.forEach(value => {
                i++;
                fileReader.readAsBinaryString(value);
            });
        }
        return this.md5 as string;
    }

    private checkMime(mimes: Array<string>) {
        return mimes.some(v => {
            switch (v) {
                case "text/*": {
                    return this.type.indexOf('text/')===0;
                }
                case "image/*": {
                    return this.type.indexOf('image/')===0;
                }
                case "audio/*": {
                    return this.type.indexOf('audio/')===0;
                }
                case "video/*": {
                    return this.type.indexOf('video/')===0;
                }
                case "application/*": {
                    return this.type.indexOf('application/')===0;
                }
                default: {
                    return this.type===v;
                }
            }
        })
    }
    private checkExt(exts:Array<string>){
       return  exts.some(v=>{
           return this.type===v;
        })
    }

}