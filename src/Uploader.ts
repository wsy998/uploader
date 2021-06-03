import {UploaderConfig} from "./types/UploaderConfig";
import {getElement} from "./util";

class Uploader {
    private _event: Record<string, Function> = {};

    private config: UploaderConfig;
    // @ts-ignore
    private inputFileElement: HTMLInputElement;

    constructor(config: UploaderConfig) {
        this.config = config;
        this.initFileElement()
        this.initPick()
        this.initDrop();
    }

    initFileElement() {
        this.inputFileElement = document.createElement('input');
        this.inputFileElement.multiple = this.config.multiple || false;
        this.inputFileElement.accept = this.config.ext || "*"
        this.inputFileElement.type = 'file'
        this.inputFileElement.addEventListener('change', () => {
            // q
        })
        getElement(this.config.container)?.appendChild(this.inputFileElement);
    }

    initPick() {
        getElement(this.config.pick)?.addEventListener('click', () => {
            this.inputFileElement.click()
        })
    }

    initDrop() {
        const dropZone = getElement(this.config.drop);
        // dropZone?.addEventListener('paste')
        dropZone?.addEventListener('dragend', function () {
            console.log(this)
        });
        dropZone?.addEventListener("dragenter", function (e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);

        dropZone?.addEventListener("dragover", function (e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);

        dropZone?.addEventListener("dragleave", function (e) {
            e.preventDefault();
            e.stopPropagation();
        }, false);

        dropZone?.addEventListener("drop", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const df = e.dataTransfer;
            const dropFiles = []; // 存放拖拽的文件对象

            if (df?.items !== undefined) {
                // Chrome有items属性，对Chrome的单独处理
                for (let i = 0; i < df.items.length; i++) {
                    const item = df.items[i];
                    // 用webkitGetAsEntry禁止上传目录
                    if (item.kind === "file" && item.webkitGetAsEntry().isFile) {
                        const file = item.getAsFile();
                        dropFiles.push(file);
                    }
                }
            } else {
                //@ts-ignore
                for (let i = 0; i < df?.files.length; i++) {
                    const dropFile = df?.files[i];
                    // @ts-ignore
                    if (dropFile.type) {
                        // 如果type不是空串，一定是文件
                        dropFiles.push(dropFile);
                    } else {
                        try {
                            const fileReader = new FileReader();
                            // @ts-ignore
                            fileReader.readAsDataURL(dropFile.slice(0, 3));

                            fileReader.onload = () => {
                                console.log(e, 'load');
                                dropFiles.push(dropFile);
                            }
                            fileReader.onerror = () => {
                                console.log(e, 'error，不可以上传文件夹');
                            }

                        } catch (e) {
                            console.log(e, 'catch error，不可以上传文件夹');
                        }
                    }
                }
            }
            console.log(dropFiles);

        });
    }

    on(name: string, handler: Function) {
        this._event.push(name, handler)
    }

    emit(name: string, ...args: any) {
        this._event[name](...args);
    }


}

new Uploader({
    container: '#app',
    drop: '#container'


})
